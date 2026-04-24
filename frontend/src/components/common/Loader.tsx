import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Loader2 } from 'lucide-react';

interface LoaderProps {
  /** Full-screen mode (min-h-screen) or inline */
  fullScreen?: boolean;
  /** Primary heading text */
  title?: string;
  /** Subtitle / description text */
  subtitle?: string;
  /** Loader visual style */
  variant?: 'spinner' | 'compass' | 'dots' | 'pulse';
  /** Size of the loader */
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 'w-10 h-10', md: 'w-16 h-16', lg: 'w-20 h-20' };
const iconMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
const borderMap = { sm: 'border-[3px]', md: 'border-4', lg: 'border-4' };

const Loader: React.FC<LoaderProps> = ({
  fullScreen = true,
  title,
  subtitle,
  variant = 'spinner',
  size = 'md',
}) => {
  const renderLoader = () => {
    switch (variant) {
      case 'compass':
        return (
          <div className={`relative ${sizeMap[size]}`}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className={`${sizeMap[size]} bg-gradient-to-br from-[#4A5D4B] to-[#8BA889] rounded-full flex items-center justify-center shadow-lg shadow-[#4A5D4B]/20`}
            >
              <Compass className={`${iconMap[size]} text-white`} />
            </motion.div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#4A5D4B] to-[#8BA889] opacity-30 animate-ping" />
          </div>
        );

      case 'dots':
        return (
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                className="w-3 h-3 bg-gradient-to-br from-[#4A5D4B] to-[#8BA889] rounded-full"
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div className={`relative ${sizeMap[size]}`}>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0.3, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`absolute inset-0 rounded-full bg-[#8BA889]/30`}
            />
            <div className={`relative ${sizeMap[size]} rounded-full bg-gradient-to-br from-[#4A5D4B] to-[#8BA889] flex items-center justify-center shadow-lg`}>
              <Loader2 className={`${iconMap[size]} text-white animate-spin`} />
            </div>
          </div>
        );

      case 'spinner':
      default:
        return (
          <div className={`relative ${sizeMap[size]}`}>
            <div className={`absolute inset-0 rounded-full ${borderMap[size]} border-[#8BA889]/20`} />
            <div className={`absolute inset-0 rounded-full ${borderMap[size]} border-t-[#4A5D4B] animate-spin`} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-[#4A5D4B] rounded-full" />
            </div>
          </div>
        );
    }
  };

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="text-center flex flex-col items-center gap-4"
    >
      {renderLoader()}
      {title && <h2 className="text-xl font-bold text-[#2D2D2D] tracking-tight">{title}</h2>}
      {subtitle && <p className="text-sm text-[#2D2D2D]/55 max-w-xs">{subtitle}</p>}
    </motion.div>
  );

  if (!fullScreen) return content;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCFB] via-white to-[#D6C7B1]/10 flex items-center justify-center">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-[#8BA889]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] left-[15%] w-[350px] h-[350px] bg-[#D6C7B1]/12 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10">
        {content}
      </div>
    </div>
  );
};

export default Loader;
