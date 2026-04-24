import React from 'react';
import { motion } from 'framer-motion';
import { ShieldX, LogIn, Home, ArrowLeft, Lock, UserX } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page they were trying to access
  const from = (location.state as any)?.from || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCFB] via-white to-[#D6C7B1]/10 flex items-center justify-center relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] right-[15%] w-[400px] h-[400px] bg-gradient-to-br from-amber-200/12 to-orange-200/8 rounded-full blur-3xl" />
        <div className="absolute bottom-[15%] left-[10%] w-[450px] h-[450px] bg-gradient-to-tr from-[#D6C7B1]/15 to-[#8BA889]/8 rounded-full blur-3xl" />
      </div>

      {/* Animated lock particles */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: `${25 + i * 18}%`, left: `${12 + i * 22}%` }}
          animate={{ y: [0, -15, 0], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 3 + i * 0.6, repeat: Infinity, delay: i * 0.4 }}
        >
          <Lock size={14} className="text-amber-300/40" />
        </motion.div>
      ))}

      <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
        {/* Shield Animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6"
        >
          <motion.div
            animate={{ rotateY: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block"
          >
            <div className="relative w-28 h-28 mx-auto">
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-amber-400/20 rounded-full"
              />
              <div className="relative w-28 h-28 bg-gradient-to-br from-amber-100 to-orange-50 rounded-3xl flex items-center justify-center shadow-xl shadow-amber-200/30 border border-amber-200/40">
                <ShieldX className="w-14 h-14 text-amber-500" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-[#2D2D2D] mb-3 tracking-tight">
            Authentication Required
          </h1>
          <p className="text-lg text-[#2D2D2D]/55 mb-4 max-w-md mx-auto leading-relaxed">
            You must sign in before accessing this page. Your journey awaits — just one step away.
          </p>

          {from && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-6 px-4 py-3 bg-amber-50/80 border border-amber-200/40 rounded-xl inline-flex items-center gap-2"
            >
              <Lock size={14} className="text-amber-500" />
              <p className="text-sm text-amber-700/80">
                Requested page: <span className="font-mono font-semibold">{from}</span>
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2.5 px-6 py-3.5 bg-white/80 backdrop-blur-sm border border-[#D6C7B1]/40 rounded-2xl font-semibold text-[#2D2D2D] hover:shadow-lg hover:border-amber-300/50 transition-all duration-300"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
            Go Back
          </button>
          <button
            onClick={() => navigate('/login', { state: { from: from || location.pathname } })}
            className="group flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-semibold shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            <LogIn size={18} />
            Sign In
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="group flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] text-white rounded-2xl font-semibold shadow-lg shadow-[#4A5D4B]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            <UserX size={18} />
            Create Account
          </button>
        </motion.div>

        {/* Info bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 pt-8 border-t border-[#D6C7B1]/20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#8BA889]/8 border border-[#8BA889]/15 rounded-xl">
            <ShieldX size={14} className="text-[#4A5D4B]/60" />
            <p className="text-xs text-[#2D2D2D]/45 font-medium">Your data is secure — sign in to continue</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
