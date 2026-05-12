/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { auth, db, googleProvider } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { translations, TranslationKey } from './lib/translations';
import { UserProfile, Language } from './types';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  MapPin, 
  BarChart3, 
  Settings, 
  LogOut, 
  Languages, 
  Loader2,
  Plus,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';
import { DashboardCharts } from './components/DashboardCharts';
import { LabourList } from './components/LabourList';
import { SiteList } from './components/SiteList';
import { PaymentsList } from './components/PaymentsList';
import { Reports } from './components/Reports';
import { PaymentModal } from './components/PaymentModal';
import { AddLabourModal } from './components/AddLabourModal';
import { AddSiteModal } from './components/AddSiteModal';
import { QuickActions } from './components/QuickActions';
import { ToastProvider } from './components/Toast';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection } from 'firebase/firestore';

// --- Contexts ---
interface AppContextType {
  user: User | null;
  profile: UserProfile | null;
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  loading: boolean;
  openPaymentModal: () => void;
  openLabourModal: () => void;
  openSiteModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-2.5 transition-all duration-200 text-left border-l-4",
      active 
        ? "bg-blue-600/10 text-blue-400 border-blue-600 font-bold" 
        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-transparent"
    )}
  >
    <Icon className="w-4 h-4 flex-shrink-0" />
    <span className="text-xs uppercase tracking-widest leading-none">{label}</span>
  </button>
);

