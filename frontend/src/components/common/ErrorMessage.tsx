import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info, XCircle, RefreshCw, X } from 'lucide-react';

type ErrorSeverity = 'error' | 'warning' | 'info';

interface ErrorMessageProps {
  /** The error message text */
  message: string;
  /** Severity level */
  severity?: ErrorSeverity;
  /** Optional title / heading */
  title?: string;
  /** Show a retry button */
  onRetry?: () => void;
  /** Show a dismiss button */
  onDismiss?: () => void;
  /** Inline (banner) or card mode */
  variant?: 'inline' | 'card';
}

const severityConfig = {
  error: {
    icon: XCircle,
    bg: 'bg-red-50/80',
    border: 'border-red-200/60',
    text: 'text-red-700',
    subtext: 'text-red-600/70',
    iconColor: 'text-red-500',
    btnBg: 'bg-red-500 hover:bg-red-600',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50/80',
    border: 'border-amber-200/60',
    text: 'text-amber-700',
    subtext: 'text-amber-600/70',
    iconColor: 'text-amber-500',
    btnBg: 'bg-amber-500 hover:bg-amber-600',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50/80',
    border: 'border-blue-200/60',
    text: 'text-blue-700',
    subtext: 'text-blue-600/70',
    iconColor: 'text-blue-500',
    btnBg: 'bg-blue-500 hover:bg-blue-600',
  },
};

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  severity = 'error',
  title,
  onRetry,
  onDismiss,
  variant = 'inline',
}) => {
  const config = severityConfig[severity];
  const IconComp = config.icon;

  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`${config.bg} backdrop-blur-sm border ${config.border} rounded-2xl p-6 shadow-lg max-w-md mx-auto`}
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className={`w-14 h-14 rounded-xl ${config.bg} flex items-center justify-center`}>
            <IconComp className={`w-7 h-7 ${config.iconColor}`} />
          </div>
          {title && <h3 className={`text-lg font-bold ${config.text}`}>{title}</h3>}
          <p className={`text-sm ${config.subtext} leading-relaxed`}>{message}</p>
          <div className="flex gap-3 mt-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className={`flex items-center gap-2 px-4 py-2 ${config.btnBg} text-white text-sm font-semibold rounded-xl transition-colors`}
              >
                <RefreshCw size={14} /> Retry
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Inline banner variant
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={`${config.bg} backdrop-blur-sm border ${config.border} rounded-xl px-4 py-3 flex items-center gap-3`}
    >
      <IconComp className={`w-5 h-5 ${config.iconColor} flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        {title && <p className={`text-sm font-semibold ${config.text}`}>{title}</p>}
        <p className={`text-sm ${config.subtext} ${title ? '' : 'font-medium'}`}>{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className={`p-1.5 rounded-lg hover:bg-white/50 transition-colors`}>
          <RefreshCw size={16} className={config.iconColor} />
        </button>
      )}
      {onDismiss && (
        <button onClick={onDismiss} className="p-1.5 rounded-lg hover:bg-white/50 transition-colors">
          <X size={16} className={config.iconColor} />
        </button>
      )}
    </motion.div>
  );
};

export default ErrorMessage;
