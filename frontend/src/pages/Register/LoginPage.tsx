import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Compass, CheckCircle, AlertCircle } from 'lucide-react';
import { authApi } from '../../apis/authApi';

const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335"/>
  </svg>
);

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    const result = await authApi.login({
      email: formData.email,
      password: formData.password,
      rememberMe: formData.rememberMe
    });
    
    if (result.success) {
      navigate('/');
    } else {
      alert(result.error || 'Login failed');
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = () => {
    authApi.googleLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCFB] via-white to-[#D6C7B1]/10 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* ... rest of the JSX remains the same as before ... */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#8BA889]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D6C7B1]/10 rounded-full blur-3xl" />
        <motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-40 right-20 text-[#8BA889]/20 hidden lg:block">
          <Compass size={120} />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 bg-gradient-to-br from-[#4A5D4B] to-[#8BA889] rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] bg-clip-text text-transparent font-serif">BhramanAI</span>
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#2D2D2D] mb-2 font-serif">Welcome Back</h1>
            <p className="text-[#2D2D2D]/60">Sign in to continue your journey</p>
          </div>

          <div className="space-y-4">
            <motion.button 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3 border-2 border-[#D6C7B1]/30 rounded-xl font-semibold flex items-center justify-center gap-3 bg-white hover:bg-[#FDFCFB] transition-all text-[#2D2D2D]"
            >
              <GoogleIcon />
              Continue with Google
            </motion.button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-[#D6C7B1]/20"></div>
              <span className="flex-shrink mx-4 text-[#2D2D2D]/40 text-sm">or login with email</span>
              <div className="flex-grow border-t border-[#D6C7B1]/20"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2D2D2D]/40" />
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl bg-[#FDFCFB]/50 focus:outline-none transition-all ${errors.email ? 'border-red-500' : 'border-[#D6C7B1]/20 focus:border-[#8BA889]'}`}
                    placeholder="you@example.com" 
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} /> {errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2D2D2D]/40" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={formData.password} 
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl bg-[#FDFCFB]/50 focus:outline-none transition-all ${errors.password ? 'border-red-500' : 'border-[#D6C7B1]/20 focus:border-[#8BA889]'}`}
                    placeholder="Enter your password" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showPassword ? <EyeOff size={20} className="text-[#2D2D2D]/40" /> : <Eye size={20} className="text-[#2D2D2D]/40" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} /> {errors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.rememberMe} 
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    className="w-4 h-4 rounded border-[#D6C7B1]/40 text-[#8BA889] focus:ring-[#8BA889]" 
                  />
                  <span className="text-sm text-[#2D2D2D]/60">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-[#8BA889] hover:text-[#4A5D4B] transition-colors">Forgot password?</Link>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Sign In <ArrowRight size={18} /></>}
              </motion.button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[#2D2D2D]/60">Don't have an account? <Link to="/signup" className="text-[#8BA889] font-semibold hover:text-[#4A5D4B] transition-colors">Sign up</Link></p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          {[{ text: 'AI-Powered', icon: Sparkles }, { text: 'Secure Auth', icon: Lock }, { text: 'Verified', icon: CheckCircle }].map((feature, idx) => (
            <div key={idx} className="text-center">
              <feature.icon className="w-5 h-5 text-[#8BA889] mx-auto mb-2 opacity-60" />
              <p className="text-[10px] uppercase tracking-widest text-[#2D2D2D]/40 font-bold">{feature.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;