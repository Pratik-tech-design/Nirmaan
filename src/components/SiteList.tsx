import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, doc, deleteDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useApp } from '../App';
import { Plus, MapPin, Building2, Calendar, ChevronRight, ShieldAlert, Trash2, Edit } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { AddSiteModal } from './AddSiteModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './Toast';

export const SiteList = () => {
  const { t, lang } = useApp();
  const { showToast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [sites, loading] = useCollectionData(collection(db, 'sites'), { idField: 'id' } as any);
  const [labour] = useCollectionData(collection(db, 'labour'), { idField: 'id' } as any);
  const [payments] = useCollectionData(collection(db, 'payments'), { idField: 'id' } as any);

  const activeSites = sites?.filter(s => s.status !== 'archived');
  const archivedSites = sites?.filter(s => s.status === 'archived');

  const handleDelete = async (mode: 'permanent' | 'archive') => {
    if (!selectedSite || isProcessing) return;
    setIsProcessing(true);
    try {
      if (mode === 'archive') {
        await updateDoc(doc(db, 'sites', selectedSite.id), { status: 'archived' });
        showToast(t('siteArchivedSuccess'), 'success');
      } else {
        // Check for linked records
        const linkedLabour = labour?.filter(l => 
          (l.assignedSiteIds || []).includes(selectedSite.id) || l.assignedSiteId === selectedSite.id
        );

        const linkedPayments = payments?.filter(p => p.siteId === selectedSite.id);

        if ((linkedLabour && linkedLabour.length > 0) || (linkedPayments && linkedPayments.length > 0)) {
          const reason = (linkedLabour?.length || 0) > 0 ? `${linkedLabour?.length} labour assigned` : `${linkedPayments?.length} payments linked`;
          showToast(`Cannot delete: ${reason}. Archive instead.`, 'error');
          setIsProcessing(false);
          return;
        }

        await deleteDoc(doc(db, 'sites', selectedSite.id));
        showToast(t('siteDeletedSuccess'), 'success');
      }
      setIsDeleteModalOpen(false);
      setSelectedSite(null);
    } catch (error) {
      console.error(error);
      showToast('Error processing site deletion', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="px-1">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">{t('sites')}</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">{activeSites?.length || 0} ACTIVE PROJECTS</p>
          </div>
        </div>
        <button 
          onClick={() => {
            setSelectedSite(null);
            setIsAddModalOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          <span>Provision Site</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 px-1">
        <AnimatePresence mode="popLayout">
          {activeSites?.map((site: any, idx: number) => {
             const siteLabourCount = labour?.filter(l => 
               (l.assignedSiteIds || []).includes(site.id) || l.assignedSiteId === site.id
             ).length || 0;

             return (
              <motion.div 
                key={site.id || `site-${idx}`} 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-zinc-900 rounded-[40px] border-2 border-zinc-100 dark:border-zinc-800 overflow-hidden group hover:border-zinc-900 dark:hover:border-white hover:shadow-2xl transition-all duration-300 relative"
              >
                <div className="p-8 space-y-8 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center border-2 border-transparent transition-all group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex gap-1 items-center">
                       <button 
                        onClick={() => {
                          setSelectedSite(site);
                          setIsAddModalOpen(true);
                        }}
                        className="p-2 text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedSite(site);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 text-zinc-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl font-black tracking-tighter mb-2 uppercase text-zinc-900 dark:text-white group-hover:text-purple-600 transition-colors">{site.siteName}</h4>
                    <p className="text-zinc-400 text-[11px] font-black uppercase tracking-widest leading-relaxed line-clamp-2 opacity-80">{site.description || 'N/A_DESC_UNSPECIFIED'}</p>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-zinc-50 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                        <MapPin className="w-4 h-4 opacity-30 shrink-0" />
                        <span className="truncate max-w-[150px]">{site.address || 'LOCATION_UNSPECIFIED'}</span>
                      </div>
                      <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest">{siteLabourCount} LABOUR</span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                      <Calendar className="w-4 h-4 opacity-30 shrink-0" />
                      <span>START_TS: {formatDate(site.createdDate, lang)}</span>
                    </div>
                  </div>
                </div>

                <button className="w-full px-8 py-5 bg-zinc-50 dark:bg-zinc-800 border-t-2 border-transparent flex justify-between items-center group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all font-black uppercase text-[10px] tracking-widest">
                  <span>Access Project Hub</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                </button>

                {/* Decorative background number */}
                <span className="absolute -bottom-8 -right-4 font-black text-[140px] text-zinc-500/5 select-none pointer-events-none italic">
                  {site.siteName.charAt(0)}
                </span>
              </motion.div>
             );
          })}
        </AnimatePresence>

        {!loading && (activeSites?.length === 0 || !activeSites) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full py-32 text-center space-y-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-[64px] border-4 border-dashed border-zinc-100 dark:border-zinc-800 flex flex-col items-center"
          >
            <div className="w-20 h-20 bg-white dark:bg-zinc-800 rounded-[32px] flex items-center justify-center shadow-xl border border-zinc-100 dark:border-zinc-700">
               <ShieldAlert className="w-10 h-10 text-zinc-300" />
            </div>
            <div className="space-y-2">
              <p className="font-black text-zinc-900 dark:text-white uppercase tracking-widest leading-none">NO_PROJECT_MANIFEST_FOUND</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none opacity-60">System Ready for Infrastructure Provisioning</p>
            </div>
            <button 
              onClick={() => {
                setSelectedSite(null);
                setIsAddModalOpen(true);
              }}
              className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-all"
            >
              Provision Site
            </button>
          </motion.div>
        )}
      </div>

      <AddSiteModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedSite(null);
        }} 
        editData={selectedSite}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSite(null);
        }}
        onConfirm={handleDelete as any}
        title={t('deleteSite')}
        message="Are you sure you want to delete this site?"
        warning="Archiving is recommended if labour or payment history exists."
        itemType="site"
        itemData={selectedSite ? {
          name: selectedSite.siteName,
          details: selectedSite.address,
          transactionCount: labour?.filter(l => (l.assignedSiteIds || []).includes(selectedSite.id) || l.assignedSiteId === selectedSite.id).length
        } : undefined}
        loading={isProcessing}
      />
    </div>
  );
};
