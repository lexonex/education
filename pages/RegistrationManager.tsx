
import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDataStore } from '../store/dataStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import ConfirmDialog from '../components/ConfirmDialog';
import { 
  Key, 
  Plus, 
  Copy, 
  Trash2, 
  ShieldCheck, 
  Activity, 
  Fingerprint, 
  Clock, 
  Terminal,
  Cpu,
  Lock,
  Wifi,
  ShieldAlert,
  Database,
  User as UserIcon,
  CalendarCheck,
  AlertTriangle,
  ShieldX,
  XCircle,
  Share2
} from 'lucide-react';

const RegistrationManager: React.FC = () => {
  const { registrationTokens, generateRegistrationToken, revokeRegistrationToken } = useDataStore();
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  
  const handleGenerate = () => { 
    generateRegistrationToken(user?.displayName || 'ADMIN'); 
    addNotification('SUCCESS', 'GENERATED', 'Successfully generated registration token.');
  };
  
  const copyToClipboard = (key: string) => { 
    navigator.clipboard.writeText(key); 
    addNotification('SUCCESS', 'COPIED', 'Registration token mirrored to clipboard.');
  };

  const copyLinkToClipboard = (key: string) => {
    const inviteLink = `${window.location.origin}/#/login?token=${key}`;
    navigator.clipboard.writeText(inviteLink);
    addNotification('SUCCESS', 'COPIED', 'Invitation link mirrored to clipboard.');
  };

  const confirmRevoke = () => {
    if (deleteTarget) {
      revokeRegistrationToken(deleteTarget);
      addNotification('WARNING', 'REVOKED', `Registration token ${deleteTarget} has been invalidated.`);
      setDeleteTarget(null);
    }
  };
  
  const sortedKeys = useMemo(() => { 
    return [...registrationTokens].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); 
  }, [registrationTokens]);
  
  const activeKeys = registrationTokens.filter(k => k.status === 'ACTIVE').length;

  const statItems = [
    { label: 'TOKENS', val: registrationTokens.length, color: 'text-white', icon: <Database size={16}/>, desc: 'COUNT' },
    { label: 'ACTIVE', val: activeKeys, color: 'text-accent', icon: <Wifi size={16}/>, desc: 'VALID' },
    { label: 'USED', val: registrationTokens.filter(k => k.status === 'USED').length, color: 'text-yellow-500', icon: <Activity size={16}/>, desc: 'USED' },
    { label: 'REVOKED', val: registrationTokens.filter(k => k.status === 'REVOKED').length, color: 'text-error', icon: <Lock size={16}/>, desc: 'VOID' },
  ];

  return (
    <div className="max-w-[1700px] mx-auto space-y-10 animate-in fade-in duration-1000 pb-20 relative px-0.5 sm:px-4 select-none">
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-accent">
            <Key size={16} className="animate-pulse" />
            <p className="text-[10px] font-heading tracking-[0.5em] uppercase font-black">TERMINAL</p>
          </div>
          <h2 className="text-2xl sm:text-5xl font-heading font-black tracking-tighter text-white uppercase leading-none">REGISTRATION</h2>
        </div>
        
        <button 
          onClick={handleGenerate} 
          className="hidden md:flex w-full md:w-auto bg-white text-black px-8 py-4 text-[10px] font-heading font-black tracking-[0.2em] uppercase hover:bg-accent transition-all items-center justify-center gap-3 active:scale-95 shadow-glow-sm" 
          style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
        >
          <Plus size={18} /> NEW_TOKEN
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
                     <p className="text-[7px] font-heading tracking-[0.4em] text-muted uppercase opacity-40">RT_{i.toString().padStart(2, '0')}</p>
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
          onClick={handleGenerate} 
          className="w-full bg-white text-black py-4 text-[10px] font-heading font-black tracking-[0.2em] uppercase hover:bg-accent transition-all flex items-center justify-center gap-3 active:scale-95 shadow-glow-sm" 
          style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
        >
          <Plus size={18} /> NEW_TOKEN
        </button>
      </div>



      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Terminal size={14} className="text-accent" />
            <h3 className="font-heading text-xs tracking-[0.3em] uppercase text-white font-black">HISTORY</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
              {sortedKeys.map(key => (
                <div key={key.id} className={`bg-black/60 border border-white/5 p-3 sm:p-6 flex flex-row items-center gap-3 sm:gap-6 transition-all relative overflow-hidden ${key.status === 'USED' ? 'opacity-70' : ''}`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 95% 100%, 0 100%)' }}>
                   <div className={`absolute left-0 top-0 bottom-0 w-1 ${key.status === 'ACTIVE' ? 'bg-accent shadow-glow' : key.status === 'USED' ? 'bg-yellow-500' : 'bg-error'}`}></div>
                   
                   <div className="p-1.5 sm:p-3 bg-white/[0.03] border border-white/10 shrink-0">
                     <Key size={14} className={`${key.status === 'ACTIVE' ? 'text-accent' : 'text-muted'} sm:hidden`} />
                     <Key size={18} className={`${key.status === 'ACTIVE' ? 'text-accent' : 'text-muted'} hidden sm:block`} />
                   </div>
                   
                   {/* Info Grid for consistent sizing across all states */}
                   <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 flex-1 w-full min-w-0">
                     <div className="min-w-0 flex-1 sm:flex-none sm:w-[220px]">
                       <span className={`text-[10px] sm:text-xl font-heading font-black tracking-widest uppercase transition-colors block truncate ${key.status === 'ACTIVE' ? 'text-white' : 'text-zinc-500'}`}>
                         {key.key}
                       </span>
                     </div>
                     
                     <div className="flex flex-row items-center gap-3 sm:gap-32 shrink-0 w-[130px] sm:w-[550px] justify-start sm:justify-between sm:pl-16">
                       <div className="w-12 sm:w-24 flex justify-center shrink-0">
                         <span className={`text-[7px] sm:text-[9px] px-1.5 sm:px-3 py-0.5 sm:py-1 border w-full text-center font-heading uppercase tracking-tighter ${
                           key.status === 'ACTIVE' ? 'border-accent/40 text-accent bg-accent/5' : 
                           key.status === 'USED' ? 'border-yellow-500/40 text-yellow-500 bg-yellow-500/5' : 
                           'border-error/40 text-error bg-error/5'
                         }`}>
                           {key.status}
                         </span>
                       </div>
                       
                       <div className="flex flex-col items-start shrink-0 w-[70px] sm:w-[180px]">
                         <span className="text-[7px] text-muted/40 font-heading uppercase tracking-[0.2em]">ORIGIN_AUTH</span>
                         <span className="text-[10px] text-muted font-heading uppercase truncate w-full">{key.generatedBy}</span>
                       </div>
                     </div>
                     

                     


                     <div className="flex items-center gap-1 sm:gap-1.5 justify-end shrink-0 w-[92px] sm:w-[120px]">
                        {key.status === 'ACTIVE' && (
                          <>
                            <button 
                              onClick={() => copyToClipboard(key.key)} 
                              title="Copy Token"
                              className="w-7 h-7 sm:w-9 sm:h-9 bg-white/5 border border-white/10 text-muted/40 hover:text-accent hover:border-accent/40 transition-all flex items-center justify-center group square-button"
                            >
                              <Copy size={12} className="group-active:scale-90 transition-transform sm:hidden" />
                              <Copy size={14} className="group-active:scale-90 transition-transform hidden sm:block" />
                            </button>
                            <button 
                              onClick={() => copyLinkToClipboard(key.key)} 
                              title="Copy Invite Link"
                              className="w-7 h-7 sm:w-9 sm:h-9 bg-white/5 border border-white/10 text-muted/40 hover:text-accent hover:border-accent/40 transition-all flex items-center justify-center group square-button"
                            >
                              <Share2 size={12} className="group-active:scale-90 transition-transform sm:hidden" />
                              <Share2 size={14} className="group-active:scale-90 transition-transform hidden sm:block" />
                            </button>
                          </>
                        )}
                        {key.status !== 'REVOKED' && (
                          <button 
                            onClick={() => setDeleteTarget(key.id)} 
                            title="Revoke Token Access"
                            className="w-7 h-7 sm:w-9 sm:h-9 bg-error/5 border border-error/20 text-error/60 hover:bg-error hover:text-white hover:border-error transition-all flex items-center justify-center group square-button"
                          >
                            <ShieldAlert size={12} className="group-hover:animate-pulse sm:hidden" />
                            <ShieldAlert size={14} className="group-hover:animate-pulse hidden sm:block" />
                          </button>
                        )}
                     </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-zinc-950 border border-white/10 p-10 space-y-8 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 95%, 90% 100%, 0 100%)' }}>
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Cpu size={16} className="text-accent" />
                <h3 className="font-heading text-xs tracking-[0.2em] uppercase text-white font-black">SECURITY</h3>
              </div>
              <p className="text-[10px] text-muted leading-relaxed uppercase tracking-widest font-bold">
                One-time identifiers for neural linking. These tokens permit a single account creation event before being marked as USED. Revoking a key immediately terminates its validity.
              </p>
              <div className="pt-4 flex items-center gap-3 opacity-40">
                 <ShieldCheck size={14} className="text-accent" />
                 <span className="text-[8px] font-heading uppercase tracking-widest">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmRevoke}
        title="TOKEN_REVOCATION"
        message="Confirm registration token invalidation. This will immediately kill the signal for this token, preventing any pending neural link attempts."
        confirmLabel="REVOKE"
      />

      <style>{` @keyframes v-scan { 0% { top: -10%; opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.8; } 100% { top: 110%; opacity: 0; } } `}</style>
    </div>
  );
};

export default RegistrationManager;
