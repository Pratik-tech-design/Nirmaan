import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useApp } from '../App';
import { X, ChevronRight, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './Toast';

export const AddLabourModal = ({ isOpen, onClose, sites }: { isOpen: boolean, onClose: () => void, sites: any[] }) => {
  const { t } = useApp();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    emergencyContact: '',
    skillType: '',
    industryType: '',
    dailyWage: '',
    joiningDate: new Date().toISOString().split('T')[0],
    assignedSiteId: '',
  });

  const filteredSites = sites.filter(site => 
    site.siteName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSite = sites.find(s => s.id === formData.assignedSiteId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Basic Validation
    if (!formData.name || !formData.phone || !formData.dailyWage || !formData.assignedSiteId) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'labour'), {
        ...formData,
        dailyWage: Number(formData.dailyWage),
        createdAt: serverTimestamp(),
        // Mapping for backward compatibility if needed, but we use assignedSiteId now
        assignedSiteIds: [formData.assignedSiteId],
      });
      
      showToast(t('labourAddedSuccess'), 'success');
      
      // Reset form
      setFormData({
        name: '',
        phone: '',
        address: '',
        emergencyContact: '',
        skillType: '',
        industryType: '',
        dailyWage: '',
        joiningDate: new Date().toISOString().split('T')[0],
        assignedSiteId: '',
      });
      onClose();
    } catch (error) {
      console.error(error);
      showToast('Error saving labour', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneInput = (val: string) => {
    // Basic formatting: 98765 43210
    const numbers = val.replace(/\D/g, '').slice(0, 10);
    if (numbers.length > 5) {
      return `${numbers.slice(0, 5)} ${numbers.slice(5)}`;
    }
    return numbers;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="modal-overlay" className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div 
            key="modal-content"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-zinc-900 w-full sm:max-w-2xl sm:rounded-[32px] rounded-t-[32px] overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[95vh] sm:max-h-[90vh] z-10"
          >
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900 sticky top-0 z-20">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                  {t('addLabour')}
                </h2>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Personnel Onboarding Manifest</p>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-zinc-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-10 overflow-y-auto flex-1 custom-scrollbar pb-32">
              {/* SECTION 1 — BASIC INFORMATION */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <div className="w-5 h-5 bg-zinc-900 dark:bg-white rounded flex items-center justify-center text-white dark:text-black text-[9px] font-black">01</div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 ml-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 focus:ring-0 transition font-bold text-sm"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 ml-1">Phone Number</label>
                    <input 
                      required
                      type="tel" 
                      inputMode="numeric"
                      placeholder="98765 43210"
                      className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 focus:ring-0 transition font-bold text-sm"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: handlePhoneInput(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 ml-1">Emergency Contact Number</label>
                    <input 
                      type="tel" 
                      inputMode="numeric"
                      placeholder="Optional"
                      className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 focus:ring-0 transition font-bold text-sm"
                      value={formData.emergencyContact}
                      onChange={e => setFormData({ ...formData, emergencyContact: handlePhoneInput(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 ml-1">Home Address</label>
                    <textarea 
                      placeholder="Village, Town, District"
                      className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 focus:ring-0 transition font-bold text-sm min-h-[100px] resize-none"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2 — WORK DETAILS */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <div className="w-5 h-5 bg-zinc-900 dark:bg-white rounded flex items-center justify-center text-white dark:text-black text-[9px] font-black">02</div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Work Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 ml-1">Daily Wage Amount (INR)</label>
                    <input 
                      required
                      type="number" 
                      inputMode="numeric"
                      placeholder="e.g. 600"
                      className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 focus:ring-0 transition font-bold text-sm"
                      value={formData.dailyWage}
                      onChange={e => setFormData({ ...formData, dailyWage: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 ml-1">Joining Date</label>
                    <input 
                      required
                      type="date"
                      className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 focus:ring-0 transition font-bold text-sm"
                      value={formData.joiningDate}
                      onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 ml-1">{t('skillType')}</label>
                    <select 
                      required
                      className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 focus:ring-0 transition font-bold text-sm appearance-none cursor-pointer"
                      value={formData.skillType}
                      onChange={e => setFormData({ ...formData, skillType: e.target.value })}
                    >
                      <option value="">Select Skill</option>
                      <option value="Skilled">{t('skilled')}</option>
                      <option value="Semi-Skilled">{t('semiSkilled')}</option>
                      <option value="Unskilled">{t('unskilled')}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 ml-1">{t('industryType')}</label>
                    <select 
                      required
                      className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 focus:ring-0 transition font-bold text-sm appearance-none cursor-pointer"
                      value={formData.industryType}
                      onChange={e => setFormData({ ...formData, industryType: e.target.value })}
                    >
                      <option value="">Select Industry</option>
                      <option value="Construction">Construction</option>
                      <option value="Interior">Interior</option>
                      <option value="Civil">Civil</option>
                      <option value="Electrical">Electrical</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3 — SITE ASSIGNMENT */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <div className="w-5 h-5 bg-zinc-900 dark:bg-white rounded flex items-center justify-center text-white dark:text-black text-[9px] font-black">03</div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Site Assignment</h3>
                </div>

                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 ml-1">Assigned Site</label>
                  <button
                    type="button"
                    onClick={() => setIsSiteDropdownOpen(!isSiteDropdownOpen)}
                    className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-zinc-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-900 flex items-center justify-between transition font-bold text-sm"
                  >
                    <span className={selectedSite ? "text-zinc-900 dark:text-white" : "text-zinc-400"}>
                      {selectedSite ? selectedSite.siteName : 'Choose Deployment Site'}
                    </span>
                    <ChevronRight className={cn("w-4 h-4 transition-transform", isSiteDropdownOpen ? "rotate-90" : "")} />
                  </button>

                  <AnimatePresence>
                    {isSiteDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute bottom-full mb-2 left-0 right-0 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl z-30 overflow-hidden flex flex-col"
                      >
                        <div className="p-3 border-b border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 flex items-center gap-2">
                          <Search className="w-4 h-4 text-zinc-400" />
                          <input 
                            type="text"
                            placeholder="Find Site..."
                            className="bg-transparent border-none focus:ring-0 text-xs font-bold uppercase tracking-widest w-full p-0"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto custom-scrollbar">
                          {filteredSites.length > 0 ? (
                            filteredSites.map((site, idx) => (
                              <button
                                key={site.id || `site-${idx}`}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, assignedSiteId: site.id });
                                  setIsSiteDropdownOpen(false);
                                }}
                                className="w-full p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700 transition border-b border-zinc-50 dark:border-zinc-700/50 last:border-none flex items-center justify-between"
                              >
                                <div>
                                  <p className="text-sm font-black uppercase tracking-tight text-zinc-800 dark:text-zinc-200">{site.siteName}</p>
                                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{site.address || 'NO_ADDRESS'}</p>
                                </div>
                                {formData.assignedSiteId === site.id && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                              </button>
                            ))
                          ) : (
                            <div className="p-8 text-center text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                              No Sites Found
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </form>

            <div className="p-6 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex gap-4 sticky bottom-0 z-20">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-zinc-500 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition active:scale-95"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                onClick={handleSubmit}
                className="flex-[2] py-5 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                ) : (
                  <>
                    <span>Save Labour</span>
                    <ChevronRight className="w-4 h-4" />
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
