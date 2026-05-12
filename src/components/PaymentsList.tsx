import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useApp } from '../App';
import { CreditCard, Search, Calendar, MapPin, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn, formatCurrency, formatDate } from '../lib/utils';

export const PaymentsList = () => {
  const { t, lang } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [payments, loading] = useCollectionData(
    query(collection(db, 'payments'), orderBy('createdAt', 'desc')),
    { idField: 'id', snapshotListenOptions: { includeMetadataChanges: true } } as any
  );
  const [labour] = useCollectionData(collection(db, 'labour'), { idField: 'id' } as any);
  const [sites] = useCollectionData(collection(db, 'sites'), { idField: 'id' } as any);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'kharchi': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'extra': return 'bg-green-50 text-green-700 border-green-200';
      case 'advance': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'bonus': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'deduction': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-zinc-50 text-zinc-700 border-zinc-200';
    }
  };

  const getWorkerName = (id: string) => labour?.find(l => l.id === id)?.name || 'Unknown';
  const getSiteName = (id: string) => sites?.find(s => s.id === id)?.siteName || 'Unknown';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter">{t('payments')}</h2>
          <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-[0.2em]">Live Transaction Audit Ledger</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden flex flex-col">
        <div className="flex gap-2 p-2 bg-slate-50 border-b border-slate-200">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="SEARCH_BY_ID_OR_UNIT..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded text-xs font-mono font-bold uppercase focus:ring-1 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 border border-slate-200 bg-white text-slate-400 rounded hover:text-blue-600 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-[11px]">
            <thead>
              <tr className="bg-slate-100 text-slate-500 border-b border-slate-200">
                <th className="p-4 font-black uppercase tracking-widest border-r border-slate-200">{t('date')}</th>
                <th className="p-4 font-black uppercase tracking-widest border-r border-slate-200">{t('labour')}</th>
                <th className="p-4 font-black uppercase tracking-widest border-r border-slate-200">OP_UNIT</th>
                <th className="p-4 font-black uppercase tracking-widest border-r border-slate-200">ENTRY_TYPE</th>
                <th className="p-4 font-black uppercase tracking-widest text-right">{t('amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments?.map((payment: any, idx: number) => (
                <tr key={payment.id || `payment-${idx}`} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 whitespace-nowrap text-slate-400 border-r border-slate-50">
                    <span className="font-bold">{formatDate(payment.createdAt?.toDate ? payment.createdAt.toDate() : payment.createdAt, lang)}</span>
                  </td>
                  <td className="p-4 border-r border-slate-50">
                    <p className="font-black text-slate-900">{getWorkerName(payment.labourId)}</p>
                  </td>
                  <td className="p-4 border-r border-slate-50">
                    <div className="flex items-center gap-2">
                       <span className="text-slate-500 font-bold">{getSiteName(payment.siteId)}</span>
                    </div>
                  </td>
                  <td className="p-4 border-r border-slate-50">
                    <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border", getTypeStyle(payment.paymentType))}>
                      {t(payment.paymentType as any)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end font-black text-sm">
                      <span className={payment.paymentType === 'deduction' ? 'text-red-600' : 'text-slate-900'}>
                        {payment.paymentType === 'deduction' ? '-' : ''}{formatCurrency(payment.amount)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {!loading && (!payments || payments.length === 0) && (
          <div className="py-20 text-center space-y-4">
             <CreditCard className="w-12 h-12 mx-auto text-slate-200" />
             <p className="text-slate-400 font-black uppercase tracking-widest text-xs">NO_RECORDS_FOUND_IN_BUFFER</p>
          </div>
        )}
      </div>
    </div>
  );
};
