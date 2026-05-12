import React from 'react';
import { AlertTriangle, Trash2, Archive, X, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useApp } from '../App';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (mode: 'soft' | 'permanent' | 'archive') => void;
  title: string;
  message: string;
  warning?: string;
  loading?: boolean;
  itemType: 'labour' | 'site';
  itemData?: {
    name: string;
    details?: string;
    transactionCount?: number;
  };
}

export const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  warning,
  loading,
  itemType,
  itemData
}: DeleteConfirmationModalProps) => {
  const { t } = useApp();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ y: "100%", scale: 1 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: "100%", scale: 0.95 }}
            transition={{ type: "spring", damping: 32, stiffness: 450 }}
            className="bg-white dark:bg-zinc-900 w-full sm:max-w-md sm:rounded-[32px] rounded-t-[32px] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border-t sm:border border-zinc-200 dark:border-zinc-800 flex flex-col z-10"
          >
            <div className="p-8 space-y-8">
              {/* Icon & Title */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/30 rounded-[32px] flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-inner">
                  <AlertTriangle className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase px-4">{title}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed px-2">{message}</p>
                </div>
              </div>

              {/* Item Details Card */}
              {itemData && (
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl p-5 border-2 border-zinc-100 dark:border-zinc-800 flex items-center justify-between group">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Selected {itemType}</p>
                    <p className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">{itemData.name}</p>
                    {itemData.details && <p className="text-[10px] font-medium text-zinc-500">{itemData.details}</p>}
                  </div>
                  {itemData.transactionCount !== undefined && itemData.transactionCount > 0 && (
                    <div className="text-right">
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none mb-1">Impact</p>
                      <p className="text-xs font-black text-zinc-900 dark:text-white">{itemData.transactionCount} Trans.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Warning Box */}
              {warning && (
                <div className="flex gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                  <Info className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-400 leading-relaxed uppercase tracking-tight">
                    {warning}
                  </p>
                </div>
              )}

              {/* Action Modes */}
              <div className="space-y-3">
                {itemType === 'labour' ? (
                  <>
                    <button
                      onClick={() => onConfirm('soft')}
                      disabled={loading}
                      className="w-full flex items-center justify-between p-5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black uppercase text-[11px] tracking-widest transition-all hover:scale-[1.02] active:scale-95 group"
                    >
                      <div className="flex items-center gap-3">
                        <Archive className="w-5 h-5 opacity-60" />
                        <span>{t('softDelete')}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={() => onConfirm('permanent')}
                      disabled={loading}
                      className="w-full flex items-center justify-between p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-2 border-rose-100 dark:border-rose-900/30 font-black uppercase text-[11px] tracking-widest transition-all hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white active:scale-95 group"
                    >
                      <div className="flex items-center gap-3">
                        <Trash2 className="w-5 h-5 opacity-60" />
                        <span>{t('permanentDelete')}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onConfirm('archive')}
                      disabled={loading}
                      className="w-full flex items-center justify-between p-5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black uppercase text-[11px] tracking-widest transition-all hover:scale-[1.02] active:scale-95 group"
                    >
                      <div className="flex items-center gap-3">
                        <Archive className="w-5 h-5 opacity-60" />
                        <span>{t('archiveSite')}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={() => onConfirm('permanent')}
                      disabled={loading}
                      className="w-full flex items-center justify-between p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-2 border-rose-100 dark:border-rose-900/30 font-black uppercase text-[11px] tracking-widest transition-all hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white active:scale-95 group"
                    >
                      <div className="flex items-center gap-3">
                        <Trash2 className="w-5 h-5 opacity-60" />
                        <span>{t('permanentDelete')}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Cancel Footer */}
            <div className="p-6 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={onClose}
                disabled={loading}
                className="w-full py-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-black uppercase text-[10px] tracking-[0.3em] transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
