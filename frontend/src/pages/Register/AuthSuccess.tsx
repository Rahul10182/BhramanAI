import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Compass } from 'lucide-react';

const AuthSuccess: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCFB] via-white to-[#D6C7B1]/10 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-[#2D2D2D] mb-2">Success!</h1>
        <p className="text-[#2D2D2D]/60">You have successfully logged in.</p>
        <p className="text-sm text-[#8BA889] mt-4">Redirecting to dashboard...</p>
      </motion.div>
    </div>
  );
};

export default AuthSuccess;