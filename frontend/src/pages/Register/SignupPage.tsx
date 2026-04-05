import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone, Sparkles, Compass, CheckCircle, AlertCircle } from 'lucide-react';
import { authApi } from '../../apis/authApi';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({ 
    name: '',  // Changed from fullName to name
    email: '', 
    phone: '', 
    password: '', 
    confirmPassword: '', 
    agreeToTerms: false 
  });
  const [errors, setErrors] = useState<any>({});

  const validateStep1 = () => {
    const newErrors: any = {};
    if (!formData.name) newErrors.name = 'Full name is required';  // Changed from fullName to name
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Must be 10 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: any = {};
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) newErrors.password = 'Must contain uppercase, lowercase & number';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else {
      if (validateStep2()) {
        setIsLoading(true);
        const result = await authApi.register({
          name: formData.name,  // Changed from fullName to name
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });
        
        if (result.success) {
          navigate('/');
        } else {
          alert(result.error || 'Registration failed');
        }
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignup = () => {
    authApi.googleLogin();
  };

  const benefits = ['AI-powered personalized itineraries', 'Save up to 40% on bookings', 'Real-time travel updates', '24/7 customer support'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCFB] via-white to-[#D6C7B1]/10 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#8BA889]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D6C7B1]/10 rounded-full blur-3xl" />
        <motion.div animate={{ y: [0, -20, 0], rotate: [0, -10, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-40 left-20 text-[#8BA889]/20 hidden lg:block">
          <Sparkles size={100} />
        </motion.div>
      </div>

      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8">
        {/* Left Side - Benefits */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:block">
          <div className="bg-gradient-to-br from-[#4A5D4B] to-[#8BA889] rounded-3xl p-8 text-white h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold">BhramanAI</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">Start Your Journey Today</h2>
              <p className="text-white/80 mb-8">Join thousands of travelers who trust BhramanAI for their adventures</p>
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-white/80" />
                    <span>{benefit}</span>
                  </motion.div>
                ))}
              </div>
              <div className="border-t border-white/20 pt-8 mt-8">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((_, idx) => (
                      <div key={idx} className="w-10 h-10 rounded-full border-2 border-white bg-gray-300 overflow-hidden">
                        <img src={`https://randomuser.me/api/portraits/${idx % 2 === 0 ? 'women' : 'men'}/${idx + 1}.jpg`} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold">50,000+ Active Travelers</p>
                    <p className="text-sm text-white/70">Join the community</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Signup Form */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full">
          <div className="lg:hidden text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#4A5D4B] to-[#8BA889] rounded-xl flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] bg-clip-text text-transparent">BhramanAI</span>
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-[#D6C7B1]/20">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-[#2D2D2D] mb-2">Create Account</h1>
              <p className="text-[#2D2D2D]/60">Join BhramanAI and start planning</p>
            </div>

            {/* Google Signup Button */}
            {currentStep === 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoogleSignup}
                  className="w-full py-3 mb-6 border-2 border-[#D6C7B1]/30 rounded-xl font-semibold flex items-center justify-center gap-3 bg-white hover:bg-[#FDFCFB] transition-all text-[#2D2D2D]"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335"/>
                  </svg>
                  Sign up with Google
                </motion.button>

                <div className="relative flex items-center py-2 mb-6">
                  <div className="flex-grow border-t border-[#D6C7B1]/20"></div>
                  <span className="flex-shrink mx-4 text-[#2D2D2D]/40 text-sm">or sign up with email</span>
                  <div className="flex-grow border-t border-[#D6C7B1]/20"></div>
                </div>
              </>
            )}

            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8">
              {[1, 2].map((step) => (
                <div key={step} className="flex-1 flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${currentStep >= step ? 'bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {step}
                  </div>
                  {step === 1 && <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${currentStep > step ? 'bg-gradient-to-r from-[#4A5D4B] to-[#8BA889]' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                    {[
                      { icon: User, label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Doe' },  // Changed key from fullName to name
                      { icon: Mail, label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@example.com' },
                      { icon: Phone, label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '9876543210' }
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-[#2D2D2D] mb-2">{field.label}</label>
                        <div className="relative">
                          <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2D2D2D]/40" />
                          <input 
                            type={field.type} 
                            value={formData[field.key as keyof typeof formData] as string} 
                            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors[field.key] ? 'border-red-500' : 'border-gray-200 focus:border-[#8BA889]'}`}
                            placeholder={field.placeholder} 
                          />
                        </div>
                        {errors[field.key] && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} /> {errors[field.key]}</p>}
                      </div>
                    ))}
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full py-3 bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                      Continue <ArrowRight size={18} />
                    </motion.button>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2D2D2D] mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2D2D2D]/40" />
                        <input 
                          type={showPassword ? 'text' : 'password'} 
                          value={formData.password} 
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.password ? 'border-red-500' : 'border-gray-200 focus:border-[#8BA889]'}`}
                          placeholder="Create a strong password" 
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                          {showPassword ? <EyeOff size={20} className="text-[#2D2D2D]/40" /> : <Eye size={20} className="text-[#2D2D2D]/40" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} /> {errors.password}</p>}
                      <p className="text-xs text-[#2D2D2D]/50 mt-1">Must contain uppercase, lowercase, and number</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#2D2D2D] mb-2">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2D2D2D]/40" />
                        <input 
                          type={showConfirmPassword ? 'text' : 'password'} 
                          value={formData.confirmPassword} 
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200 focus:border-[#8BA889]'}`}
                          placeholder="Confirm your password" 
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                          {showConfirmPassword ? <EyeOff size={20} className="text-[#2D2D2D]/40" /> : <Eye size={20} className="text-[#2D2D2D]/40" />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} /> {errors.confirmPassword}</p>}
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.agreeToTerms} 
                        onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-[#8BA889] focus:ring-[#8BA889]" 
                      />
                      <span className="text-sm text-[#2D2D2D]/70">
                        I agree to the <Link to="/terms" className="text-[#8BA889] hover:underline">Terms</Link> & <Link to="/privacy" className="text-[#8BA889] hover:underline">Privacy</Link>
                      </span>
                    </label>
                    {errors.agreeToTerms && <p className="text-red-500 text-sm flex items-center gap-1"><AlertCircle size={14} /> {errors.agreeToTerms}</p>}

                    <div className="flex gap-3 pt-2">
                      <motion.button 
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }} 
                        type="button" 
                        onClick={() => setCurrentStep(1)}
                        className="flex-1 py-3 border-2 border-gray-200 text-[#2D2D2D] rounded-xl font-semibold hover:bg-gray-50 transition-all"
                      >
                        Back
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.02 }} 
                        whileTap={{ scale: 0.98 }} 
                        type="submit" 
                        disabled={isLoading}
                        className="flex-1 py-3 bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Create Account <ArrowRight size={18} /></>}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[#2D2D2D]/60">Already have an account? <Link to="/login" className="text-[#8BA889] font-semibold hover:text-[#4A5D4B] transition-colors">Sign in</Link></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;