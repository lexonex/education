
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDataStore } from '../store/dataStore';
import { useUIStore } from '../store/uiStore';
import ConfirmDialog from '../components/ConfirmDialog';
import { 
  History, 
  Terminal, 
  Search, 
  Clock, 
  Activity, 
  Cpu, 
  Database, 
  Wifi, 
  ShieldCheck, 
  Zap,
  Box,
  Binary,
  Layers,
  ChevronRight,
  Filter,
  Trash2,
  Loader2,
  AlertTriangle
} from 'lucide-react';

const ActivityLogsPage: React.FC = () => {
  const { systemLogs, clearLogs } = useDataStore();
  const { addNotification } = useUIStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isWiping, setIsWiping] = useState(false);
  const [showConfirmWipe, setShowConfirmWipe] = useState(false);

  const filteredLogs = systemLogs.filter(log => log.action.toLowerCase().includes(searchTerm.toLowerCase()) || log.user.toLowerCase().includes(searchTerm.toLowerCase()) || log.details.toLowerCase().includes(searchTerm.toLowerCase()));
  const stats = { total: systemLogs.length, critical: systemLogs.filter(l => l.action.includes('PURGE')).length };

  const handleClearLogs = async () => {
    setIsWiping(true);
    setShowConfirmWipe(false);
    try { 
      await clearLogs(); 
      addNotification('SUCCESS', 'COMPLETE', 'Logs initialized.'); 
    } 
    catch (e) { 
      addNotification('ERROR', 'FAILED', 'Registry communication error.'); 
    } 
    finally { 
      setIsWiping(false); 
    }
  };

  const statItems = [
    { label: 'LOGS', val: stats.total, color: 'text-white', icon: <Database size={16}/>, desc: 'TOTAL' },
    { label: 'SIGNAL', val: '99.9%', color: 'text-accent', icon: <Wifi size={16}/>, desc: 'SYNC' },
    { label: 'UPTIME', val: '24:00', color: 'text-yellow-500', icon: <Clock size={16}/>, desc: 'ACTIVE' },
    { label: 'ERRORS', val: stats.critical, color: 'text-error', icon: <Activity size={16}/>, desc: 'CRITICAL' },
  ];

  return (
    <div className="max-w-[1700px] mx-auto space-y-10 animate-in fade-in duration-1000 pb-20 relative px-0.5 sm:px-4 select-none">
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-accent">
            <History size={16} className="animate-pulse" />
            <p className="text-[10px] font-heading tracking-[0.5em] uppercase font-black">LOGS</p>
          </div>
          <h2 className="text-2xl sm:text-5xl font-heading font-black tracking-tighter text-white uppercase leading-none">LOGS</h2>
        </div>

        <button 
          onClick={() => setShowConfirmWipe(true)} 
          disabled={isWiping} 
          className="hidden md:flex w-full md:w-auto bg-white text-black px-8 py-4 text-[10px] font-heading font-black tracking-[0.2em] uppercase hover:bg-error hover:text-white transition-all items-center justify-center gap-3 active:scale-95 shadow-glow-sm" 
          style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
        >
          {isWiping ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />} WIPE
        </button>
      </div>

      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-4">
        {statItems.map((s, i) => (
          <div key={i} className={`bg-surface/80 border border-white/5 p-2 sm:p-5 relative overflow-hidden group transition-all duration-500 flex flex-col justify-between min-h-[140px] sm:min-h-[180px] ${
            s.color === 'text-white' ? 'hover:border-white/40' : 
            s.color === 'text-accent' ? 'hover:border-accent/40' : 
            s.color === 'text-yellow-500' ? 'hover:border-yellow-500/40' : 
            'hover:border-error/40'
          }`}>
             <div className={`absolute top-0 right-0 w-12 sm:w-16 h-1 opacity-20 ${s.color.replace('text-', 'bg-')}`}></div>
             <div className={`absolute bottom-0 left-0 w-1 h-8 sm:h-12 opacity-20 ${s.color.replace('text-', 'bg-')}`}></div>
             
             <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className={`p-2 sm:p-3 bg-black border border-white/10 ${s.color} transition-all duration-300
                    ${s.color === 'text-white' ? 'group-hover:bg-white group-hover:text-black' : 
                      s.color === 'text-accent' ? 'group-hover:bg-accent group-hover:text-black' : 
                      s.color === 'text-yellow-500' ? 'group-hover:bg-yellow-500 group-hover:text-black' : 
                      s.color === 'text-error' ? 'group-hover:bg-error group-hover:text-black' : 
                      'group-hover:bg-white group-hover:text-black'}`}>
                    {s.icon}
                  </div>
                  <div className="text-right hidden sm:block">
                     <p className="text-[7px] font-heading tracking-[0.4em] text-muted uppercase opacity-40">LG_{i.toString().padStart(2, '0')}</p>
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

      <div className="md:hidden relative z-10">
        <button 
          onClick={() => setShowConfirmWipe(true)} 
          disabled={isWiping} 
          className="w-full bg-white text-black py-4 text-[10px] font-heading font-black tracking-[0.2em] uppercase hover:bg-error hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 shadow-glow-sm" 
          style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
        >
          {isWiping ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />} WIPE
        </button>
      </div>

      <div className="relative z-10 flex flex-col-reverse xl:flex-row gap-2 sm:gap-4 bg-black/60 border border-white/5 p-1.5 sm:p-2 backdrop-blur-xl">
        <div className="flex-1 relative group bg-surface/40">
           <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" />
           <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="SEARCH..." className="w-full bg-transparent px-12 py-3 sm:px-16 sm:py-5 text-[10px] sm:text-[11px] font-heading tracking-[0.3em] uppercase outline-none focus:border-accent transition-colors duration-300 placeholder:text-muted/10" />
        </div>
      </div>

      <div className="relative z-10 bg-black/40 border border-white/5 overflow-hidden flex flex-col" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 98%, 98% 100%, 0 100%)' }}>
        <div className="bg-zinc-950 p-6 border-b border-white/5 flex items-center justify-between"><div className="flex items-center gap-4"><div className="w-2 h-2 bg-accent animate-ping"></div><h4 className="font-heading text-xs tracking-[0.4em] uppercase text-white font-black">STREAM</h4></div></div>
        <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead><tr className="bg-white/[0.02] border-b border-white/5"><th className="px-8 py-5 font-heading text-[10px] text-muted tracking-[0.3em] uppercase">TIME</th><th className="px-8 py-5 font-heading text-[10px] text-muted tracking-[0.3em] uppercase">ACTION</th><th className="px-8 py-5 font-heading text-[10px] text-muted tracking-[0.3em] uppercase">USER</th></tr></thead><tbody className="divide-y divide-white/5">{filteredLogs.map(log => (<tr key={log.id} className="group hover:bg-white/[0.03] transition-colors relative">
  <td className="px-8 py-6 whitespace-nowrap relative">
    <div className="absolute left-0 top-0 w-1 h-0 bg-accent group-hover:h-full transition-all"></div>
    <span className="font-heading text-[11px] text-white/60 tracking-tighter">{new Date(log.timestamp).toLocaleTimeString()}</span>
  </td>
  <td className="px-8 py-6">
    <span className="px-3 py-1 border border-accent/20 text-accent font-heading text-[9px] uppercase font-black">{log.action}</span>
  </td>
  <td className="px-8 py-6">
    <span className="font-heading text-[11px] font-black uppercase text-white tracking-widest">{log.user}</span>
  </td>
</tr>))}</tbody></table></div>
      </div>

      <ConfirmDialog 
        isOpen={showConfirmWipe}
        onClose={() => setShowConfirmWipe(false)}
        onConfirm={handleClearLogs}
        title="REGISTRY_WIPE"
        message="Are you certain you want to clear all activity logs from the central registry? This action is irreversible and will remove all audit trails."
        confirmLabel="DELETE"
      />

      <style>{` @keyframes v-scan { 0% { top: -10%; opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.8; } 100% { top: 110%; opacity: 0; } } `}</style>
    </div>
  );
};

export default ActivityLogsPage;
