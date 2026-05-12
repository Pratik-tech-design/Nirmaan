import React, { useState, useRef, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useApp } from '../App';
import { X, ChevronRight, Search, RotateCcw, Building2, User, Phone, MapPin, Briefcase, Calendar, IndianRupee } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './Toast';

const InputWrapper = ({ label, required, children, onClear, value }: { label: string, required?: boolean, children: React.ReactNode, onClear?: () => void, value?: any }) => (
  <div className="space-y-2 relative group">
    <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 ml-1 flex items-center gap-1">
      {label}
      {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative">
      {children}
      {onClear && value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
          aria-label={`Clear ${label}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  </div>
);

export const AddLabourModal = ({ isOpen, onClose, sites, editData }: { isOpen: boolean, onClose: () => void, sites: any[], editData?: any }) => {
  const { t } = useApp();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false);
  const siteDropdownRef = useRef<HTMLDivElement>(null);

  const initialFormData = {
    name: '',
    phone: '',
    skillType: '',
    industryType: '',
    dailyWage: '',
    joiningDate: new Date().toISOString().split('T')[0],
    assignedSiteId: '',
    status: 'active',
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        phone: editData.phone || '',
        skillType: editData.skillType || '',
        industryType: editData.industryType || '',
        dailyWage: editData.dailyWage?.toString() || '',
        joiningDate: editData.joiningDate || new Date().toISOString().split('T')[0],
        assignedSiteId: editData.assignedSiteId || (editData.assignedSiteIds?.[0] || ''),
        status: editData.status || 'active',
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editData, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (siteDropdownRef.current && !siteDropdownRef.current.contains(event.target as Node)) {
        setIsSiteDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSites = sites.filter(site => 
    site.siteName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSite = sites.find(s => s.id === formData.assignedSiteId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!formData.name || !formData.phone || !formData.dailyWage || !formData.assignedSiteId) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      if (editData?.id) {
        await updateDoc(doc(db, 'labour', editData.id), {
          ...formData,
          dailyWage: Number(formData.dailyWage),
          updatedAt: serverTimestamp(),
          assignedSiteIds: [formData.assignedSiteId],
        });
        showToast(t('labourAddedSuccess'), 'success');
      } else {
        await addDoc(collection(db, 'labour'), {
          ...formData,
          dailyWage: Number(formData.dailyWage),
          createdAt: serverTimestamp(),
          assignedSiteIds: [formData.assignedSiteId],
        });
        showToast(t('labourAddedSuccess'), 'success');
      }
      
      setFormData(initialFormData);
      onClose();
    } catch (error) {
      console.error(error);
      showToast('Error saving labour', 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearField = (field: keyof typeof initialFormData) => {
    setFormData(prev => ({ ...prev, [field]: initialFormData[field] }));
  };

  const handlePhoneInput = (val: string) => {
    const numbers = val.replace(/\D/g, '').slice(0, 10);
    return numbers;
  };



  return (
    <AnimatePresence>
      {isOpen && (
        <div key="add-labour-overlay" className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            key="add-labour-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm"
          />
          
          <motion.div 
            key="add-labour-content"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="bg-white dark:bg-zinc-900 w-full sm:max-w-2xl sm:rounded-[40px] rounded-t-[32px] overflow-hidden shadow-2xl border-t sm:border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[92vh] sm:max-h-[85vh] z-10"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 sticky top-0 z-30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-900 dark:bg-zinc-100 rounded-2xl flex items-center justify-center text-white dark:text-zinc-900 shadow-lg">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                    {t('addLabour')}
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Personnel Provisioning Protocol</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-3 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="px-8 py-8 space-y-12 overflow-y-auto flex-1 custom-scrollbar pb-12">
              
              {/* SECTION 1 — PRIMARY OPERATIONAL DETAILS */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-[2px] flex-1 bg-zinc-100 dark:bg-zinc-800" />
                  <span className="text-[10px] font-black text-zinc-300 dark:text-zinc-600 uppercase tracking-[0.2em] whitespace-nowrap">01 Operational Specs</span>
                  <div className="h-[2px] flex-1 bg-zinc-100 dark:bg-zinc-800" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InputWrapper label="Daily Wage" required value={formData.dailyWage} onClear={() => clearField('dailyWage')}>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input 
                        required
                        type="number" 
                        inputMode="numeric"
                        placeholder="0.00"
                        className="w-full pl-11 pr-10 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:ring-0 transition-all font-black text-lg text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
                        value={formData.dailyWage}
                        onChange={e => setFormData({ ...formData, dailyWage: e.target.value })}
                      />
                    </div>
                  </InputWrapper>

                  <div className="space-y-2 relative" ref={siteDropdownRef}>
                    <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 ml-1">
                      Assigned Site <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsSiteDropdownOpen(!isSiteDropdownOpen)}
                      className={cn(
                        "w-full px-5 py-4 rounded-2xl border-2 transition-all flex items-center justify-between text-base font-bold",
                        selectedSite 
                          ? "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white" 
                          : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-300 dark:text-zinc-600"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className={cn("w-4 h-4", selectedSite ? "text-zinc-400" : "text-zinc-300 dark:text-zinc-600")} />
                        <span className="truncate">{selectedSite ? selectedSite.siteName : 'Select Site'}</span>
                      </div>
                      <ChevronRight className={cn("w-5 h-5 transition-transform", isSiteDropdownOpen ? "rotate-90 text-zinc-900 dark:text-white" : "text-zinc-300 dark:text-zinc-600")} />
                    </button>

                    <AnimatePresence>
                      {isSiteDropdownOpen && (
                        <motion.div
                          key="site-selector-dropdown-content"
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-[24px] shadow-2xl z-50 overflow-hidden flex flex-col"
                        >
                          <div className="p-4 border-b border-zinc-50 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900 flex items-center gap-3">
                            <Search className="w-4 h-4 text-zinc-400" />
                            <input 
                              autoFocus
                              type="text"
                              placeholder="Search site..."
                              className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full p-0 text-zinc-900 dark:text-white placeholder:text-zinc-300"
                              value={searchTerm}
                              onChange={e => setSearchTerm(e.target.value)}
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-800">
                            {filteredSites.length > 0 ? (
                              filteredSites.map((site, idx) => (
                                <button
                                  key={site.id || `site-${idx}`}
                                  type="button"
                                  onClick={() => {
                                    setFormData({ ...formData, assignedSiteId: site.id });
                                    setIsSiteDropdownOpen(false);
                                  }}
                                  className={cn(
                                    "w-full p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700 transition flex items-center justify-between group",
                                    formData.assignedSiteId === site.id && "bg-zinc-900 text-white dark:bg-white dark:text-black"
                                  )}
                                >
                                  <div>
                                    <p className={cn("text-xs font-black uppercase tracking-tight", formData.assignedSiteId === site.id ? "text-white dark:text-black" : "text-zinc-900 dark:text-white")}>{site.siteName}</p>
                                    <p className={cn("text-[9px] font-bold uppercase tracking-widest mt-0.5", formData.assignedSiteId === site.id ? "text-white/60 dark:text-black/60" : "text-zinc-400")}>{site.address || 'INDUSTRIAL_ZONE'}</p>
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="p-8 text-center text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                                No sites found
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* SECTION 2 — LABOUR INFORMATION */}
              <div className="space-y-6">
               <div className="flex items-center gap-4 mb-4">
                  <div className="h-[2px] flex-1 bg-zinc-100 dark:bg-zinc-800" />
                  <span className="text-[10px] font-black text-zinc-300 dark:text-zinc-600 uppercase tracking-[0.2em] whitespace-nowrap">02 Personal Profile</span>
                  <div className="h-[2px] flex-1 bg-zinc-100 dark:bg-zinc-800" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InputWrapper label="Full Name" required value={formData.name} onClear={() => clearField('name')}>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 focus:ring-0 transition-all font-bold text-sm text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </InputWrapper>
                  <InputWrapper label="Phone Number" required value={formData.phone} onClear={() => clearField('phone')}>
                    <input 
                      required
                      type="tel" 
                      inputMode="numeric"
                      placeholder="9876543210"
                      className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 focus:ring-0 transition-all font-bold text-sm text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: handlePhoneInput(e.target.value) })}
                    />
                  </InputWrapper>
                </div>
              </div>

              {/* SECTION 3 — WORK DETAILS */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-[2px] flex-1 bg-zinc-100 dark:bg-zinc-800" />
                  <span className="text-[10px] font-black text-zinc-300 dark:text-zinc-600 uppercase tracking-[0.2em] whitespace-nowrap">03 Deployment Specs</span>
                  <div className="h-[2px] flex-1 bg-zinc-100 dark:bg-zinc-800" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InputWrapper label="Skill Type" required>
                    <div className="relative">
                      <select 
                        required
                        className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 focus:ring-0 transition-all font-bold text-sm appearance-none cursor-pointer text-zinc-900 dark:text-white"
                        value={formData.skillType}
                        onChange={e => setFormData({ ...formData, skillType: e.target.value })}
                      >
                        <option value="">Select category</option>
                        <option value="Skilled">{t('skilled')}</option>
                        <option value="Semi-Skilled">{t('semiSkilled')}</option>
                        <option value="Unskilled">{t('unskilled')}</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 text-zinc-400 pointer-events-none" />
                    </div>
                  </InputWrapper>
                  <InputWrapper label="Industry Type" required>
                    <div className="relative">
                      <select 
                        required
                        className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 focus:ring-0 transition-all font-bold text-sm appearance-none cursor-pointer text-zinc-900 dark:text-white"
                        value={formData.industryType}
                        onChange={e => setFormData({ ...formData, industryType: e.target.value })}
                      >
                        <option value="">Select industry</option>
                        <option value="Construction">Construction</option>
                        <option value="Interior">Interior</option>
                        <option value="Civil">Civil</option>
                        <option value="Electrical">Electrical</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 text-zinc-400 pointer-events-none" />
                    </div>
                  </InputWrapper>
                </div>

                <InputWrapper label="Joining Date" required>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                      required
                      type="date"
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 focus:ring-0 transition-all font-bold text-sm text-zinc-900 dark:text-white"
                      value={formData.joiningDate}
                      onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                    />
                  </div>
                </InputWrapper>
              </div>
            </form>

            {/* Footer Buttons */}
            <div className="px-8 py-6 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex gap-4 sticky bottom-0 z-40">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-4 px-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-black uppercase text-[11px] tracking-widest transition-all active:scale-95 border-2 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
              >
                {t('cancel')}
              </button>
              <button 
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="flex-[2] py-4 px-6 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black uppercase text-[11px] tracking-[0.25em] shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <div className="w-5 h-5 border-3 border-current border-t-transparent animate-spin rounded-full" />
                ) : (
                  <>
                    <span>{t('saveLabour')}</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