const Navbar = () => {
  const { profile, lang, setLang } = useApp();
  
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Operator Unit</span>
          <p className="text-sm font-black uppercase tracking-tight">{profile?.name || 'Loading...'}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors rounded text-[10px] font-black uppercase tracking-widest"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'हिन्दी (HI)' : 'English (EN)'}</span>
        </button>
        <div className="w-8 h-8 rounded border border-slate-300 bg-slate-100 overflow-hidden flex items-center justify-center font-black text-xs text-slate-400">
           {profile?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

const MobileNav = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  const { t } = useApp();
  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { id: 'labour', icon: Users, label: t('labour') },
    { id: 'payments', icon: CreditCard, label: t('payments') },
    { id: 'sites', icon: MapPin, label: t('sites') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 sm:hidden">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
              activeTab === tab.id ? "text-black dark:text-white" : "text-zinc-400"
            )}
          >
            <tab.icon className={cn("w-5 h-5", activeTab === tab.id && "fill-current")} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

// --- Screens ---

const Dashboard = () => {
  const { t, openPaymentModal } = useApp();
  const [labour] = useCollectionData(collection(db, 'labour'));
  const [sites] = useCollectionData(collection(db, 'sites'));
  const [payments] = useCollectionData(collection(db, 'payments'));

  const totalLabour = labour?.length || 0;
  const activeSites = sites?.filter((s: any) => s.status === 'active').length || 0;
  
  const monthlyExpense = payments?.reduce((acc: number, curr: any) => {
    // Basic filtering for current month (ignoring for brevity but can be added)
    return acc + (Number(curr.amount) || 0);
  }, 0) || 0;

  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  return (
    <div className="p-0 sm:p-4 space-y-8 pb-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('totalLabour'), value: totalLabour.toString(), color: 'bg-blue-600 text-white' },
          { label: t('activeSites'), value: activeSites.toString(), color: 'bg-zinc-900 text-white dark:bg-white dark:text-black' },
          { label: t('monthlyExpense'), value: formatCurrency(monthlyExpense), color: 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800' },
          { label: t('pendingAdvances'), value: '₹0', color: 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800' },
        ].map((stat, i) => (
          <div key={i} className={cn("p-6 rounded-[32px] overflow-hidden relative", stat.color)}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">{stat.label}</p>
            <p className="text-3xl font-black tracking-tight">{stat.value}</p>
            {i < 2 && <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-2xl" />}
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
           <h3 className="font-black text-2xl uppercase tracking-tight">Analytics</h3>
           <button className="text-xs font-bold uppercase text-zinc-400 hover:text-black dark:hover:text-white transition underline underline-offset-4 tracking-widest">Full Report</button>
        </div>
        <DashboardCharts />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
           <div className="flex justify-between items-center px-2">
             <h3 className="font-black text-2xl uppercase tracking-tight">{t('recentActivity')}</h3>
             <button className="text-xs font-bold uppercase text-zinc-400 hover:text-black dark:hover:text-white transition tracking-widest">View All</button>
           </div>
           <div className="bg-white dark:bg-zinc-900 p-4 rounded-[40px] border border-zinc-200 dark:border-zinc-800 space-y-1">
              {[
                { name: 'Rakesh Kumar', site: 'Elite Residency', amount: 800, type: 'kharchi' },
                { name: 'Sunil Singh', site: 'Skyline Hub', amount: 5000, type: 'advance' },
                { name: 'Amit Verma', site: 'Elite Residency', amount: 1200, type: 'extra' },
                { name: 'Rahul Dev', site: 'Metro Plaza', amount: 450, type: 'kharchi' },
              ].map((p, i) => (
                <div key={i} className="flex justify-between items-center p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-3xl transition-colors group">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center font-black group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">{p.name.charAt(0)}</div>
                    <div>
                      <p className="font-black text-sm">{p.name}</p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{p.site}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg leading-none">₹{p.amount}</p>
                    <p className={cn("text-[9px] font-black uppercase tracking-widest mt-1", 
                      p.type === 'kharchi' ? 'text-blue-600' : p.type === 'advance' ? 'text-amber-600' : 'text-green-600'
                    )}>{p.type}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-zinc-900 dark:bg-white text-white dark:text-black p-8 rounded-[40px] shadow-2xl flex flex-col justify-between overflow-hidden relative group">
           <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
           <div className="space-y-4 relative z-10">
             <div className="w-12 h-12 bg-white/20 dark:bg-black/10 rounded-2xl flex items-center justify-center">
               <Plus className="w-6 h-6" />
             </div>
             <h3 className="text-2xl font-black uppercase tracking-tight leading-none">Quick<br/>Payment Entry</h3>
             <p className="text-white/50 dark:text-black/50 text-xs font-bold uppercase tracking-widest leading-relaxed">Add a labour payment in less than 5 seconds.</p>
           </div>
           <button 
            onClick={openPaymentModal}
            className="w-full py-5 bg-white dark:bg-black text-black dark:text-white rounded-3xl font-black uppercase text-sm tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-transform relative z-10"
           >
             Start Entry
           </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLabourModalOpen, setIsLabourModalOpen] = useState(false);
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  
  const [sites] = useCollectionData(collection(db, 'sites'), { idField: 'id' } as any);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            id: user.uid,
            name: user.displayName || 'User',
            email: user.email || '',
            role: 'admin', 
            activeSiteIds: [],
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const t = (key: TranslationKey) => translations[lang][key] || key;
  const openPaymentModal = () => setIsPaymentModalOpen(true);
  const openLabourModal = () => setIsLabourModalOpen(true);
  const openSiteModal = () => setIsSiteModalOpen(true);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-black dark:text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center animate-bounce">
            <span className="text-white dark:text-black font-black italic">N</span>
          </div>
          <Loader2 className="w-6 h-6 animate-spin opacity-20" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
          <div className="grid grid-cols-12 gap-4 h-full w-full">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="border border-black dark:border-white h-24 rounded-lg" />
            ))}
          </div>
        </div>
        
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-8 sm:p-12 rounded-[56px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] dark:shadow-[0_40px_100px_-20px_rgba(255,255,255,0.05)] border border-zinc-200 dark:border-zinc-800 text-center space-y-8 z-10 transition-all">
          <div className="w-20 h-20 bg-black dark:bg-white rounded-[28px] mx-auto flex items-center justify-center shadow-xl rotate-3">
            <span className="text-white dark:text-black font-black text-4xl italic -rotate-3">N</span>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-black tracking-tighter uppercase">{t('welcome')}</h1>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">{t('tagline')}</p>
          </div>
          <button 
            onClick={() => signInWithPopup(auth, googleProvider)}
            className="w-full flex items-center justify-center gap-3 py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-[24px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all text-sm"
          >
            {t('loginWithGoogle')}
          </button>
          
          <div className="flex justify-center gap-4 pt-4">
             <button onClick={() => setLang('en')} className={cn("text-[10px] font-black uppercase tracking-widest", lang === 'en' ? 'text-black dark:text-white underline underline-offset-4' : 'text-zinc-400')}>English</button>
             <button onClick={() => setLang('hi')} className={cn("text-[10px] font-black uppercase tracking-widest", lang === 'hi' ? 'text-black dark:text-white underline underline-offset-4' : 'text-zinc-400')}>हिन्दी</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <AppContext.Provider value={{ 
        user, 
        profile, 
        lang, 
        setLang, 
        t, 
        loading, 
        openPaymentModal, 
        openLabourModal, 
        openSiteModal 
      }}>
      <div className="flex h-screen w-full bg-[#f8fafc] text-[#1e293b] font-sans overflow-hidden selection:bg-blue-600 selection:text-white">
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-[#0f172a] text-white flex flex-col border-r border-[#1e293b] shrink-0 hidden sm:flex">
          <div className="p-6 border-b border-[#1e293b] flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">LF</div>
            <div className="leading-none">
              <h1 className="text-sm font-black tracking-tighter uppercase whitespace-nowrap">NIRMAAN | PRO</h1>
              <p className="text-[9px] text-blue-400 font-mono tracking-tighter uppercase opacity-80 mt-0.5">v3.1.2-STABLE</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <SidebarItem icon={LayoutDashboard} label={t('dashboard')} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <SidebarItem icon={Users} label={t('labour')} active={activeTab === 'labour'} onClick={() => setActiveTab('labour')} />
            <SidebarItem icon={CreditCard} label={t('payments')} active={activeTab === 'payments'} onClick={() => setActiveTab('payments')} />
            <SidebarItem icon={MapPin} label={t('sites')} active={activeTab === 'sites'} onClick={() => setActiveTab('sites')} />
            <SidebarItem icon={BarChart3} label={t('reports')} active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
          </nav>

          <div className="p-4 border-t border-[#1e293b] bg-black/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SYSTEM STATUS</span>
              <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            </div>
            <button 
              onClick={() => signOut(auth)}
              className="flex items-center gap-2 text-slate-500 hover:text-red-400 transition-colors text-[10px] font-black uppercase tracking-widest w-full"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>TERMINATE SESSION</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <div className="flex-1 overflow-auto p-6 flex flex-col gap-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.99, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.99, x: -10 }}
                transition={{ duration: 0.3, ease: "circOut" }}
                className="w-full flex-1"
              >
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'labour' && <LabourList />}
                {activeTab === 'payments' && <PaymentsList />}
                {activeTab === 'sites' && <SiteList />}
                {activeTab === 'reports' && <Reports />}
                {activeTab === 'settings' && <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl">
                  <div className="text-center space-y-4">
                    <Settings className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="text-xl font-black uppercase tracking-widest text-slate-800">Operational Prefs</h3>
                    <p className="text-slate-400 text-xs font-mono uppercase">Configure terminal behavior & security</p>
                  </div>
                </div>}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Industrial Footer Status Bar */}
          <footer className="h-8 bg-slate-100 border-t border-slate-200 px-4 flex items-center justify-between text-[9px] font-black text-slate-400 tracking-widest uppercase shrink-0">
            <div className="flex gap-6">
              <span>SYNC: {new Date().toLocaleTimeString()}</span>
              <span className="text-blue-500 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                D-SERVER: SOUTH-ASIA-E1
              </span>
            </div>
            <div className="flex gap-6">
              <span>OS: NIRMAAN-CORE-OS</span>
              <span className="text-slate-800">ENCRYPT: AES-GCM</span>
            </div>
          </footer>
        </main>

        <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <QuickActions 
          onAddLabour={openLabourModal}
          onAddPayment={openPaymentModal}
          onAddSite={openSiteModal}
        />

        <PaymentModal 
          isOpen={isPaymentModalOpen} 
          onClose={() => setIsPaymentModalOpen(false)} 
        />

        <AddLabourModal 
          isOpen={isLabourModalOpen} 
          onClose={() => setIsLabourModalOpen(false)} 
          sites={sites || []}
        />

        <AddSiteModal 
          isOpen={isSiteModalOpen} 
          onClose={() => setIsSiteModalOpen(false)} 
        />
      </div>
    </AppContext.Provider>
    </ToastProvider>
  );
}
