import React from 'react';
import { motion } from 'framer-motion';
import { ServerCrash, Home, ArrowLeft, RefreshCw, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ServerErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCFB] via-white to-[#D6C7B1]/10 flex items-center justify-center relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[15%] right-[20%] w-[400px] h-[400px] bg-gradient-to-br from-violet-200/15 to-purple-200/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[15%] left-[10%] w-[450px] h-[450px] bg-gradient-to-tr from-[#D6C7B1]/15 to-[#8BA889]/8 rounded-full blur-3xl" />
        <div className="absolute top-[50%] left-[60%] w-[300px] h-[300px] bg-gradient-to-bl from-rose-100/10 to-violet-100/10 rounded-full blur-3xl" />
      </div>

      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-violet-300/30"
          style={{ top: `${20 + i * 14}%`, left: `${8 + i * 18}%` }}
          animate={{ y: [0, -20, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}

      <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
        {/* Animated 500 Number */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4"
        >
          <div className="text-[140px] sm:text-[180px] font-black leading-none tracking-tighter select-none">
            <span className="bg-gradient-to-b from-violet-500 via-purple-500 to-violet-300/50 bg-clip-text text-transparent">5</span>
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block"
            >
              <span className="bg-gradient-to-b from-purple-500 via-violet-600 to-purple-300/50 bg-clip-text text-transparent">0</span>
            </motion.span>
            <span className="bg-gradient-to-b from-violet-400 via-purple-500 to-violet-300/50 bg-clip-text text-transparent">0</span>
          </div>
        </motion.div>

        {/* Icon and Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-violet-100 to-purple-50 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-100/50 border border-violet-200/30">
            <ServerCrash className="w-8 h-8 text-violet-500" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#2D2D2D] mb-3 tracking-tight">
            Server hiccup
          </h1>
          <p className="text-lg text-[#2D2D2D]/55 mb-8 max-w-md mx-auto leading-relaxed">
            Something unexpected happened on our end. Our team has been notified. Please try again in a moment.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <button
            onClick={() => window.location.reload()}
            className="group flex items-center gap-2.5 px-6 py-3.5 bg-white/80 backdrop-blur-sm border border-[#D6C7B1]/40 rounded-2xl font-semibold text-[#2D2D2D] hover:shadow-lg hover:border-violet-300/50 transition-all duration-300"
          >
            <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
            Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl font-semibold shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            <Home size={18} />
            Back to Home
          </button>
        </motion.div>

        {/* Status info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 pt-8 border-t border-[#D6C7B1]/20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-50/60 border border-violet-200/30 rounded-xl">
            <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
            <p className="text-xs text-violet-600/70 font-medium">Error has been automatically reported</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ServerErrorPage;
