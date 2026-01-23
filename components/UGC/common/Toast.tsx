// components/UGC/common/Toast.tsx

import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  const [isVisible, setIsVisible] = useState(!!message);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!isVisible || !message) return null;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type];

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  }[type];

  return (
    <div
      className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-up max-w-sm`}
    >
      <span className="font-bold text-lg">{icon}</span>
      <p className="text-sm">{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose();
        }}
        className="ml-auto text-white hover:opacity-80 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
