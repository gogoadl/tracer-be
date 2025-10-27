import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Alert = ({ type, message, onClose, duration = 5000 }) => {
  const { t } = useLanguage();
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300); // 애니메이션 시간만큼 대기
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 300); // 애니메이션 시간만큼 대기
  };

  const colors = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/30',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-800 dark:text-green-300',
      icon: '✅'
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-300',
      icon: '❌'
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/30',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-300',
      icon: '⚠️'
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-300',
      icon: 'ℹ️'
    }
  };

  const style = colors[type] || colors.info;

  return (
    <div 
      className={`min-w-[320px] max-w-md ${isClosing ? 'animate-slideOut' : 'animate-slideIn'} ${style.bg} ${style.border} border-2 rounded-lg shadow-lg p-4 cursor-pointer`}
      onClick={handleClose}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{style.icon}</span>
        <div className="flex-1">
          <p className={`${style.text} font-medium`}>{message}</p>
        </div>
        <button
          onClick={handleClose}
          className={`${style.text} hover:opacity-70 transition-opacity ml-2`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Alert;

