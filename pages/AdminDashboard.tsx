
import React, { useState, useEffect } from 'react';
import { useDataStore } from '../store/dataStore';
import { 
  Users, 
  FileText, 
  Eye, 
  Download,
  Activity,
  Database,
  Wifi,
  Zap,
  TrendingUp,
  Cpu,
  Binary,
  Layers,
  ShieldCheck,
  Target,
  Clock,
  Globe
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const AdminDashboard: React.FC = () => {
  const { students, documents, systemLogs, tradingPlatforms, subscriptionPlans } = useDataStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const pendingStudents = students.filter(s => s.status === 'PENDING').length;
  const chartData = [
    { name: '01', views: 400, dls: 240 }, { name: '02', views: 300, dls: 139 }, { name: '03', views: 500, dls: 980 },
    { name: '04', views: 278, dls: 390 }, { name: '05', views: 689, dls: 480 }, { name: '06', views: 239, dls: 380 }, { name: '07', views: 849, dls: 530 },
  ];

  const statItems = [
    { label: 'USERS', val: students.length, color: 'text-white', icon: <Users size={16}/>, desc: `+${pendingStudents} PND`, path: '/users' },
    { label: 'DOCUMENTS', val: documents.length, color: 'text-accent', icon: <FileText size={16}/>, desc: 'DATA_LINKS', path: '/documents' },
    { label: 'ACCOUNT_OPEN', val: tradingPlatforms.length, color: 'text-emerald-500', icon: <Globe size={16}/>, desc: 'PLATFORMS', path: '/account-open' },
    { label: 'REVENUE_PLANS', val: subscriptionPlans.length, color: 'text-yellow-500', icon: <Zap size={16}/>, desc: 'PRICING', path: '/subscription-plans' },
    { label: 'VIEWS', val: '12.4K', color: 'text-white', icon: <Eye size={16}/>, desc: 'HITS', path: '/logs' },
    { label: 'DOWNLOADS', val: '4.8K', color: 'text-error', icon: <Download size={16}/>, desc: 'BYTES', path: '/documents' },
  ];

  return (
    <div className="max-w-[1700px] mx-auto space-y-10 animate-in fade-in duration-1000 pb-20 relative px-0.5 sm:px-4 select-none">
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-accent">
            <Cpu size={16} className="animate-pulse" />
            <p className="text-[10px] font-heading tracking-[0.5em] uppercase font-black">CONTROL</p>
          </div>
          <h2 className="text-2xl sm:text-5xl font-heading font-black tracking-tighter text-white uppercase leading-none">DASHBOARD</h2>
        </div>
        <div className="flex items-center gap-4 bg-white/5 px-6 py-2 border border-white/5">
           <Clock size={14} className="text-accent" />
           <p className="text-[10px] font-heading text-muted uppercase tracking-[0.4em]">SYNC: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      {/* HUD DATA MODULES */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-4">
        {statItems.map((s, i) => (
          <div 
            key={i} 
            onClick={() => s.path && (window.location.hash = `#${s.path}`)}
            className={`bg-surface/80 border border-white/5 p-2 sm:p-5 relative overflow-hidden group transition-all duration-500 cursor-pointer flex flex-col justify-between min-h-[140px] sm:min-h-[180px] ${
            s.color === 'text-white' ? 'hover:border-white/40' : 
            s.color === 'text-accent' ? 'hover:border-accent/40' : 
            s.color === 'text-yellow-500' ? 'hover:border-yellow-500/40' : 
            s.color === 'text-emerald-500' ? 'hover:border-emerald-500/40' :
            'hover:border-error/40'
          }`}>
             <div className={`absolute top-0 right-0 w-12 sm:w-16 h-1 opacity-20 ${s.color.replace('text-', 'bg-')}`}></div>
             <div className={`absolute bottom-0 left-0 w-1 h-8 sm:h-12 opacity-20 ${s.color.replace('text-', 'bg-')}`}></div>
             
             <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className={`p-2 sm:p-3 bg-black border border-white/10 ${s.color} transition-all duration-300
                    ${s.color === 'text-white' ? 'group-hover:bg-white group-hover:text-black' : 
                      s.color === 'text-accent' ? 'group-hover:bg-accent group-hover:text-black' : 
                      s.color === 'text-emerald-500' ? 'group-hover:bg-emerald-500 group-hover:text-black' : 
                      s.color === 'text-yellow-500' ? 'group-hover:bg-yellow-500 group-hover:text-black' : 
                      s.color === 'text-error' ? 'group-hover:bg-error group-hover:text-black' : 
                      'group-hover:bg-white group-hover:text-black'}`}>
                    {s.icon}
                  </div>
                  <div className="text-right hidden sm:block">
                     <p className="text-[7px] font-heading tracking-[0.4em] text-muted uppercase opacity-40">CH_{i.toString().padStart(2, '0')}</p>
                     <p className={`text-[8px] font-heading tracking-widest uppercase font-black ${s.color}`}>{s.desc}</p>
                  </div>
               </div>
               
               <div className="space-y-1">
                  <p className="text-[8px] sm:text-[9px] font-heading tracking-[0.3em] text-muted/60 uppercase">{s.label}</p>
                  <h3 className={`${s.val.toString().length > 10 ? 'text-lg sm:text-2xl' : s.val.toString().length > 7 ? 'text-xl sm:text-3xl' : 'text-xl sm:text-4xl'} font-heading font-black tracking-tighter ${s.color}`}>
                     {typeof s.val === 'number' ? s.val.toLocaleString('en-US') : s.val}
                  </h3>
               </div>
             </div>

             <div className="flex gap-1 mt-4 sm:mt-6">
               {[...Array(8)].map((_, b) => (
                 <div key={b} className={`h-1 flex-1 transition-all duration-700 ${b <= 5 ? s.color.replace('text-', 'bg-') : 'bg-white/5'}`}></div>
               ))}
             </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-surface/40 border border-white/5 p-1 relative group" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 95%, 95% 100%, 0 100%)' }}>
          <div className="bg-black/60 p-2 sm:p-8 lg:pb-0 flex flex-col h-full space-y-6 sm:space-y-10">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/5 border border-accent/20 text-accent"><TrendingUp size={20} /></div>
                  <div>
                    <h3 className="font-heading text-xs tracking-[0.2em] uppercase text-white font-black">STATS</h3>
                    <p className="text-[8px] font-heading text-muted uppercase tracking-[0.3em] mt-1">REALTIME</p>
                  </div>
               </div>
            </div>
            <div className="h-[250px] sm:h-[400px] lg:h-auto lg:flex-1 w-full min-h-[250px] lg:min-h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#ffffff20" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    fontFamily="Inter"
                    tick={{ fill: '#ffffff20' }}
                  />
                  <YAxis 
                    stroke="#ffffff20" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    fontFamily="Inter" 
                    width={isMobile ? 30 : 60}
                    tick={{ textAnchor: 'start', x: 0, fill: '#ffffff20' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '0px', fontSize: '9px' }}
                    itemStyle={{ color: '#00F0FF' }}
                  />
                  <Area type="monotone" dataKey="views" stroke="#00F0FF" fillOpacity={1} fill="url(#colorViews)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-surface/40 border border-white/5 p-5 sm:p-8 h-full flex flex-col space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2 sm:p-3 bg-accent/5 border border-accent/20 text-accent"><Activity size={16} /></div>
              <h3 className="font-heading text-xs tracking-[0.3em] uppercase text-white font-black">LOGS</h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 max-h-[300px] sm:max-h-none">
              {systemLogs.slice(0, 8).map((log, i) => (
                <div key={log.id} className="flex gap-4 group">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${i === 0 ? 'bg-accent animate-pulse' : 'bg-white/10'}`}></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[10px] text-zinc-400 font-heading uppercase leading-relaxed group-hover:text-white transition-colors">{log.details}</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => window.location.hash = '#/logs'}
              className="w-full py-4 bg-white text-black font-heading text-[10px] font-black tracking-[0.4em] uppercase hover:bg-accent transition-all"
              style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
            >
              VIEW_LOGS
            </button>
          </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {[
          { label: 'SYSTEM', status: 'STABLE', icon: <Wifi size={14}/> },
          { label: 'SECURITY', status: 'ACTIVE', icon: <ShieldCheck size={14}/> },
          { label: 'DATABASE', status: 'OPTIMAL', icon: <Target size={14}/> },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-6 bg-black border border-white/5">
             <div className="flex items-center gap-4"><div className="text-accent">{item.icon}</div><span className="text-[9px] font-heading text-muted uppercase tracking-[0.3em] font-black">{item.label}</span></div>
             <span className="text-[10px] font-heading text-accent font-black uppercase tracking-widest">{item.status}</span>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'ACCOUNT_OPEN', path: '/account-open', icon: <Globe size={16}/>, color: 'border-accent/20 hover:border-accent' },
          { label: 'REVENUE_PLANS', path: '/subscription-plans', icon: <Zap size={16}/>, color: 'border-yellow-500/20 hover:border-yellow-500' },
          { label: 'USER_REGISTRY', path: '/users', icon: <Users size={16}/>, color: 'border-white/10 hover:border-white/40' },
          { label: 'DOC_ARCHIVE', path: '/documents', icon: <FileText size={16}/>, color: 'border-white/10 hover:border-white/40' }
        ].map((action, i) => (
          <button 
            key={i}
            onClick={() => window.location.hash = `#${action.path}`}
            className={`p-6 bg-surface/40 border ${action.color} transition-all flex items-center justify-between group`}
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 75%, 85% 100%, 0 100%)' }}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-black border border-white/10 text-white group-hover:text-accent transition-colors">{action.icon}</div>
              <span className="text-[10px] font-heading font-black text-white uppercase tracking-[0.3em]">{action.label}</span>
            </div>
            <TrendingUp size={14} className="text-muted/20 group-hover:text-accent transition-colors" />
          </button>
        ))}
      </div>
      <style>{` @keyframes v-scan { 0% { top: -10%; opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.8; } 100% { top: 110%; opacity: 0; } } `}</style>
    </div>
  );
};

export default AdminDashboard;
