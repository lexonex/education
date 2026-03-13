
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useDataStore } from '../store/dataStore';
import { useUIStore } from '../store/uiStore';
import ConfirmDialog from '../components/ConfirmDialog';
import { 
  Zap, 
  Plus, 
  Search, 
  Trash2, 
  Calendar, 
  Clock, 
  Shield, 
  Cpu, 
  Wifi, 
  Ticket,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Hash,
  X,
  ChevronRight,
  Layers,
  Copy,
  Eye,
  User,
  Mail,
  Phone,
  MapPin,
  Fingerprint,
  Activity,
  Wrench,
  Key,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { SubscriptionCode } from '../types';

const SubscriptionManagementPage: React.FC = () => {
  const { 
    subscriptionCodes, 
    categories, 
    students, 
    generateSubscriptionCode, 
    suspendSubscriptionCode,
    ownerName,
    ownerEmail
  } = useDataStore();
  const { addNotification } = useUIStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCodeForView, setSelectedCodeForView] = useState<SubscriptionCode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  
  // Form State
  const [type, setType] = useState<'CATEGORY' | 'MONEY_MANAGEMENT'>('MONEY_MANAGEMENT');
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [selectedTargetDurations, setSelectedTargetDurations] = useState<Record<string, number>>({});
  const [selectedInSummary, setSelectedInSummary] = useState<string[]>([]);
  const [targetSearch, setTargetSearch] = useState('');
  const [duration, setDuration] = useState(30);
  const [expiryDays, setExpiryDays] = useState<number | string>(7);

  const confirmSuspend = () => {
    if (deleteTarget) {
      suspendSubscriptionCode(deleteTarget);
      setDeleteTarget(null);
      addNotification('WARNING', 'SUSPENDED', 'Access code has been invalidated.');
    }
  };

  const displayCodes = subscriptionCodes.filter(c => c.type !== 'MANUAL_UPDATE' as any);

  const filteredCodes = displayCodes
    .filter(c => 
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.status.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const categoryResults = useMemo(() => {
    let items: { id: string, name: string, isTool?: boolean }[] = [];
    if (type === 'MONEY_MANAGEMENT') {
      items = [{ id: 'MONEY_MGMT', name: 'MONEY_MANAGEMENT', isTool: true }];
    } else {
      items = categories.map(c => ({ id: c.id, name: c.name }));
    }

    return items.filter(item => 
      item.name.toLowerCase().includes(targetSearch.toLowerCase()) && 
      !selectedTargets.includes(item.id) &&
      !Object.keys(selectedTargetDurations).includes(item.id)
    );
  }, [categories, targetSearch, type, selectedTargets, selectedTargetDurations]);

  const statItems = [
    { label: 'TOTAL_CODES', val: displayCodes.length, color: 'text-white', icon: <Hash size={16}/>, desc: 'REGISTRY_TOTAL' },
    { label: 'ACTIVE', val: displayCodes.filter(c => c.status === 'ACTIVE').length, color: 'text-accent', icon: <Zap size={16}/>, desc: 'AUTH_VERIFIED' },
    { label: 'USED', val: displayCodes.filter(c => c.status === 'USED').length, color: 'text-yellow-500', icon: <CheckCircle2 size={16}/>, desc: 'HANDSHAKE_USED' },
    { label: 'EXPIRED', val: displayCodes.filter(c => c.status === 'EXPIRED').length, color: 'text-error', icon: <XCircle size={16}/>, desc: 'ACCESS_REJECTED' },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      let expiresAt: string | undefined = undefined;
      if (expiryDays) {
        const date = new Date();
        date.setDate(date.getDate() + Number(expiryDays));
        expiresAt = date.toISOString();
      }

      const allTargetIds = Object.keys(selectedTargetDurations);
      if (allTargetIds.length === 0) {
        addNotification('ERROR', 'EMPTY_PAYLOAD', 'Please confirm at least one payload with duration.');
        return;
      }

      await generateSubscriptionCode({
        type: allTargetIds.includes('MONEY_MGMT') && allTargetIds.length === 1 ? 'MONEY_MANAGEMENT' : 'CATEGORY',
        targetIds: allTargetIds,
        durationDays: Number(duration),
        expiresAt,
        targetDurations: selectedTargetDurations
      });
      
      // Reset form
      setSelectedTargets([]);
      setSelectedTargetDurations({});
      setSelectedInSummary([]);
      setTargetSearch('');
      setDuration(30);
      setExpiryDays(7);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTarget = (id: string) => {
    if (selectedTargets.includes(id)) {
      setSelectedTargets(selectedTargets.filter(t => t !== id));
    } else {
      setSelectedTargets([...selectedTargets, id]);
    }
  };

  const confirmPayloads = () => {
    if (selectedTargets.length === 0) return;
    const newDurations = { ...selectedTargetDurations };
    selectedTargets.forEach(id => {
      newDurations[id] = Number(duration);
    });
    setSelectedTargetDurations(newDurations);
    setSelectedTargets([]); // Clear pending
    addNotification('SUCCESS', 'PAYLOAD_SYNCED', `${selectedTargets.length} items added to provision stack.`);
  };

  const removeConfirmedPayload = (id: string) => {
    const newDurations = { ...selectedTargetDurations };
    delete newDurations[id];
    setSelectedTargetDurations(newDurations);
    setSelectedInSummary(selectedInSummary.filter(sid => sid !== id));
  };

  const toggleSummarySelection = (id: string) => {
    if (selectedInSummary.includes(id)) {
      setSelectedInSummary(selectedInSummary.filter(sid => sid !== id));
    } else {
      setSelectedInSummary([...selectedInSummary, id]);
    }
  };

  const setBatchDuration = (days: number) => {
    const newDurations = { ...selectedTargetDurations };
    selectedInSummary.forEach(id => {
      newDurations[id] = days;
    });
    setSelectedTargetDurations(newDurations);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addNotification('SUCCESS', 'COPIED_TO_CLIPBOARD', `Access code ${text} copied.`);
  };

  const CodeDetailsModal = ({ code, onClose }: { code: SubscriptionCode, onClose: () => void }) => {
    const { students, ownerName, ownerEmail, ownerPhone, ownerAddress, currentAdminId } = useDataStore();
    const usedByUser = code.usedBy ? students.find(s => s.uid === code.usedBy) : null;
    const isAdminRedeemer = code.usedBy === code.adminId;
    const generatedByName = code.adminId === currentAdminId ? ownerName : 'System Admin';
    
    // Resolve redeemer info
    const redeemerInfo = isAdminRedeemer ? {
      displayName: ownerName,
      email: ownerEmail,
      phone: ownerPhone,
      address: ownerAddress,
      username: 'ADMIN_ROOT',
      photoURL: null
    } : usedByUser;

    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>
        
        <div 
          className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 shadow-[0_0_100px_rgba(0,240,255,0.1)] overflow-hidden flex flex-col max-h-[90vh]"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)' }}
        >
          {/* Modal Header */}
          <div className="p-6 sm:p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02] shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-accent/10 border border-accent/20 relative">
                <Layers size={20} className="text-accent" />
                <div className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t border-l border-accent"></div>
                <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b border-r border-accent"></div>
              </div>
              <div>
                <h3 className="text-lg font-heading font-black text-white uppercase tracking-widest">CODE_DETAILS</h3>
                <p className="text-[8px] font-heading text-muted/40 uppercase tracking-[0.4em]">ENTRY_ID: {code.id.slice(0, 8)}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-muted hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
            {/* Code Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-[8px] font-heading font-black text-muted/40 uppercase tracking-[0.4em]">Access_Code</p>
                <div className="flex items-center gap-3 bg-black border border-white/5 p-4 group">
                  <span className="text-xl font-mono font-black text-accent tracking-widest">{code.code}</span>
                  <button 
                    onClick={() => copyToClipboard(code.code)} 
                    disabled={code.status !== 'ACTIVE'}
                    className={`transition-colors ${code.status === 'ACTIVE' ? 'text-muted/20 hover:text-accent' : 'text-muted/5 cursor-not-allowed'}`}
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[8px] font-heading font-black text-muted/40 uppercase tracking-[0.4em]">Current_Status</p>
                <div className={`p-4 border font-heading font-black text-xs tracking-widest uppercase flex items-center gap-3 ${
                  code.status === 'ACTIVE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                  code.status === 'USED' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                  code.status === 'SUSPENDED' ? 'bg-error/10 border-error/20 text-error' :
                  'bg-zinc-500/10 border-zinc-500/20 text-zinc-500'
                }`}>
                  <Activity size={14} className="animate-pulse" />
                  {code.status}
                </div>
              </div>
            </div>

            {/* Permission Matrix */}
            <div className="space-y-4">
              <p className="text-[8px] font-heading font-black text-muted/40 uppercase tracking-[0.4em]">PERMISSIONS</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {code.type === 'MONEY_MANAGEMENT' || (code.targetIds && code.targetIds.includes('MONEY_MGMT')) ? (
                  <div className="p-4 bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Wrench size={14} className="text-white/40" />
                      <span className="text-[10px] font-heading font-bold text-white/80 uppercase tracking-widest">MONEY_MANAGEMENT</span>
                    </div>
                    {code.targetDurations?.['MONEY_MGMT'] && (
                      <span className="text-[8px] font-mono text-white/40">{code.targetDurations['MONEY_MGMT']}D</span>
                    )}
                  </div>
                ) : null}
                {code.targetIds?.filter(tid => tid !== 'MONEY_MGMT').map(tid => {
                  const cat = categories.find(c => c.id === tid);
                  return (
                    <div key={tid} className="p-4 bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Layers size={14} className="text-white/40" />
                        <span className="text-[10px] font-heading font-bold text-white/80 uppercase tracking-widest">{cat?.name || 'Unknown Sector'}</span>
                      </div>
                      {code.targetDurations?.[tid] && (
                        <span className="text-[8px] font-mono text-white/40">{code.targetDurations[tid]}D</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timing Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-[8px] font-heading font-black text-muted/40 uppercase tracking-[0.4em]">Generated_By</p>
                <div className="flex items-center gap-3 text-white/60">
                  <Shield size={14} className="text-accent" />
                  <span className="text-sm font-mono uppercase">{generatedByName}</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[8px] font-heading font-black text-muted/40 uppercase tracking-[0.4em]">Duration</p>
                <div className="flex items-center gap-3 text-white/60">
                  <Clock size={14} className="text-accent" />
                  <span className="text-sm font-mono">{code.durationDays} Days</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[8px] font-heading font-black text-muted/40 uppercase tracking-[0.4em]">EXPIRY</p>
                <div className="flex items-center gap-3 text-white/60">
                  <Calendar size={14} className="text-accent" />
                  <span className="text-sm font-mono">{code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : 'PERMANENT_LINK'}</span>
                </div>
              </div>
            </div>

            {/* User Info (If Used) */}
            {redeemerInfo && (
              <div className="space-y-4 pt-6 border-t border-white/5">
                <p className="text-[8px] font-heading font-black text-accent uppercase tracking-[0.4em]">REDEEMED_BY</p>
                <div className="bg-white/[0.02] border border-white/5 p-6 flex flex-col sm:flex-row gap-6 items-center">
                  <div className="w-20 h-20 bg-black border border-white/10 p-1 shrink-0">
                    {redeemerInfo.photoURL ? (
                      <img src={redeemerInfo.photoURL} className="w-full h-full object-cover grayscale" alt="User" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                        <User size={32} className="text-muted/20" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <div className="space-y-1">
                      <p className="text-[7px] font-heading text-muted uppercase tracking-widest">FULL_NAME</p>
                      <p className="text-xs font-heading font-black text-white uppercase">{redeemerInfo.displayName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[7px] font-heading text-muted uppercase tracking-widest">USERNAME</p>
                      <p className="text-xs font-heading font-black text-accent uppercase">@{redeemerInfo.username || 'UNSET'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[7px] font-heading text-muted uppercase tracking-widest">EMAIL_ADDRESS</p>
                      <p className="text-[10px] font-heading text-white/60 uppercase truncate">{redeemerInfo.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[7px] font-heading text-muted uppercase tracking-widest">CONTACT_NUMBER</p>
                      <p className="text-[10px] font-heading text-white/60 uppercase">{redeemerInfo.phone || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[7px] font-heading text-muted uppercase tracking-widest">PHYSICAL_ADDRESS</p>
                      <p className="text-[10px] font-heading text-white/60 uppercase truncate">{redeemerInfo.address || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[7px] font-heading text-muted uppercase tracking-widest">Redeemed_At</p>
                      <p className="text-[10px] font-heading text-white/60 uppercase">{code.usedAt ? new Date(code.usedAt).toLocaleString() : 'UNKNOWN'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-end shrink-0">
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-white text-black font-heading font-black text-[10px] tracking-[0.4em] uppercase hover:bg-accent transition-all"
              style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="max-w-[1700px] mx-auto space-y-6 sm:space-y-10 animate-in fade-in duration-1000 pb-20 relative px-0.5 sm:px-4 select-none">
      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-accent">
            <Ticket size={16} className="animate-pulse" />
            <p className="text-[10px] font-heading tracking-[0.5em] uppercase font-black">SUBSCRIPTION_MANAGEMENT</p>
          </div>
          <h2 className="text-2xl sm:text-5xl font-heading font-black tracking-tighter text-white uppercase leading-none">SUBSCRIPTION_MANAGEMENT</h2>
        </div>
      </div>

      {/* Stats Grid */}
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

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Generator Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface border border-white/5 p-8 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3 border-l-2 border-accent pl-4">
              <h3 className="text-xs font-heading font-black text-white uppercase tracking-[0.4em]">GENERATE_CODE</h3>
            </div>

            <div className="space-y-8">
              {/* Access Type */}
              <div className="space-y-3">
                <label className="text-[8px] font-heading font-black text-muted/40 uppercase tracking-[0.4em] block">PERM_TYPE</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => { setType('MONEY_MANAGEMENT'); setTargetSearch(''); }}
                    className={`py-4 px-4 border text-[9px] font-heading font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${type === 'MONEY_MANAGEMENT' ? 'bg-accent border-accent text-black shadow-glow-sm' : 'bg-black/40 border-white/5 text-muted/40 hover:border-white/20'}`}
                    style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                  >
                    <TrendingUp size={14} />
                    TOOLS
                  </button>
                  <button 
                    onClick={() => { setType('CATEGORY'); setTargetSearch(''); }}
                    className={`py-4 px-4 border text-[9px] font-heading font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${type === 'CATEGORY' ? 'bg-accent border-accent text-black shadow-glow-sm' : 'bg-black/40 border-white/5 text-muted/40 hover:border-white/20'}`}
                    style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                  >
                    <Layers size={14} />
                    PERMISSIONS
                  </button>
                </div>
              </div>

              {/* Target Selection Box */}
              <div className="space-y-4 group">
                <label className="flex items-center gap-2 text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                  <Search size={14} className="text-accent/40 group-focus-within:text-accent" />
                  {type === 'CATEGORY' ? 'SEARCH_OTHERS_PERMISSIONS' : 'SEARCH_TOOL_PERMISSIONS'}
                </label>
                
                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                    <input 
                      type="text"
                      value={targetSearch}
                      onChange={(e) => setTargetSearch(e.target.value)}
                      placeholder="SEARCH_PERMISSIONS..."
                      className="w-full bg-white/[0.02] border border-white/10 py-4 pl-12 pr-5 text-[11px] font-heading text-white focus:border-accent/50 outline-none transition-colors duration-300 placeholder:text-muted/10 uppercase"
                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                    />
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/40 group-focus-within:text-accent transition-colors" />
                    <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                  </div>
                  
                  {/* Results Area - Compact */}
                  <div className="bg-[#080808] border border-white/10">
                    <div className="p-2 border-b border-white/5 bg-white/[0.02]">
                      <p className="text-[7px] font-heading font-black text-muted/40 uppercase tracking-[0.3em]">AVAILABLE:</p>
                    </div>
                    <div className="divide-y divide-white/5">
                      {categoryResults.length > 0 ? (
                        categoryResults.slice(0, 10).map(res => (
                          <button 
                            key={res.id}
                            onClick={() => toggleTarget(res.id)}
                            className="w-full text-left p-3 hover:bg-accent/5 flex items-center justify-between group transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-1 h-1 bg-accent/40 group-hover:bg-accent transition-colors"></div>
                              <span className="text-[9px] font-heading font-bold text-white/60 group-hover:text-white uppercase tracking-widest">{res.name}</span>
                            </div>
                            <Plus size={10} className="text-muted/20 group-hover:text-accent transition-all" />
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-[8px] font-heading text-muted/20 uppercase tracking-widest">No_Results_Found</p>
                        </div>
                      )}
                      {categoryResults.length > 10 && (
                        <div className="p-2 text-center border-t border-white/5 bg-black/20">
                          <p className="text-[7px] font-heading text-muted/40 uppercase tracking-widest italic">Showing first 10 results. Refine search to see more.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pending Selection Display */}
                {selectedTargets.length > 0 && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 bg-accent/5 border border-accent/20 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[7px] font-heading font-black text-accent uppercase tracking-[0.3em]">PENDING:</p>
                      <button onClick={() => setSelectedTargets([])} className="text-[7px] font-heading font-black text-error/40 hover:text-error uppercase tracking-widest transition-colors">DISCARD</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedTargets.map(id => {
                        const name = id === 'MONEY_MGMT' ? 'MONEY_MANAGEMENT' : categories.find(c => c.id === id)?.name;
                        return (
                          <div key={id} className="flex items-center gap-2 bg-accent/10 border border-accent/20 px-2 py-1">
                            <span className="text-[8px] font-heading font-bold text-accent uppercase tracking-widest">{name}</span>
                            <button onClick={() => toggleTarget(id)} className="text-accent/40 hover:text-accent"><X size={10} /></button>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[6px] font-heading text-accent/40 uppercase tracking-widest italic">Set duration below and click "ADD_TO_PROVISION_STACK"</p>
                  </div>
                )}

                {/* Confirmed Items Display */}
                {Object.keys(selectedTargetDurations).length > 0 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 bg-black/40 border border-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <p className="text-[7px] font-heading font-black text-white/60 uppercase tracking-[0.3em]">CONFIRMED:</p>
                        <button 
                          onClick={() => {
                            const allIds = Object.keys(selectedTargetDurations);
                            if (selectedInSummary.length === allIds.length) setSelectedInSummary([]);
                            else setSelectedInSummary(allIds);
                          }}
                          className="text-[7px] font-heading font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors"
                        >
                          {selectedInSummary.length === Object.keys(selectedTargetDurations).length ? 'DESELECT_ALL' : 'SELECT_ALL'}
                        </button>
                      </div>
                      <button onClick={() => { setSelectedTargetDurations({}); setSelectedInSummary([]); }} className="text-[7px] font-heading font-black text-error/40 hover:text-error uppercase tracking-widest transition-colors">CLEAR_ALL</button>
                    </div>

                    <div className="space-y-2">
                      {Object.keys(selectedTargetDurations).map(id => {
                        const name = id === 'MONEY_MGMT' ? 'MONEY_MANAGEMENT' : categories.find(c => c.id === id)?.name;
                        const isSelected = selectedInSummary.includes(id);
                        return (
                          <div 
                            key={id} 
                            onClick={() => toggleSummarySelection(id)}
                            className={`flex items-center justify-between p-2 border transition-all cursor-pointer ${isSelected ? 'bg-accent/10 border-accent/40' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-1 h-3 ${isSelected ? 'bg-accent' : 'bg-white/10'}`}></div>
                              <div className="flex flex-col">
                                <span className={`text-[9px] font-heading font-bold uppercase tracking-widest ${isSelected ? 'text-accent' : 'text-white/60'}`}>{name}</span>
                                <span className="text-[7px] font-mono text-muted/40 uppercase">Duration: {selectedTargetDurations[id]}D</span>
                              </div>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); removeConfirmedPayload(id); }} 
                              className="w-6 h-6 flex items-center justify-center text-muted/20 hover:text-error transition-all"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Batch Duration Control for Confirmed Items */}
                    {selectedInSummary.length > 0 && (
                      <div className="pt-3 border-t border-white/5 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[7px] font-heading font-black text-white/40 uppercase tracking-[0.3em]">Update Duration for ({selectedInSummary.length}) Selected:</p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {[7, 15, 30, 90, 180, 365].map(d => (
                            <button 
                              key={d}
                              onClick={() => setBatchDuration(d)}
                              className="px-2 py-1 bg-white/5 border border-white/10 text-[8px] font-heading font-bold text-white/60 hover:bg-white hover:text-black transition-all"
                            >
                              {d}D
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Access Duration */}
              <div className="space-y-4 group">
                <label className="flex items-center gap-2 text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                  <Clock size={14} className="text-accent/40 group-focus-within:text-accent" />
                  ACCESS_DURATION_(DAYS)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[7, 15, 30, 90, 180, 365].map(d => (
                    <button 
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`py-2 text-[9px] font-heading font-bold border transition-all ${duration === d ? 'bg-white border-white text-black' : 'bg-black/40 border-white/5 text-muted/40 hover:border-white/20'}`}
                    >
                      {d === 365 ? '1Y' : d === 180 ? '6M' : d === 90 ? '3M' : d === 30 ? '1M' : `${d}D`}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                  <input 
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                    placeholder="CUSTOM_DAYS..."
                    className="w-full bg-white/[0.02] border border-white/10 py-4 pl-12 pr-5 text-[11px] font-heading text-white focus:border-accent/50 outline-none transition-colors duration-300 placeholder:text-muted/10"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                  />
                  <Clock size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/40 group-focus-within:text-accent transition-colors" />
                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                </div>
              </div>

              {/* Code Expiry */}
              <div className="space-y-4 group">
                <label className="flex items-center gap-2 text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                  <Calendar size={14} className="text-accent/40 group-focus-within:text-accent" />
                  CODE_EXPIRY_(DAYS)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 3, 7, 15, 30].map(d => (
                    <button 
                      key={d}
                      onClick={() => setExpiryDays(d)}
                      className={`py-2 text-[9px] font-heading font-bold border transition-all ${expiryDays === d ? 'bg-accent border-accent text-black' : 'bg-black/40 border-white/5 text-muted/40 hover:border-white/20'}`}
                    >
                      {d}D
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                  <input 
                    type="number"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(Math.max(1, parseInt(e.target.value) || 1))}
                    placeholder="CUSTOM_EXPIRY_DAYS..."
                    className="w-full bg-white/[0.02] border border-white/10 py-4 pl-12 pr-5 text-[11px] font-heading text-white focus:border-accent/50 outline-none transition-colors duration-300 placeholder:text-muted/10"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                  />
                  <Calendar size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/40 group-focus-within:text-accent transition-colors" />
                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                </div>
              </div>

              {/* Confirm Selection Button */}
              {selectedTargets.length > 0 && (
                  <button 
                    onClick={confirmPayloads}
                    className="w-full py-5 bg-white text-black font-heading text-[12px] font-black tracking-[0.6em] uppercase hover:bg-accent hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-4 animate-in slide-in-from-bottom-4 duration-500 group" 
                    style={{ clipPath: 'polygon(12% 0, 100% 0, 100% 65%, 88% 100%, 0 100%, 0 35%)' }}
                  >
                  <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                  ADD_TO_LIST
                </button>
              )}

              <button 
                onClick={handleGenerate}
                disabled={isGenerating || Object.keys(selectedTargetDurations).length === 0}
                className="w-full py-5 bg-accent text-black font-heading text-[12px] font-black tracking-[0.6em] uppercase hover:bg-white hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group" 
                style={{ clipPath: 'polygon(12% 0, 100% 0, 100% 65%, 88% 100%, 0 100%, 0 35%)' }}
              >
                {isGenerating ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                    GENERATE_CODE
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Codes List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Ticket size={16} className="text-accent" />
                <h3 className="text-xs font-heading font-black text-white uppercase tracking-[0.4em]">ACTIVE_CODES</h3>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH..."
                  className="bg-white/[0.02] border border-white/10 py-3 pl-10 pr-5 text-[10px] font-heading text-white focus:border-accent/50 outline-none transition-colors duration-300 w-full sm:w-64"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}
                />
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/40 group-focus-within:text-accent transition-colors" />
                <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
              </div>
            </div>

            <div className="flex flex-col">
              {/* Desktop Header Table */}
              <div className="overflow-x-auto hidden md:block bg-black border-b border-white/10">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr>
                      <th className="p-4 text-[8px] font-heading font-black text-muted/40 uppercase tracking-widest w-[35%]">ACCESS_CODE</th>
                      <th className="p-4 text-[8px] font-heading font-black text-muted/40 uppercase tracking-widest w-[12%]">DURATION</th>
                      <th className="p-4 text-[8px] font-heading font-black text-muted/40 uppercase tracking-widest text-center w-[13%]">STATUS</th>
                      <th className="p-4 text-[8px] font-heading font-black text-muted/40 uppercase tracking-widest w-[25%]">REDEEMER</th>
                      <th className="p-4 text-[8px] font-heading font-black text-muted/40 uppercase tracking-widest text-right w-[15%]">ACTIONS</th>
                    </tr>
                  </thead>
                </table>
              </div>

              <div className="overflow-x-auto overflow-y-auto max-h-[500px] sm:max-h-[600px] custom-scrollbar">
                {/* Desktop Body Table */}
                <table className="w-full text-left border-collapse table-fixed hidden md:table">
                  <tbody className="divide-y divide-white/[0.02]">
                  {filteredCodes.length > 0 ? (
                    filteredCodes.map((code) => {
                        const usedByUser = code.usedBy ? students.find(s => s.uid === code.usedBy) : null;
                        const isAdminRedeemer = code.usedBy === code.adminId;
                        const redeemerName = isAdminRedeemer ? ownerName : usedByUser?.displayName;
                        const redeemerEmail = isAdminRedeemer ? ownerEmail : usedByUser?.email;

                        const targetNames = code.type === 'MONEY_MANAGEMENT' 
                          ? 'MONEY_MANAGEMENT' 
                          : (!code.targetIds || code.targetIds.length === 0) 
                            ? 'ALL_PERMISSIONS' 
                            : code.targetIds.map(id => categories.find(c => c.id === id)?.name || 'UNKNOWN').join(', ');

                        return (
                          <tr key={code.id} className="group hover:bg-white/[0.02] transition-all border-b border-white/5 last:border-0">
                            <td className="p-4 w-[35%]">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 border flex items-center justify-center transition-all shrink-0 ${
                                  code.status === 'ACTIVE' ? 'bg-accent/5 border-accent/20 text-accent' : 'bg-white/[0.02] border-white/5 text-muted/10'
                                }`}>
                                  <Key size={16} />
                                </div>
                                <div className="flex flex-col gap-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[12px] font-mono font-black tracking-[0.15em] ${code.status === 'ACTIVE' ? 'text-white' : 'text-zinc-600'}`}>
                                      {code.code}
                                    </span>
                                    <button 
                                      onClick={() => copyToClipboard(code.code)}
                                      disabled={code.status !== 'ACTIVE'}
                                      className={`p-1.5 rounded-sm transition-all ${code.status === 'ACTIVE' ? 'text-muted/40 hover:text-accent hover:bg-accent/10' : 'text-muted/10 cursor-not-allowed'}`}
                                      title="Copy Code"
                                    >
                                      <Copy size={12} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 w-[12%]">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-white/60">
                                  <Clock size={10} className="text-accent/40" />
                                  <span className="text-[10px] font-mono font-bold">
                                    {code.targetDurations && Object.keys(code.targetDurations).length > 0 
                                      ? 'Mixed' 
                                      : `${code.durationDays} Days`}
                                  </span>
                                </div>
                                <span className="text-[7px] font-heading text-muted/10 uppercase tracking-widest">VALID_PERIOD</span>
                              </div>
                            </td>
                            <td className="p-4 w-[13%]">
                              <div className="flex justify-center">
                                <div className={`inline-flex items-center justify-center gap-2 px-3 py-1 border text-[8px] font-heading font-black tracking-[0.1em] uppercase w-[100px] ${
                                  code.status === 'ACTIVE' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500' :
                                  code.status === 'USED' ? 'bg-blue-500/5 border-blue-500/10 text-blue-500' :
                                  code.status === 'SUSPENDED' ? 'bg-error/5 border-error/10 text-error' :
                                  'bg-zinc-500/5 border-zinc-500/10 text-zinc-500'
                                }`}>
                                  <div className={`w-1 h-1 rounded-full ${code.status === 'ACTIVE' ? 'animate-pulse bg-emerald-500' : 
                                    code.status === 'USED' ? 'bg-blue-500' :
                                    code.status === 'SUSPENDED' ? 'bg-error' :
                                    'bg-zinc-500'
                                  }`}></div>
                                  {code.status}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 w-[25%]">
                              {redeemerName ? (
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 bg-white/[0.02] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                    {usedByUser?.photoURL ? (
                                      <img src={usedByUser.photoURL || undefined} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" alt="" referrerPolicy="no-referrer" />
                                    ) : (
                                      <span className="text-[11px] font-heading font-black text-accent/60">{redeemerName.charAt(0).toUpperCase()}</span>
                                    )}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] font-heading font-bold text-white/80 uppercase tracking-tight truncate">{redeemerName}</span>
                                    <span className="text-[7px] font-heading text-muted/30 uppercase tracking-tighter truncate">{redeemerEmail}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 opacity-10">
                                  <div className="w-1 h-1 bg-white/40"></div>
                                  <span className="text-[8px] font-heading text-muted uppercase tracking-[0.2em]">UNCLAIMED</span>
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-right w-[15%]">
                              <div className="flex items-center justify-end gap-1.5">
                                <button 
                                  onClick={() => setSelectedCodeForView(code)}
                                  className="w-9 h-9 bg-white/5 border border-white/10 text-muted/40 hover:text-accent hover:border-accent/40 transition-all flex items-center justify-center square-button"
                                  title="View Details"
                                >
                                  <Eye size={14} />
                                </button>
                                <button 
                                  onClick={() => setDeleteTarget(code.id)}
                                  disabled={code.status === 'USED' || code.status === 'SUSPENDED'}
                                  className={`w-9 h-9 border transition-all flex items-center justify-center square-button ${code.status === 'USED' || code.status === 'SUSPENDED' ? 'bg-white/5 border-white/10 text-muted/10 cursor-not-allowed' : 'bg-error/5 border-error/20 text-error/60 hover:bg-error hover:text-white hover:border-error'}`}
                                  title={code.status === 'USED' ? "Cannot suspend used codes" : code.status === 'SUSPENDED' ? "Already Suspended" : "Suspend Code"}
                                >
                                  <ShieldAlert size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-20 text-center">
                        <div className="space-y-4">
                          <AlertCircle size={32} className="mx-auto text-muted/10" />
                          <p className="text-[9px] font-heading text-muted/20 uppercase tracking-[0.4em]">Zero_Provision_Codes_Found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-white/5">
                {filteredCodes.length > 0 ? (
                  filteredCodes.map((code) => {
                    const usedByUser = code.usedBy ? students.find(s => s.uid === code.usedBy) : null;
                    const isAdminRedeemer = code.usedBy === code.adminId;
                    const redeemerName = isAdminRedeemer ? ownerName : usedByUser?.displayName;
                    const redeemerEmail = isAdminRedeemer ? ownerEmail : usedByUser?.email;

                    return (
                      <div key={code.id} className="p-4 space-y-4 bg-black/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 border flex items-center justify-center transition-all shrink-0 ${
                              code.status === 'ACTIVE' ? 'bg-accent/5 border-accent/20 text-accent' : 'bg-white/[0.02] border-white/5 text-muted/10'
                            }`}>
                              <Key size={14} />
                            </div>
                            <span className={`text-[11px] font-mono font-black tracking-widest ${code.status === 'ACTIVE' ? 'text-white' : 'text-zinc-600'}`}>
                              {code.code}
                            </span>
                          </div>
                          <div className={`inline-flex items-center justify-center gap-1.5 px-2 py-1 border text-[7px] font-heading font-black tracking-[0.1em] uppercase ${
                            code.status === 'ACTIVE' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500' :
                            code.status === 'USED' ? 'bg-blue-500/5 border-blue-500/10 text-blue-500' :
                            code.status === 'SUSPENDED' ? 'bg-error/5 border-error/10 text-error' :
                            'bg-zinc-500/5 border-zinc-500/10 text-zinc-500'
                          }`}>
                            {code.status}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[7px] font-heading text-muted/40 uppercase tracking-widest">DURATION</p>
                            <div className="flex items-center gap-2 text-white/60">
                              <Clock size={10} className="text-accent/40" />
                              <span className="text-[9px] font-mono font-bold">
                                {code.targetDurations && Object.keys(code.targetDurations).length > 0 ? 'Mixed' : `${code.durationDays} Days`}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[7px] font-heading text-muted/40 uppercase tracking-widest text-right">REDEEMER</p>
                            {redeemerName ? (
                              <div className="flex items-center justify-end gap-2">
                                <div className="text-right min-w-0">
                                  <p className="text-[9px] font-heading font-bold text-white/80 uppercase truncate">{redeemerName}</p>
                                </div>
                                <div className="w-7 h-7 bg-white/[0.02] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                  {usedByUser?.photoURL ? (
                                    <img src={usedByUser.photoURL || undefined} className="w-full h-full object-cover grayscale" alt="" referrerPolicy="no-referrer" />
                                  ) : (
                                    <span className="text-[9px] font-heading font-black text-accent/60">{redeemerName.charAt(0).toUpperCase()}</span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <p className="text-[8px] font-heading text-muted/20 uppercase tracking-widest text-right">UNCLAIMED</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                          <button 
                            onClick={() => copyToClipboard(code.code)}
                            disabled={code.status !== 'ACTIVE'}
                            className={`flex-1 py-2 border text-[8px] font-heading font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                              code.status === 'ACTIVE' 
                                ? 'bg-white/5 border-white/10 text-muted/40 hover:text-accent' 
                                : 'bg-white/[0.02] border-white/5 text-muted/10 cursor-not-allowed'
                            }`}
                          >
                            <Copy size={12} /> COPY
                          </button>
                          <button 
                            onClick={() => setSelectedCodeForView(code)}
                            className="flex-1 py-2 bg-white/5 border border-white/10 text-[8px] font-heading font-black uppercase tracking-widest text-muted/40 hover:text-accent transition-all flex items-center justify-center gap-2"
                          >
                            <Eye size={12} /> VIEW
                          </button>
                          <button 
                            onClick={() => suspendSubscriptionCode(code.id)}
                            disabled={code.status !== 'ACTIVE'}
                            className={`flex-1 py-2 border text-[8px] font-heading font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                              code.status === 'ACTIVE' ? 'bg-error/5 border-error/20 text-error/60 hover:bg-error hover:text-white' : 'bg-white/[0.02] border-white/5 text-muted/10 cursor-not-allowed'
                            }`}
                          >
                            <ShieldAlert size={12} /> SUSPEND
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-10 text-center">
                    <p className="text-[10px] font-heading uppercase tracking-[0.4em] opacity-20">No_Provision_Records_Found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {selectedCodeForView && (
        <CodeDetailsModal code={selectedCodeForView} onClose={() => setSelectedCodeForView(null)} />
      )}

      <ConfirmDialog 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmSuspend}
        title="SUSPEND_CODE"
        message="Are you sure you want to suspend this access code? This will prevent any future use of this code."
        confirmLabel="SUSPEND"
      />

      <style>{` 
        @keyframes v-scan { 0% { top: -10%; opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.8; } 100% { top: 110%; opacity: 0; } } 
      `}</style>
    </div>
  );
};

export default SubscriptionManagementPage;
