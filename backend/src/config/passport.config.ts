import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserModel } from '../database/models/user.model.js';

// Load environment variables
dotenv.config();

// Debug: Check if credentials are loaded
console.log('Checking Google OAuth credentials:');
console.log('GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy - Add validation
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('❌ Google OAuth credentials are missing! Please check your .env file');
  console.error('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing');
  console.error('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing');
} else {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      scope: ['openid', 'profile', 'email'] // Updated scope for better compatibility
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google profile received:', profile.id);
        
        const email = profile.emails?.[0]?.value;
        if (!email) {
          console.error('No email found in Google profile');
          return done(new Error('No email found from Google'), undefined);
        }

        console.log('Google email:', email);
        console.log('Google name:', profile.displayName);

        // Find or create user
        let user = await UserModel.findOne({ email });
        
        if (!user) {
          // Check if user exists with googleId
          user = await UserModel.findOne({ googleId: profile.id });
        }
        
        if (!user) {
          // Create new user object
          const userData: any = {
            email: email,
            name: profile.displayName,
            googleId: profile.id,
            provider: 'google'
          };
          
          // Only add avatar if it exists
          if (profile.photos?.[0]?.value) {
            userData.avatar = profile.photos[0].value;
          }
          
          user = await UserModel.create(userData);
          console.log(`✅ New user created: ${user.email}`);
        } else {
          // Update existing user if needed
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          console.log(`✅ User logged in: ${user.email}`);
        }
        
        return done(null, user);
      } catch (error) {
        console.error('Google OAuth Error:', error);
        return done(error as Error, undefined);
      }
    }
  ));
  console.log('✅ Google OAuth strategy configured');
}

export default passport;