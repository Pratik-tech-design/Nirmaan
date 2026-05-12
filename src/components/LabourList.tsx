import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useApp } from '../App';
import { Labour } from '../types';
import { Search, Filter, Plus, Phone, MapPin, ChevronRight, MoreHorizontal, Users, ShieldAlert } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { AddLabourModal } from './AddLabourModal';
import { motion, AnimatePresence } from 'framer-motion';

export const LabourList = () => {
  const { t } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [labour, loading, error] = useCollectionData(collection(db, 'labour'), {
    idField: 'id',
  } as any);
  const [sites] = useCollectionData(collection(db, 'sites'), { idField: 'id' } as any);

  const filteredLabour = labour?.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">{t('labour')}</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">{labour?.length || 0} TOTAL REGISTERED UNITS</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" strokeWidth={3} />
          <span>Provision Labour</span>
        </button>
      </div>

      <div className="flex gap-3 p-2 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-sm focus-within:border-zinc-900 dark:focus-within:border-white transition-all">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search by Name, Skill, or Contact..."
            className="w-full pl-12 pr-4 py-3 bg-transparent border-none text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white focus:ring-0 placeholder:text-zinc-300"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-4 border-l border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
        <AnimatePresence mode="popLayout">
          {filteredLabour?.map((worker: any, idx: number) => (
            <motion.div 
              key={worker.id || `worker-${idx}`} 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-2 border-zinc-100 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-white transition-all duration-300 shadow-sm hover:shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center font-black text-xl text-zinc-300 group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all">
                    {worker.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-lg text-zinc-900 dark:text-white uppercase tracking-tighter leading-tight">{worker.name}</h4>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mt-1">{worker.skillType}</p>
                  </div>
                </div>
                <button className="p-2 text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8 relative z-10">
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Contact</p>
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 font-bold text-[11px] truncate">
                    <Phone className="w-3 h-3 opacity-40 shrink-0" />
                    {worker.phone}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Site</p>
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 font-bold text-[11px] truncate">
                    <MapPin className="w-3 h-3 opacity-40 shrink-0" />
                    {worker.assignedSiteId ? 'ASSIGNED' : 'UNASSIGNED'}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end pt-6 border-t border-zinc-50 dark:border-zinc-800 relative z-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Daily Wage</p>
                  <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">{formatCurrency(worker.dailyWage)}</p>
                </div>
                <button className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent flex items-center justify-center text-zinc-900 dark:text-white hover:bg-zinc-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all group-hover:shadow-lg active:scale-95">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Decorative background number */}
              <span className="absolute -bottom-8 -right-4 font-black text-[120px] text-zinc-500/5 select-none pointer-events-none italic">
                {worker.name.charAt(0)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {!loading && filteredLabour?.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full py-32 text-center space-y-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-[64px] border-4 border-dashed border-zinc-100 dark:border-zinc-800 flex flex-col items-center"
          >
            <div className="w-20 h-20 bg-white dark:bg-zinc-800 rounded-[32px] flex items-center justify-center shadow-xl border border-zinc-100 dark:border-zinc-700">
               <ShieldAlert className="w-10 h-10 text-zinc-300" />
            </div>
            <div className="space-y-2">
              <p className="font-black text-zinc-900 dark:text-white uppercase tracking-widest leading-none">NO_LABOUR_MANIFEST_FOUND</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none opacity-60">System Ready for Personnel Ingestion</p>
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-all"
            >
              Provision Now
            </button>
          </motion.div>
        )}
      </div>

      <AddLabourModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        sites={sites || []}
      />
    </div>
  );
};
