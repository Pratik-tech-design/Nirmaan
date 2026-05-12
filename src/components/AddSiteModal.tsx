import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useApp } from '../App';
import { X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './Toast';

export const AddSiteModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { t } = useApp();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    siteName: '',
    description: '',
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'sites'), {
        ...formData,
        status: 'active',
        createdDate: new Date().toISOString(),
      });
      showToast(t('siteCreatedSuccess'), 'success');
      onClose();
      setFormData({ siteName: '', description: '', address: '' });
    } catch (error) {
      console.error(error);
      showToast('Error creating site', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="add-site-modal-overlay" className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div 
            key="add-site-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div 
            key="add-site-modal-content"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-zinc-900 w-full sm:max-w-lg sm:rounded-[32px] rounded-t-[32px] overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col z-10"
          >
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">{t('addSite')}</h2>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">NEW_INFRASTRUCTURE_NODE</p>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-zinc-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider opacity-60 ml-1">Site Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Elite Residency / प्रोजेक्ट का नाम"
                  className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 focus:ring-0 transition font-black text-sm uppercase tracking-tight"
                  value={formData.siteName}
                  onChange={e => setFormData({ ...formData, siteName: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider opacity-60 ml-1">Location/Address</label>
                <input 
                  required
                  type="text" 
                  placeholder="Full Address / पता"
                  className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 focus:ring-0 transition font-black text-sm uppercase tracking-tight"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider opacity-60 ml-1">Description</label>
                <textarea 
                  placeholder="Brief Project Details / विवरण"
                  className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 focus:ring-0 transition font-black text-sm uppercase tracking-tight min-h-[100px]"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="flex-1 py-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-zinc-500 font-black uppercase text-[10px] tracking-widest active:scale-95 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-[2] py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <>
                      <span>PROVISION_SITE</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

