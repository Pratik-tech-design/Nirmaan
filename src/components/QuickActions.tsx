import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, CreditCard, MapPin, X } from 'lucide-react';
import { useApp } from '../App';
import { cn } from '../lib/utils';

interface QuickActionsProps {
  onAddLabour: () => void;
  onAddPayment: () => void;
  onAddSite: () => void;
}

export const QuickActions = ({ onAddLabour, onAddPayment, onAddSite }: QuickActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useApp();

  const actions = [
    { id: 'labour', icon: Users, label: t('addLabour'), onClick: onAddLabour, color: 'bg-blue-600' },
    { id: 'payment', icon: CreditCard, label: t('addPayment'), onClick: onAddPayment, color: 'bg-green-600' },
    { id: 'site', icon: MapPin, label: t('addSite'), onClick: onAddSite, color: 'bg-purple-600' },
  ];

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-20 right-6 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-end gap-3 mb-2">
            {actions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                transition={{ delay: index * 0.05, type: 'spring', stiffness: 260, damping: 20 }}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 pr-2 group"
              >
                <span className="bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-lg shadow-lg text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity border border-zinc-100 dark:border-zinc-700">
                  {action.label}
                </span>
                <div className={cn(
                  "w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95",
                  action.color
                )}>
                  <action.icon className="w-5 h-5" />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      <button
        onClick={toggle}
        className={cn(
          "w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-50 border-4 border-white dark:border-zinc-950",
          isOpen 
            ? "bg-zinc-800 text-white rotate-45" 
            : "bg-black dark:bg-white text-white dark:text-black hover:scale-110 active:scale-95"
        )}
      >
        <Plus className="w-8 h-8" strokeWidth={3} />
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] -z-10"
          />
        )}
      </AnimatePresence>
    </div>
  );
};
