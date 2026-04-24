import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPinOff, Home, ArrowLeft, Compass, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCFB] via-white to-[#D6C7B1]/10 flex items-center justify-center relative overflow-hidden">
      {/* Floating background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            x: mousePos.x * 2,
            y: mousePos.y * 2,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 30 }}
          className="absolute top-[10%] right-[15%] w-[400px] h-[400px] bg-gradient-to-br from-[#8BA889]/15 to-[#4A5D4B]/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: mousePos.x * -1.5,
            y: mousePos.y * -1.5,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 30 }}
          className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] bg-gradient-to-tr from-[#D6C7B1]/20 to-[#8BA889]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: mousePos.x * 1,
            y: mousePos.y * -1,
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 30 }}
          className="absolute top-[50%] left-[50%] w-[300px] h-[300px] bg-gradient-to-bl from-rose-200/10 to-amber-200/10 rounded-full blur-3xl"
        />
      </div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-[#8BA889]/20"
          style={{
            top: `${15 + i * 15}%`,
            left: `${10 + i * 16}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.4,
          }}
        />
      ))}

      <div className="relative z-10 text-center px-6 max-w-xl mx-auto">
        {/* Animated 404 Number */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-6"
        >
          <div className="text-[160px] sm:text-[200px] font-black leading-none tracking-tighter select-none">
            <span className="bg-gradient-to-b from-[#4A5D4B] via-[#8BA889] to-[#D6C7B1]/50 bg-clip-text text-transparent">
              4
            </span>
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block relative"
            >
              <span className="bg-gradient-to-b from-[#8BA889] via-[#4A5D4B] to-[#D6C7B1]/50 bg-clip-text text-transparent">
                0
              </span>
              {/* Compass inside the 0 */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <Compass className="w-10 h-10 sm:w-12 sm:h-12 text-[#8BA889]/30" />
              </motion.div>
            </motion.span>
            <span className="bg-gradient-to-b from-[#D6C7B1] via-[#8BA889] to-[#4A5D4B]/50 bg-clip-text text-transparent">
              4
            </span>
          </div>
        </motion.div>

        {/* Icon and Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-rose-100 to-amber-50 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-100/50 border border-rose-200/30">
            <MapPinOff className="w-8 h-8 text-rose-400" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-[#2D2D2D] mb-3 tracking-tight">
            Lost in the journey
          </h1>
          <p className="text-lg text-[#2D2D2D]/55 mb-8 max-w-md mx-auto leading-relaxed">
            The destination you're looking for has wandered off the map. 
            Let's get you back on track.
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
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2.5 px-6 py-3.5 bg-white/80 backdrop-blur-sm border border-[#D6C7B1]/40 rounded-2xl font-semibold text-[#2D2D2D] hover:shadow-lg hover:border-[#8BA889]/40 transition-all duration-300"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] text-white rounded-2xl font-semibold shadow-lg shadow-[#4A5D4B]/20 hover:shadow-xl hover:shadow-[#4A5D4B]/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            <Home size={18} />
            Back to Home
          </button>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 pt-8 border-t border-[#D6C7B1]/20"
        >
          <p className="text-sm text-[#2D2D2D]/40 mb-4 font-medium uppercase tracking-wider">Popular Destinations</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: 'Plan a Trip', path: '/planner', icon: Search },
              { label: 'My Trips', path: '/trips', icon: Compass },
              { label: 'Profile', path: '/profile', icon: Home },
            ].map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-[#D6C7B1]/20 rounded-xl text-sm font-medium text-[#2D2D2D]/70 hover:text-[#4A5D4B] hover:border-[#8BA889]/30 hover:bg-[#8BA889]/5 transition-all duration-300"
              >
                <link.icon size={14} />
                {link.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
