// components/UGC/common/Toast.tsx
// Industrial Theme Toast Notification with Orange Accents

import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  const [isVisible, setIsVisible] = useState(!!message);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setIsExiting(false);
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setIsVisible(false);
          onClose?.();
        }, 300);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!isVisible || !message) return null;

  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-green-600/90 to-emerald-600/90',
      border: 'border-green-500/50',
      icon: '✓',
      iconBg: 'bg-green-500',
    },
    error: {
      bg: 'bg-gradient-to-r from-red-600/90 to-rose-600/90',
      border: 'border-red-500/50',
      icon: '✕',
      iconBg: 'bg-red-500',
    },
    info: {
      bg: 'bg-gradient-to-r from-orange-600/90 to-amber-600/90',
      border: 'border-orange-500/50',
      icon: 'ℹ',
      iconBg: 'bg-orange-500',
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-600/90 to-amber-600/90',
      border: 'border-yellow-500/50',
      icon: '⚠',
      iconBg: 'bg-yellow-500',
    },
  }[type];

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50 max-w-sm
        ${styles.bg} backdrop-blur-sm
        text-white px-4 py-3 rounded-xl shadow-2xl
        flex items-center gap-3 border ${styles.border}
        transform transition-all duration-300
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
    >
      {/* Icon */}
      <div className={`
        w-8 h-8 ${styles.iconBg} rounded-lg flex items-center justify-center
        text-white font-bold shadow-lg
      `}>
        {styles.icon}
      </div>
      
      {/* Message */}
      <p className="text-sm font-medium flex-1">{message}</p>
      
      {/* Close Button */}
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => {
            setIsVisible(false);
            onClose?.();
          }, 300);
        }}
        className="w-6 h-6 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center text-white/80 hover:text-white"
      >
        ✕
      </button>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-xl overflow-hidden">
        <div 
          className="h-full bg-white/50 animate-shrink-width"
          style={{ animation: 'shrinkWidth 5s linear forwards' }}
        />
      </div>
      
      <style>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Toast;
