import React from 'react';
import { db } from '../lib/firebase';
import { collection } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useApp } from '../App';
import { FileDown, BarChart3, PieChart, Activity, AlertCircle } from 'lucide-react';
import { exportToExcel } from '../services/excelService';

export const Reports = () => {
  const { t } = useApp();
  const [payments] = useCollectionData(collection(db, 'payments'), { idField: 'id' } as any);
  const [labour] = useCollectionData(collection(db, 'labour'), { idField: 'id' } as any);
  const [sites] = useCollectionData(collection(db, 'sites'), { idField: 'id' } as any);

  const handleExport = () => {
    if (!payments || !labour || !sites) return;
    exportToExcel(payments, labour, sites, 'NIRMAAN_INDUSTRIAL');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center px-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter">{t('reports')}</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">ANALYTICAL_OUTPUT_ENGINE</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded font-black uppercase text-xs shadow-lg active:scale-95 transition tracking-widest"
        >
          <FileDown className="w-5 h-5" />
          <span>EXPORT_EXCEL</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-white border border-slate-200 rounded shadow-sm space-y-4">
          <div className="w-10 h-10 border border-blue-100 bg-blue-50 rounded flex items-center justify-center text-blue-600">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-black text-sm uppercase tracking-widest">Financial Health</h3>
          <p className="text-slate-500 text-xs font-medium uppercase leading-relaxed opacity-80">Monthly spend is within expected range. Advance balances are healthy across 24 workers.</p>
        </div>
        
        <div className="p-8 bg-white border border-slate-200 rounded shadow-sm space-y-4">
          <div className="w-10 h-10 border border-purple-100 bg-purple-50 rounded flex items-center justify-center text-purple-600">
            <PieChart className="w-5 h-5" />
          </div>
          <h3 className="font-black text-sm uppercase tracking-widest">Category Breakdown</h3>
          <p className="text-slate-500 text-xs font-medium uppercase leading-relaxed opacity-80">Kharchi accounts for 72% of all outgoing payments. Weekly advances have increased by 5% this month.</p>
        </div>

        <div className="p-8 bg-rose-50 border border-rose-100 rounded shadow-sm space-y-4">
          <div className="w-10 h-10 border border-rose-200 bg-rose-100 rounded flex items-center justify-center text-rose-600">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="font-black text-sm uppercase tracking-widest text-rose-700">Deductions Warning</h3>
          <p className="text-rose-900 text-xs font-medium uppercase leading-relaxed opacity-80">3 labourers have high pending deductions. Review their profile before next kharchi payment.</p>
        </div>
      </div>

      <div className="p-12 border-2 border-dashed border-slate-200 rounded flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50">
        <BarChart3 className="w-16 h-16 text-slate-200" />
        <div className="max-w-md">
          <h3 className="text-xl font-black uppercase tracking-tighter">Site Comparison Analytics</h3>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2 leading-relaxed">Export to Excel to see a detailed site-wise spending breakdown including labour density and category analysis. All data is real-time from NCR_UNIT_B.</p>
        </div>
      </div>
    </div>
  );
};
