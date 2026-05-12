import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { useApp } from '../App';

const MOCK_BAR_DATA = [
  { name: 'Mon', amount: 4500 },
  { name: 'Tue', amount: 3200 },
  { name: 'Wed', amount: 6800 },
  { name: 'Thu', amount: 5100 },
  { name: 'Fri', amount: 8900 },
  { name: 'Sat', amount: 4200 },
  { name: 'Sun', amount: 2100 },
];

const MOCK_PIE_DATA = [
  { name: 'Kharchi', value: 65, color: '#3b82f6' },
  { name: 'Extra', value: 15, color: '#22c55e' },
  { name: 'Advance', value: 10, color: '#f59e0b' },
  { name: 'Bonus', value: 5, color: '#a855f7' },
  { name: 'Deduction', value: 5, color: '#f43f5e' },
];

export const DashboardCharts = () => {
  const { lang } = useApp();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-6 border border-slate-200 rounded shadow-sm">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">FINANCIAL_OSCILLOSCOPE</h3>
            <p className="text-sm font-black uppercase tracking-tight mt-1">Daily Expense Tracking / 7D_WINDOW</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black font-mono tracking-tighter leading-none text-blue-600">₹34,800</p>
            <p className="text-[9px] font-black uppercase tracking-widest mt-1">Total_Agg_Period</p>
          </div>
        </div>
        
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_BAR_DATA}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={{ stroke: '#e2e8f0' }} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8', fontFamily: 'monospace' }} 
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '4px', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  fontWeight: 900,
                  fontSize: '10px',
                  fontFamily: 'monospace'
                }} 
              />
              <Area 
                type="step" 
                dataKey="amount" 
                stroke="#2563eb" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorAmount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 border border-slate-200 rounded shadow-sm flex flex-col">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">ALLOCATION_MAP</h3>
        <div className="flex-1 flex items-center justify-center min-h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={MOCK_PIE_DATA}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
              >
                {MOCK_PIE_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6 border-t border-slate-100 pt-4">
          {MOCK_PIE_DATA.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[9px] font-bold uppercase tracking-tight text-slate-500 font-mono">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
