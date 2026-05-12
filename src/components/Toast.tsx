import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';

type ToastType = 'success' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Add subtle vibration for success
    if (type === 'success' && window.navigator?.vibrate) {
      window.navigator.vibrate(10);
    }
    
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-2xl shadow-2xl border pointer-events-auto backdrop-blur-md bg-white/90 dark:bg-zinc-900/90",
                toast.type === 'success' 
                  ? "border-green-100 dark:border-green-900/30 text-green-800 dark:text-green-300" 
                  : "border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-300"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                toast.type === 'success' ? "bg-green-100 dark:bg-green-900/30" : "bg-rose-100 dark:bg-rose-900/30"
              )}>
                {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <p className="flex-1 font-black uppercase tracking-widest text-[10px] leading-tight">
                {toast.message}
              </p>
              <button 
                onClick={() => removeToast(toast.id)}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition"
              >
                <X className="w-4 h-4 opacity-50" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
