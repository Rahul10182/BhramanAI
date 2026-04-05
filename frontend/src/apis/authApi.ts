// frontend/src/apis/authApi.ts

const API_URL = 'http://localhost:5000/api';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  provider?: 'local' | 'google';
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;  // Changed from fullName to name
  email: string;
  phone?: string;
  password: string;
}

class AuthApi {
  private static instance: AuthApi;
  
  private constructor() {}
  
  static getInstance(): AuthApi {
    if (!AuthApi.instance) {
      AuthApi.instance = new AuthApi();
    }
    return AuthApi.instance;
  }

  // Login with email/password
  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        const user: User = {
          id: data.id,
          email: data.email,
          name: data.name,
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        
        return { success: true, user };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error - Make sure backend is running' };
    }
  }

  // Register new user
  async register(userData: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const payload = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone
      };
      
      console.log('Sending registration payload:', payload);
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (response.ok) {
        const user: User = {
          id: data.id,
          email: data.email,
          name: data.name,
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        
        return { success: true, user };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error - Make sure backend is running' };
    }
  }

  // Get current user from session
  async getCurrentUser(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const user: User = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          avatar: data.user.avatar,
          provider: data.user.provider,
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        
        return { success: true, user };
      } else {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          return { success: true, user: JSON.parse(storedUser) };
        }
        return { success: false, error: 'Not authenticated' };
      }
    } catch (error) {
      console.error('Get user error:', error);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return { success: true, user: JSON.parse(storedUser) };
      }
      return { success: false, error: 'Network error' };
    }
  }

  // Logout user
  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      localStorage.removeItem('user');
      
      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: 'Logout failed' };
      }
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('user');
      return { success: false, error: 'Network error' };
    }
  }

  // Google OAuth login
  googleLogin(): void {
    window.location.href = `${API_URL}/auth/google`;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return localStorage.getItem('user') !== null;
  }

  // Get stored user
  getStoredUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

export const authApi = AuthApi.getInstance();
export type { User as UserType };