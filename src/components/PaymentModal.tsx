import React, { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { useApp } from '../App';
import { PaymentType } from '../types';
import { X, Search, Check, AlertCircle, ChevronRight, CreditCard } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './Toast';

export const PaymentModal = ({ isOpen, onClose, selectedLabourId }: { isOpen: boolean, onClose: () => void, selectedLabourId?: string }) => {
  const { t } = useApp();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [labourSearch, setLabourSearch] = useState('');
  const [selectedLabour, setSelectedLabour] = useState<any>(null);
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [labourData] = useCollectionData(collection(db, 'labour'), { idField: 'id' } as any);
  const [sitesData] = useCollectionData(collection(db, 'sites'), { idField: 'id' } as any);

  const [formData, setFormData] = useState({
    amount: '',
    paymentType: 'kharchi' as PaymentType,
    description: '',
  });

  const filteredLabour = labourData?.filter(l => 
    l.name.toLowerCase().includes(labourSearch.toLowerCase()) || 
    l.phone.includes(labourSearch)
  );

  const handleSubmit = async () => {
    if (!selectedLabour || !selectedSite || !formData.amount || loading) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'payments'), {
        labourId: selectedLabour.id,
        siteId: selectedSite.id,
        amount: Number(formData.amount),
        paymentType: formData.paymentType,
        description: formData.description,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid,
      });
      
      showToast(t('paymentAddedSuccess'), 'success');
      onClose();
      
      // Reset
      setStep(1);
      setSelectedLabour(null);
      setSelectedSite(null);
      setFormData({ amount: '', paymentType: 'kharchi', description: '' });
    } catch (error) {
      console.error(error);
      showToast('Transaction failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (type: PaymentType) => {
    switch (type) {
      case 'kharchi': return 'bg-blue-600';
      case 'extra': return 'bg-green-600';
      case 'advance': return 'bg-orange-500';
      case 'bonus': return 'bg-purple-600';
      case 'deduction': return 'bg-red-600';
      default: return 'bg-zinc-600';
    }
  };

  // Get sites assigned to selected labour
  const assignedSites = sitesData?.filter(s => {
    const siteIds = selectedLabour?.assignedSiteIds || [];
    const siteId = selectedLabour?.assignedSiteId;
    return siteIds.includes(s.id) || siteId === s.id;
  }) || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="payment-modal-overlay" className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div 
            key="payment-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div 
            key="payment-modal-content"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-zinc-900 w-full sm:max-w-xl sm:rounded-[32px] rounded-t-[32px] overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col z-10 max-h-[95vh] sm:max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 sticky top-0 z-20">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600">
                    <CreditCard className="w-5 h-5" />
                 </div>
                 <div>
                   <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                     {t('addPayment')}
                   </h2>
                   <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Financial Disbursement Protocol</p>
                 </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-zinc-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto flex-1 custom-scrollbar pb-32">
              {/* Step 1: Select Labour */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Select Personnel (यूनिट चुनें)</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input 
                        autoFocus
                        type="text"
                        placeholder="Search by Name or Phone..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 focus:ring-0 transition font-bold"
                        value={labourSearch}
                        onChange={e => setLabourSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {filteredLabour?.slice(0, 10).map((labour: any) => (
                      <button
                        key={labour.id}
                        onClick={() => {
                          setSelectedLabour({ ...labour, id: labour.id });
                          // Auto set site if only one assigned
                          const sites = sitesData?.filter(s => (labour.assignedSiteIds || []).includes(s.id) || labour.assignedSiteId === s.id) || [];
                          if (sites.length === 1) setSelectedSite(sites[0]);
                          setStep(2);
                        }}
                        className="w-full flex justify-between items-center p-4 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-white group transition-all text-left active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center font-black text-zinc-900 dark:text-white uppercase transition-colors group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black">
                            {labour.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-sm uppercase text-zinc-900 dark:text-white tracking-tight">{labour.name}</p>
                            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{labour.skillType} • {labour.phone}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                      </button>
                    ))}
                    {filteredLabour && filteredLabour.length > 10 && (
                      <p className="text-center text-[9px] font-black uppercase text-zinc-400 tracking-widest py-2">Refine search to see more results</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Transaction Details */}
              {step === 2 && selectedLabour && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 pb-10">
                  <div className="p-5 rounded-3xl bg-zinc-900 dark:bg-white flex items-center justify-between shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 dark:bg-black/10 rounded-2xl flex items-center justify-center font-black text-white dark:text-black">
                        {selectedLabour.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-lg text-white dark:text-black uppercase tracking-tight">{selectedLabour.name}</p>
                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{selectedLabour.skillType} • {selectedLabour.phone}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setStep(1)} 
                      className="relative z-10 px-4 py-2 bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-white dark:text-black transition"
                    >
                      Reset
                    </button>
                    {/* Industrial pattern background */}
                    <div className="absolute top-0 right-0 w-32 h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #888 25%, transparent 25%, transparent 50%, #888 50%, #888 75%, transparent 75%, transparent)', backgroundSize: '10px 10px' }} />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Deployment Site (साइट)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {assignedSites.length > 0 ? (
                          assignedSites.map((site: any) => (
                            <button
                              key={site.id}
                              type="button"
                              onClick={() => setSelectedSite(site)}
                              className={cn(
                                "p-4 rounded-2xl border-2 transition-all text-left active:scale-[0.98]",
                                selectedSite?.id === site.id 
                                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-black dark:border-white shadow-xl" 
                                  : "bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-800 text-zinc-500"
                              )}
                            >
                              <p className="text-[11px] font-black uppercase tracking-tight">{site.siteName}</p>
                              <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest mt-1 truncate">{site.address || 'SITE_LOC_NA'}</p>
                            </button>
                          ))
                        ) : (
                          <div className="col-span-2 p-6 rounded-2xl border-2 border-dashed border-zinc-100 dark:border-zinc-800 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No sites assigned to this worker</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Transaction Category (प्रकार)</label>
                      <div className="grid grid-cols-5 gap-2">
                        {(['kharchi', 'extra', 'advance', 'bonus', 'deduction'] as PaymentType[]).map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData({ ...formData, paymentType: type })}
                            className={cn(
                              "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all relative overflow-hidden group active:scale-95",
                              formData.paymentType === type 
                                ? `${getCategoryColor(type)} text-white border-transparent shadow-xl ring-2 ring-offset-2 ring-zinc-900 dark:ring-white` 
                                : "bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-800 text-zinc-400"
                            )}
                          >
                            <span className="text-[8px] font-black uppercase tracking-tighter z-10">{t(type as any).split(' ')[0]}</span>
                            {formData.paymentType === type && (
                              <motion.div layoutId="activeCat" className="absolute inset-0 bg-white/10 -z-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Quantum (राशि)</label>
                       <div className="relative group">
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-3xl text-zinc-200 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors">₹</span>
                          <input 
                            required
                            autoFocus
                            type="number"
                            inputMode="numeric"
                            placeholder="0.00"
                            className="w-full pl-14 pr-6 py-8 rounded-[32px] bg-zinc-50 dark:bg-zinc-800 border-4 border-transparent focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 text-5xl font-mono font-black focus:ring-0 transition-all shadow-none focus:shadow-2xl"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                          />
                       </div>
                    </div>

                    <div className="space-y-2 pt-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Operational Remarks (विवरण)</label>
                      <input 
                        type="text"
                        placeholder="Enter transaction notes..."
                        className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-white focus:ring-0 font-bold text-sm uppercase tracking-tight transition"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            {step === 2 && (
              <div className="p-6 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex gap-4 sticky bottom-0 z-20">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 py-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-zinc-500 font-black uppercase text-[10px] tracking-widest hover:bg-zinc-100 transition active:scale-95"
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={!selectedSite || !formData.amount || loading}
                  className="flex-[2] py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <>
                      <span>EXECUTE_PAYOUT</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
