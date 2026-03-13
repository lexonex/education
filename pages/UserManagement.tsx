
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useDataStore } from '../store/dataStore';
import { useUIStore } from '../store/uiStore';
import ConfirmDialog from '../components/ConfirmDialog';
import { UserStatus, UserRole, User } from '../types';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../lib/cropImage';
import { compressImage } from '../lib/utils';
import { 
  Search, 
  ShieldCheck, 
  ShieldAlert,
  Fingerprint,
  X,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Cpu,
  Terminal,
  Lock,
  Zap,
  LayoutGrid,
  List as ListIcon,
  Activity,
  Maximize2,
  Settings,
  Database,
  Crosshair,
  Target,
  Wifi,
  HardDrive,
  Share2,
  ChevronRight,
  Eye,
  Box,
  Square,
  Binary,
  Layers,
  Check,
  Clock,
  Users,
  AlertTriangle,
  ShieldX,
  Plus,
  TrendingUp,
  Trash2,
  Wrench
} from 'lucide-react';

const UserManagement: React.FC = () => {
  const { students, categories, registrationTokens, updateStudentStatus, updateStudent, addLog, updateStudentPermissions } = useDataStore();
  const { addNotification } = useUIStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) mainContent.scrollTo(0, 0);
  }, [selectedUser ? selectedUser.uid : null]);

  const handleInvite = () => {
    const activeKeys = registrationTokens.filter(k => k.status === 'ACTIVE');
    if (activeKeys.length === 0) {
      addNotification('WARNING', 'WARNING', 'Generate a registration token first.');
      return;
    }
    const key = activeKeys[0].key;
    const inviteLink = `${window.location.origin}/#/login?token=${key}`;
    navigator.clipboard.writeText(inviteLink);
    addNotification('SUCCESS', 'COPIED', 'Invitation link mirrored to clipboard.');
  };
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Cropper State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels || !selectedUser) return;
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImage) {
        try {
          const compressed = await compressImage(croppedImage);
          setSelectedUser({ ...selectedUser, photoURL: compressed });
        } catch (err) {
          console.error("Compression failed:", err);
          setSelectedUser({ ...selectedUser, photoURL: croppedImage });
        }
      }
      setIsCropping(false);
      setImageSrc(null);
    } catch (e) {
      console.error(e);
      addNotification('ERROR', 'FAILED', 'Failed to crop image.');
    }
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setImageSrc(null);
    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Permission Selector State
  const [permType, setPermType] = useState<'CATEGORY' | 'MONEY_MANAGEMENT'>('MONEY_MANAGEMENT');
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [selectedTargetDurations, setSelectedTargetDurations] = useState<Record<string, number>>({});
  const [selectedInSummary, setSelectedInSummary] = useState<string[]>([]);
  const [permSearch, setPermSearch] = useState('');
  const [permDuration, setPermDuration] = useState(30);

  const permResults = useMemo(() => {
    let items: { id: string, name: string }[] = [];
    if (permType === 'MONEY_MANAGEMENT') {
      items = [{ id: 'MONEY_MGMT', name: 'MONEY_MANAGEMENT' }];
    } else {
      items = categories.map(c => ({ id: c.id, name: c.name }));
    }

    return items.filter(item => 
      item.name.toLowerCase().includes(permSearch.toLowerCase()) && 
      !selectedTargets.includes(item.id) &&
      !Object.keys(selectedTargetDurations).includes(item.id)
    );
  }, [categories, permSearch, permType, selectedTargets, selectedTargetDurations]);

  useEffect(() => {
    setSelectedTargets([]);
    setSelectedTargetDurations({});
    setSelectedInSummary([]);
  }, [selectedUser]);

  const handleUpdatePermissions = async () => {
    if (!selectedUser) return;

    const allTargetIds = Object.keys(selectedTargetDurations);
    if (allTargetIds.length === 0) return;

    const newPermissions: any = {
      ...selectedUser.permissions,
      allAccess: false,
      canAccessMoneyManagement: allTargetIds.includes('MONEY_MGMT') || selectedUser.permissions?.canAccessMoneyManagement,
      categories: Array.from(new Set([...(selectedUser.permissions?.categories || []), ...allTargetIds.filter(p => p !== 'MONEY_MGMT')])),
      categoryPermissions: { ...(selectedUser.permissions?.categoryPermissions || {}) }
    };

    allTargetIds.forEach(pid => {
      const duration = selectedTargetDurations[pid];
      let expiresAt = new Date();
      
      let existingSerialNumber = undefined;
      
      // Check if existing subscription is still active and extend it
      if (pid === 'MONEY_MGMT' && selectedUser.permissions?.moneyManagement?.expiresAt) {
        const existingExpiry = new Date(selectedUser.permissions.moneyManagement.expiresAt);
        if (existingExpiry > new Date()) {
          expiresAt = existingExpiry;
        }
        existingSerialNumber = selectedUser.permissions.moneyManagement.serialNumber;
      } else if (pid !== 'MONEY_MGMT' && selectedUser.permissions?.categoryPermissions?.[pid]?.expiresAt) {
        const existingExpiry = new Date(selectedUser.permissions.categoryPermissions[pid].expiresAt);
        if (existingExpiry > new Date()) {
          expiresAt = existingExpiry;
        }
        existingSerialNumber = selectedUser.permissions.categoryPermissions[pid].serialNumber;
      }
      
      expiresAt.setDate(expiresAt.getDate() + duration);
      
      const permissionInfo: any = {
        active: true,
        expiresAt: expiresAt.toISOString(),
        grantedAt: new Date().toISOString()
      };

      if (existingSerialNumber) {
        permissionInfo.serialNumber = existingSerialNumber;
      }

      if (pid === 'MONEY_MGMT') {
        newPermissions.moneyManagement = permissionInfo;
        newPermissions.canAccessMoneyManagement = true;
      } else {
        newPermissions.categoryPermissions[pid] = permissionInfo;
      }
    });

    await updateStudentPermissions(selectedUser.uid, newPermissions);

    setSelectedUser({ ...selectedUser, permissions: newPermissions });
    setSelectedTargets([]);
    setSelectedTargetDurations({});
    setSelectedInSummary([]);
    addLog('AUTH', 'Admin', `Manually updated clearance for node: ${selectedUser.displayName}`);
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
      newDurations[id] = Number(permDuration);
    });
    setSelectedTargetDurations(newDurations);
    setSelectedTargets([]); 
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

  const revokeSpecificPermission = (id: string) => {
    if (!selectedUser) return;
    
    const perms = { ...selectedUser.permissions };
    if (id === 'MONEY_MGMT') {
      perms.canAccessMoneyManagement = false;
      if (perms.moneyManagement) {
        perms.moneyManagement = { ...perms.moneyManagement, active: false };
      }
    } else {
      perms.categories = perms.categories?.filter(cid => cid !== id) || [];
      if (perms.categoryPermissions?.[id]) {
        perms.categoryPermissions[id] = { ...perms.categoryPermissions[id], active: false };
      }
    }
    
    updateStudentPermissions(selectedUser.uid, perms);
    setSelectedUser({ ...selectedUser, permissions: perms });
    addLog('REVOKE', 'Admin', `Revoked specific clearance [${id}] for node: ${selectedUser.displayName}`);
  };

  const filtered = students.filter(s => {
    const searchLower = searchTerm.toLowerCase();
    const m = s.displayName.toLowerCase().includes(searchLower) || 
              s.email.toLowerCase().includes(searchLower) || 
              s.uid.toLowerCase().includes(searchLower) ||
              // Search by serial numbers
              (s.permissions?.moneyManagement?.serialNumber?.toLowerCase().includes(searchLower)) ||
              (Object.values(s.permissions?.categoryPermissions || {}).some(cp => cp.serialNumber?.toLowerCase().includes(searchLower)));
    
    return m && (statusFilter === 'ALL' || s.status === statusFilter);
  });

  const stats = { 
    total: students.length, 
    approved: students.filter(s => s.status === UserStatus.APPROVED).length, 
    pending: students.filter(s => s.status === UserStatus.PENDING).length, 
    suspended: students.filter(s => s.status === UserStatus.SUSPENDED).length 
  };

  const handleSave = () => { 
    if (selectedUser) { 
      updateStudent(selectedUser.uid, selectedUser); 
      setEditMode(false); 
      addLog('SYNC', 'Admin', `Updated records for node: ${selectedUser.displayName}`);
    } 
  };

  const confirmWipe = () => {
    if (deleteTarget) {
      updateStudentStatus(deleteTarget.uid, UserStatus.SUSPENDED);
      addLog('WIPE', 'Admin', `Suspended node access for: ${deleteTarget.displayName}`);
      setDeleteTarget(null);
    }
  };

  const statItems = [
    { label: 'USERS', val: stats.total, color: 'text-white', icon: <Database size={16}/>, desc: 'TOTAL' },
    { label: 'APPROVED', val: stats.approved, color: 'text-accent', icon: <Wifi size={16}/>, desc: 'VERIFIED' },
    { label: 'PENDING', val: stats.pending, color: 'text-yellow-500', icon: <Activity size={16}/>, desc: 'PENDING' },
    { label: 'SUSPENDED', val: stats.suspended, color: 'text-error', icon: <Lock size={16}/>, desc: 'REJECTED' },
  ];

  return (
    <div className="max-w-[1700px] mx-auto space-y-6 sm:space-y-10 animate-in fade-in duration-1000 pb-20 relative px-0.5 sm:px-4 select-none">
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-accent">
            <Users size={16} className="animate-pulse" />
            <p className="text-[10px] font-heading tracking-[0.5em] uppercase font-black">USERS</p>
          </div>
          <h2 className="text-2xl sm:text-5xl font-heading font-black tracking-tighter text-white uppercase leading-none">USERS</h2>
        </div>

        <button 
          onClick={handleInvite} 
          className="hidden md:flex w-full md:w-auto bg-white text-black px-8 py-4 text-[10px] font-heading font-black tracking-[0.2em] uppercase hover:bg-accent transition-all items-center justify-center gap-3 active:scale-95 shadow-glow-sm" 
          style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
        >
          <Plus size={18} /> <span className="hidden sm:inline">INVITE</span><span className="sm:hidden">INVITE</span>
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

      {/* OPTIMIZED FILTER CONTROLS FOR MOBILE & DESKTOP */}
      <div className="relative z-10 flex flex-col md:flex-row gap-2 sm:gap-4 md:items-stretch">
        {/* Search Bar - Top on Mobile */}
        <div className="relative group bg-black/60 border border-white/5 p-1.5 sm:p-2 backdrop-blur-xl md:flex-[1.5]">
           <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" />
           <input 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder="SEARCH..." 
              className="w-full bg-surface/40 px-12 py-3 sm:px-16 sm:py-5 text-[10px] sm:text-[11px] font-heading tracking-[0.3em] uppercase outline-none focus:border-accent transition-colors duration-300 placeholder:text-muted/10" 
           />
        </div>

        {/* Mobile Invite Button - Below Search on Mobile */}
        <div className="md:hidden relative z-10">
          <button 
            onClick={handleInvite} 
            className="w-full bg-white text-black py-4 text-[10px] font-heading font-black tracking-[0.2em] uppercase hover:bg-accent transition-all flex items-center justify-center gap-3 active:scale-95 shadow-glow-sm" 
            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
          >
            <Plus size={18} /> INVITE
          </button>
        </div>
        
        {/* Filter and View Toggle - Bottom on Mobile */}
        <div className="flex gap-2 bg-black/60 border border-white/5 p-1.5 sm:p-2 backdrop-blur-xl md:flex-1 items-stretch">
            <div className="flex-1 flex items-center bg-surface/40 px-2 sm:px-6 gap-2 sm:gap-3 py-2.5 sm:py-0">
               <Binary size={14} className="text-accent/40 shrink-0" />
               <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="w-full bg-transparent text-[8px] sm:text-[10px] font-heading tracking-[0.1em] sm:tracking-[0.2em] uppercase outline-none cursor-pointer text-white/60 focus:text-accent min-w-0">
                 <option value="ALL">ALL</option>
                 <option value={UserStatus.APPROVED}>APPROVED</option>
                 <option value={UserStatus.PENDING}>PENDING</option>
                 <option value={UserStatus.SUSPENDED}>SUSPENDED</option>
               </select>
            </div>
            <div className="flex gap-1 shrink-0">
               <button onClick={() => setViewMode('GRID')} className={`w-12 sm:w-16 transition-all flex items-center justify-center bg-surface/40 ${viewMode === 'GRID' ? 'text-accent' : 'text-muted hover:text-white'}`}><LayoutGrid size={16} className={`sm:size-[18px] ${viewMode === 'GRID' ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]' : ''}`}/></button>
               <button onClick={() => setViewMode('LIST')} className={`w-12 sm:w-16 transition-all flex items-center justify-center bg-surface/40 ${viewMode === 'LIST' ? 'text-accent' : 'text-muted hover:text-white'}`}><ListIcon size={16} className={`sm:size-[18px] ${viewMode === 'LIST' ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]' : ''}`}/></button>
            </div>
        </div>
      </div>

      {/* USERS LIST/GRID DISPLAY */}
      <div className={`relative z-10 grid ${viewMode === 'GRID' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' : 'grid-cols-1'} gap-4 sm:gap-6`}>
        {filtered.map(u => (
          viewMode === 'GRID' ? (
            <div key={u.uid} className={`relative group bg-black border p-px transition-all duration-500 hover:-translate-y-1 ${u.status === UserStatus.APPROVED ? 'border-accent/10 hover:border-accent' : u.status === UserStatus.PENDING ? 'border-yellow-500/10 hover:border-yellow-500' : 'border-error/10 hover:border-error'}`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)' }}>
              <div className="bg-surface/40 p-8 flex flex-col items-center text-center space-y-8 h-full relative group-hover:bg-surface/60 transition-colors">
                <div className="absolute top-6 left-6 flex flex-col gap-1"><div className={`w-3 h-3 ${u.status === UserStatus.APPROVED ? 'bg-accent' : u.status === UserStatus.PENDING ? 'bg-yellow-500' : 'bg-error'} shadow-[0_0_10px_currentcolor] animate-pulse`}></div><div className="w-[1px] h-6 bg-white/10 ml-[5px]"></div></div>
                <div className="relative group/avatar cursor-pointer" onClick={() => u.photoURL && setPreviewPhoto(u.photoURL)}>
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-accent/40 group-hover/avatar:border-accent transition-colors sm:w-5 sm:h-5 sm:border-t-2 sm:border-r-2 sm:-top-2 sm:-right-2"></div>
                  <div className="w-32 h-32 p-1 bg-black border border-white/10 relative overflow-hidden group-hover:border-accent/40 transition-all duration-1000">
                    <div className="w-full h-full bg-zinc-950 flex items-center justify-center overflow-hidden relative">
                      {u.photoURL ? <img src={u.photoURL || undefined} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" alt="Identity" /> : <Fingerprint size={60} className="text-muted/10 group-hover:text-accent/20" />}
                      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"><div className="w-full h-[1px] bg-accent/60 shadow-[0_0_15px_#00F0FF] animate-[h-scan_2s_linear_infinite]"></div></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 w-full relative z-10">
                  <div className="space-y-1"><h4 className="font-heading text-lg font-black uppercase text-white tracking-tighter group-hover:text-accent duration-500 truncate px-2">{u.displayName}</h4><p className="text-[9px] font-heading text-muted uppercase tracking-[0.4em] font-black opacity-40">ID: {u.uid.toUpperCase().slice(0, 12)}</p></div>
                  <div className="flex flex-col gap-2 pt-4 border-t border-white/5"><div className="flex items-center justify-between text-[8px] font-heading text-muted/40 uppercase tracking-[0.2em]"><span className="flex items-center gap-2"><Mail size={10} /> EMAIL</span><span className="text-white/80 truncate w-28 text-right font-bold">{u.email.split('@')[0]}</span></div><div className="flex items-center justify-between text-[8px] font-heading text-muted/40 uppercase tracking-[0.2em]"><span className="flex items-center gap-2"><ShieldCheck size={10} /> CLEARANCE</span><span className={u.permissions?.allAccess ? 'text-accent font-black' : 'text-white/80'}>{u.permissions?.allAccess ? 'ROOT' : 'L1'}</span></div></div>
                </div>
                <div className="w-full grid grid-cols-2 gap-2 pt-2 relative z-10">
                   <button onClick={() => {setSelectedUser(u); setEditMode(false);}} className="py-4 bg-white/5 border border-white/5 text-[9px] font-heading font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all square-button">DETAILS</button>
                   <button onClick={() => setDeleteTarget(u)} className="py-4 bg-error/5 border border-error/20 text-[9px] font-heading font-black text-error uppercase tracking-[0.3em] hover:bg-error hover:text-white transition-all square-button">SUSPEND</button>
                </div>
              </div>
            </div>
          ) : (
            <div key={u.uid} className={`bg-black border border-white/5 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4 group transition-all hover:border-accent/40 ${u.status === UserStatus.SUSPENDED ? 'opacity-60' : ''}`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 98% 100%, 0 100%)' }}>
               <div className="flex items-center gap-4 w-full sm:w-auto">
                 <div className={`w-12 h-12 border p-0.5 shrink-0 cursor-pointer relative group/avatar ${u.status === UserStatus.APPROVED ? 'border-accent/40' : 'border-white/10'}`} onClick={() => u.photoURL && setPreviewPhoto(u.photoURL)}>
                   <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-accent/40 group-hover/avatar:border-accent transition-colors"></div>
                   <div className="w-full h-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                     {u.photoURL ? <img src={u.photoURL || undefined} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" /> : <UserIcon size={16} className="text-muted/20" />}
                   </div>
                 </div>
                 <div className="min-w-0">
                   <h4 className="font-heading text-xs font-black uppercase text-white truncate tracking-tight">{u.displayName}</h4>
                   <p className="text-[9px] font-heading text-muted/40 uppercase tracking-widest truncate">{u.email}</p>
                 </div>
               </div>
               
               <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                 <div className={`px-3 py-1 text-[8px] font-heading uppercase tracking-widest border ${u.status === UserStatus.APPROVED ? 'border-accent/40 text-accent' : u.status === UserStatus.PENDING ? 'border-yellow-500/40 text-yellow-500' : 'border-error/40 text-error'}`}>
                    {u.status}
                 </div>
                 <div className="flex gap-2">
                   <button onClick={() => {setSelectedUser(u); setEditMode(false);}} className="p-3 bg-white/5 border border-white/10 text-muted hover:text-accent hover:border-accent transition-all square-button"><Eye size={14} /></button>
                   <button onClick={() => setDeleteTarget(u)} className="p-3 bg-error/5 border border-error/20 text-error/60 hover:text-white hover:bg-error transition-all square-button"><ShieldX size={14} /></button>
                 </div>
               </div>
            </div>
          )
        ))}
      </div>

      {/* PHOTO PREVIEW MODAL - UPDATED SCALING */}
      {previewPhoto && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-6 animate-in fade-in duration-700 backdrop-blur-sm"
          onClick={() => setPreviewPhoto(null)}
        >
           <div 
             className="relative max-w-xl w-full border border-accent/40 p-2 bg-zinc-950 shadow-[0_0_100px_rgba(0,240,255,0.15)] animate-in zoom-in duration-300"
             style={{ clipPath: 'polygon(0 50px, 50px 0, 100% 0, 100% calc(100% - 50px), calc(100% - 50px) 100%, 0 100%)' }}
             onClick={e => e.stopPropagation()}
           >
              <button 
                onClick={() => setPreviewPhoto(null)} 
                className="absolute sm:top-10 sm:right-10 top-4 right-4 text-muted hover:text-white transition-all hover:scale-125 z-20 p-2 sm:p-0"
              >
                <X size={32} className="sm:size-[44px] shrink-0" />
              </button>
              <div className="relative border border-white/10 bg-black overflow-hidden aspect-square">
                <img src={previewPhoto || undefined} className="w-full h-full object-cover" alt="Identity Scan" />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-black/80"></div>
                
                <div className="absolute top-4 left-4 sm:top-10 sm:left-10 space-y-1 sm:space-y-2 pointer-events-none">
                   <p className="text-accent font-heading text-[8px] sm:text-[12px] tracking-[0.2em] sm:tracking-[0.6em] uppercase font-black">PHOTO</p>
                   <div className="flex gap-0.5 sm:gap-1 h-0.5 sm:h-1">
                      {[...Array(12)].map((_, i) => <div key={i} className="w-1 sm:w-2 bg-accent animate-pulse" style={{ animationDelay: `${i*100}ms` }}></div>)}
                   </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent/60 shadow-glow animate-[v-scan_4s_linear_infinite]"></div>
              </div>
           </div>
        </div>,
        document.body
      )}

      <ConfirmDialog 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmWipe}
        title="ACCESS_TERMINATION"
        message={`Confirm access termination for ${deleteTarget?.displayName}. This node will be locked from the neural grid until administrative override.`}
        confirmLabel="SUSPEND"
      />

      {/* USER DETAIL MODAL */}
      {selectedUser && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
           <div className="absolute inset-0 bg-black/95 backdrop-blur-[20px] transition-opacity" onClick={() => setSelectedUser(null)}></div>
           <div 
             className="relative w-full max-w-7xl h-full max-h-[90vh] bg-[#050505] border border-white/10 shadow-2xl animate-in zoom-in slide-in-from-bottom-12 duration-500 flex flex-col lg:flex-row overflow-hidden"
             style={{ clipPath: 'polygon(0 20px, 20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}
           >
              <div className="w-full lg:w-[380px] bg-[#050505] border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col shrink-0 relative overflow-hidden">
                 <div className="overflow-y-auto custom-scrollbar p-6 sm:p-10 flex flex-col items-center h-full">
                    <div className="space-y-6 sm:space-y-12 w-full relative z-10 flex flex-col items-center">
                        <div className="relative group/avatar cursor-pointer mx-auto w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64" onClick={() => editMode ? fileRef.current?.click() : selectedUser.photoURL && setPreviewPhoto(selectedUser.photoURL)}>
                          <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-accent/40 group-hover/avatar:border-accent transition-colors sm:w-5 sm:h-5 sm:border-t-2 sm:border-r-2 sm:-top-2 sm:-right-2"></div>
                          <div className={`w-full h-full border-4 p-1 bg-black relative z-10 overflow-hidden transition-all duration-700 ${editMode ? 'border-accent shadow-glow' : 'border-white/10'}`}>
                              <div className="w-full h-full bg-zinc-900 flex items-center justify-center relative overflow-hidden">{selectedUser.photoURL ? <img src={selectedUser.photoURL || undefined} className="w-full h-full object-cover grayscale opacity-80 group-hover/avatar:grayscale-0 group-hover/avatar:opacity-100 transition-all duration-1000" alt="Identity" /> : <Fingerprint size={80} className="text-muted/10 sm:size-[120px]" />}</div>
                              {editMode && (
                                <div className="absolute inset-0 bg-accent/40 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                                   <div className="text-white mb-1 shrink-0 sm:mb-2"><Fingerprint size={32} /></div>
                                   <span className="text-[8px] font-heading text-white uppercase tracking-[0.4em] font-black sm:text-[10px]">REMAP</span>
                                </div>
                              )}
                          </div>
                          <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </div>
                        <div className="text-center space-y-4 sm:space-y-6 w-full">
                          <div className="flex flex-col items-center">
                              <span className={`text-[9px] sm:text-[11px] font-heading px-4 sm:px-8 py-2 sm:py-3 border-2 mb-4 sm:mb-8 tracking-[0.6em] font-black uppercase ${selectedUser.status === UserStatus.APPROVED ? 'text-accent border-accent/40' : selectedUser.status === UserStatus.SUSPENDED ? 'text-error border-error/40' : 'text-yellow-500 border-yellow-500/40'}`}>{selectedUser.status}</span>
                              <h3 className="text-xl sm:text-3xl lg:text-4xl font-heading font-black uppercase text-white tracking-tighter leading-none mb-3 sm:mb-4 break-words w-full px-2 text-center">{selectedUser.displayName}</h3>
                              <div className="flex items-center gap-2 sm:gap-4 bg-white/5 px-4 sm:px-6 py-2 sm:py-3 border border-white/5 w-full justify-center"><Terminal size={14} className="text-accent sm:size-[18px]" /><p className="text-[8px] sm:text-[10px] font-heading text-muted uppercase tracking-[0.3em] sm:tracking-[0.5em] break-all text-center">ALIAS: @{selectedUser.username || 'UNSET'}</p></div>
                          </div>
                        </div>
                    </div>
                 </div>
              </div>

              <div className="flex-1 flex flex-col bg-[#050505] backdrop-blur-xl min-h-0 overflow-hidden">
                 <div className="p-5 sm:p-8 lg:p-10 border-b border-white/5 flex items-center justify-between bg-[#050505] sticky top-0 z-20 shrink-0">
                    <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
                       <div className="p-3 sm:p-4 bg-accent/10 border border-accent/20 relative shrink-0">
                          <Cpu size={24} className="text-accent animate-pulse shrink-0 sm:size-[32px]" />
                          <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-accent"></div>
                          <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-accent"></div>
                       </div>
                       <div className="min-w-0">
                          <h3 className="text-xs sm:text-sm lg:text-lg font-heading font-black tracking-[0.3em] sm:tracking-[0.5em] uppercase truncate">{editMode ? 'EDIT_PROFILE' : 'DETAILS'}</h3>
                          <p className="text-[7px] sm:text-[8px] lg:text-[10px] text-muted uppercase tracking-[0.6em] sm:tracking-[0.8em] mt-1 font-black truncate">AUTHORIZED</p>
                       </div>
                    </div>
                    <button onClick={() => setSelectedUser(null)} className="text-muted hover:text-white transition-all p-2 shrink-0"><X size={24} className="sm:size-[32px]" /></button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-5 sm:p-8 lg:p-10 space-y-8 sm:space-y-12 custom-scrollbar relative">
                    <div className="pt-2 border-b border-white/5 pb-8 sm:pb-10 mb-2 space-y-6 relative z-10">
                       <div className="flex items-center gap-3 sm:gap-4"><Activity size={16} className="text-accent sm:size-[18px]" /><h4 className="font-heading text-[10px] sm:text-xs tracking-[0.4em] uppercase text-white font-black">STATUS</h4></div>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                          {[UserStatus.APPROVED, UserStatus.PENDING, UserStatus.SUSPENDED].map(status => (
                             <button key={status} onClick={() => { updateStudentStatus(selectedUser.uid, status); setSelectedUser({...selectedUser, status}); }} className={`py-3 sm:py-4 border text-[8px] sm:text-[9px] font-heading font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-all flex items-center justify-center gap-2 ${selectedUser.status === status ? (status === UserStatus.APPROVED ? 'bg-accent text-black border-accent' : status === UserStatus.SUSPENDED ? 'bg-error text-white border-error' : 'bg-yellow-500 text-black border-yellow-500') : 'border-white/10 text-muted hover:border-white hover:text-white bg-black/40'}`}>{status}</button>
                          ))}
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12 relative z-10">
                       {[{ label: 'NAME', key: 'displayName', icon: <UserIcon size={14} className="shrink-0" /> }, { label: 'EMAIL', key: 'email', icon: <Mail size={14} className="shrink-0" />, readonly: true }, { label: 'USERNAME', key: 'username', icon: <Binary size={14} className="shrink-0" /> }, { label: 'PHONE', key: 'phone', icon: <Phone size={14} className="shrink-0" /> }, { label: 'ADDRESS', key: 'address', icon: <MapPin size={14} className="shrink-0" />, multiline: true }].map(field => (
                          <div key={field.key} className={`space-y-2.5 group ${field.multiline ? 'md:col-span-2' : ''}`}>
                             <label className="flex items-center gap-2 text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                                <span className="text-accent/40 group-focus-within:text-accent">{field.icon}</span>
                                {field.label}
                             </label>
                             {editMode && !field.readonly ? (
                                <div className="relative">
                                  <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                                  {field.multiline ? (
                                     <textarea 
                                        value={(selectedUser as any)[field.key] || ''} 
                                        onChange={e => setSelectedUser({...selectedUser, [field.key]: e.target.value})} 
                                        className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-muted/10 uppercase h-24 resize-none custom-scrollbar"
                                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                                     />
                                  ) : (
                                     <input 
                                        value={(selectedUser as any)[field.key] || ''} 
                                        onChange={e => setSelectedUser({...selectedUser, [field.key]: e.target.value})} 
                                        className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-muted/10 uppercase"
                                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                                     />
                                  )}
                                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                                </div>
                             ) : (
                                <div className="relative group/readonly">
                                   <div className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading font-black tracking-[0.2em] uppercase text-white/80 min-h-[48px] flex items-center break-all overflow-hidden transition-all group-hover/readonly:border-white/20"
                                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
                                      {(selectedUser as any)[field.key] || '--- NULL_DATA ---'}
                                   </div>
                                   <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/10 group-hover/readonly:border-white/40 transition-colors"></div>
                                </div>
                             )}
                          </div>
                       ))}
                    </div>

                    <div className="pt-10 sm:pt-16 lg:pt-8 border-t border-white/5 relative z-10 pb-10 lg:pb-6 space-y-8">
                       {/* CURRENT ACTIVE CLEARANCE SECTION */}
                       <div className="space-y-4 bg-white/[0.01] border border-white/5 p-6">
                          <div className="flex items-center gap-3">
                             <ShieldCheck size={16} className="text-accent shrink-0" />
                             <h4 className="font-heading text-[10px] sm:text-xs tracking-[0.4em] uppercase text-white font-black">ACCESS</h4>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                             {selectedUser.permissions?.allAccess ? (
                               <div className="col-span-full p-6 bg-accent/10 border border-accent/40 flex flex-col items-center text-center space-y-2">
                                  <Zap size={24} className="text-accent animate-pulse" />
                                  <p className="text-[10px] font-heading font-black text-accent tracking-[0.4em] uppercase">ROOT</p>
                                  <p className="text-[8px] font-heading text-accent/60 tracking-widest uppercase">Unlimited access to all neural grid sectors</p>
                               </div>
                             ) : (
                               <>
                                 {/* Money Management Tool */}
                                 {(selectedUser.permissions?.canAccessMoneyManagement && selectedUser.permissions?.moneyManagement?.active) && (
                                   <div className="p-4 sm:p-6 pt-12 sm:pt-14 bg-white/[0.02] border border-white/10 space-y-4 relative group/card transition-all hover:border-accent/40">
                                      <button 
                                        onClick={() => revokeSpecificPermission('MONEY_MGMT')}
                                        className="absolute top-2 right-2 w-8 h-8 sm:w-10 sm:h-10 bg-error/5 border border-error/20 text-error/60 hover:bg-error hover:text-white hover:border-error transition-all flex items-center justify-center group"
                                        title="Revoke Permission"
                                        style={{ clipPath: 'polygon(20% 0px, 100% 0px, 100% 80%, 80% 100%, 0px 100%, 0px 20%)' }}
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                      <div className="flex items-center justify-between">
                                         <div className="space-y-1">
                                            <span className="text-[9px] sm:text-[11px] font-heading font-black text-white/80 uppercase tracking-widest">MONEY_MANAGEMENT</span>
                                            <p className="text-[7px] sm:text-[8px] font-heading text-accent/40 tracking-widest uppercase">{selectedUser.permissions.moneyManagement.serialNumber || 'SN: N/A'}</p>
                                         </div>
                                         <Wrench size={14} className="text-accent/40" />
                                      </div>
                                      <div className="pt-3 border-t border-white/5 space-y-2">
                                         <div className="flex items-center justify-between text-[7px] sm:text-[8px] font-heading uppercase tracking-widest">
                                            <span className="text-muted/40">Status</span>
                                            <span className="text-accent font-black">ACTIVE</span>
                                         </div>
                                         <div className="flex items-center justify-between text-[7px] sm:text-[8px] font-heading uppercase tracking-widest">
                                            <span className="text-muted/40">Expires</span>
                                            <span className="text-white/60 font-black">
                                               {selectedUser.permissions.moneyManagement.expiresAt 
                                                  ? new Date(selectedUser.permissions.moneyManagement.expiresAt).toLocaleDateString() 
                                                  : 'UNLIMITED'}
                                            </span>
                                         </div>
                                         {selectedUser.permissions.moneyManagement.expiresAt && (
                                           <div className="flex items-center justify-between text-[7px] sm:text-[8px] font-heading uppercase tracking-widest">
                                              <span className="text-muted/40">Remaining</span>
                                              <span className="text-yellow-500 font-black">
                                                 {Math.max(0, Math.ceil((new Date(selectedUser.permissions.moneyManagement.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} DAYS
                                              </span>
                                           </div>
                                         )}
                                      </div>
                                   </div>
                                 )}

                                 {/* Permission Permissions */}
                                 {selectedUser.permissions?.categories?.map(cid => {
                                   const perm = selectedUser.permissions?.categoryPermissions?.[cid];
                                   if (!perm?.active) return null;
                                   const cat = categories.find(c => c.id === cid);
                                   return (
                                     <div key={cid} className="p-4 sm:p-6 pt-12 sm:pt-14 bg-white/[0.02] border border-white/10 space-y-4 relative group/card transition-all hover:border-accent/40">
                                        <button 
                                          onClick={() => revokeSpecificPermission(cid)}
                                          className="absolute top-2 right-2 w-8 h-8 sm:w-10 sm:h-10 bg-error/5 border border-error/20 text-error/60 hover:bg-error hover:text-white hover:border-error transition-all flex items-center justify-center group"
                                          title="Revoke Permission"
                                          style={{ clipPath: 'polygon(20% 0px, 100% 0px, 100% 80%, 80% 100%, 0px 100%, 0px 20%)' }}
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                        <div className="flex items-center justify-between">
                                           <div className="space-y-1">
                                              <span className="text-[9px] sm:text-[11px] font-heading font-black text-white/80 uppercase tracking-widest truncate max-w-[150px]">{cat?.name || 'Unknown Permission'}</span>
                                              <p className="text-[7px] sm:text-[8px] font-heading text-accent/40 tracking-widest uppercase">{perm.serialNumber || 'SN: N/A'}</p>
                                           </div>
                                           <Layers size={14} className="text-accent/40" />
                                        </div>
                                        <div className="pt-3 border-t border-white/5 space-y-2">
                                           <div className="flex items-center justify-between text-[7px] sm:text-[8px] font-heading uppercase tracking-widest">
                                              <span className="text-muted/40">Status</span>
                                              <span className="text-accent font-black">ACTIVE</span>
                                           </div>
                                           <div className="flex items-center justify-between text-[7px] sm:text-[8px] font-heading uppercase tracking-widest">
                                              <span className="text-muted/40">Expires</span>
                                              <span className="text-white/60 font-black">
                                                 {perm.expiresAt ? new Date(perm.expiresAt).toLocaleDateString() : 'UNLIMITED'}
                                              </span>
                                           </div>
                                           {perm.expiresAt && (
                                             <div className="flex items-center justify-between text-[7px] sm:text-[8px] font-heading uppercase tracking-widest">
                                                <span className="text-muted/40">Remaining</span>
                                                <span className="text-yellow-500 font-black">
                                                   {Math.max(0, Math.ceil((new Date(perm.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} DAYS
                                                </span>
                                             </div>
                                           )}
                                        </div>
                                     </div>
                                   );
                                 })}

                                 {/* Empty State for Current Clearance */}
                                 {(!selectedUser.permissions?.canAccessMoneyManagement || !selectedUser.permissions?.moneyManagement?.active) && 
                                  (!selectedUser.permissions?.categories || selectedUser.permissions.categories.filter(cid => selectedUser.permissions?.categoryPermissions?.[cid]?.active).length === 0) && (
                                   <div className="col-span-full py-6 text-center border border-dashed border-white/10 bg-white/[0.01]">
                                      <p className="text-[8px] font-heading text-muted/20 uppercase tracking-[0.4em]">EMPTY</p>
                                   </div>
                                 )}
                               </>
                             )}
                          </div>
                       </div>

                       <div className="flex items-center justify-between pt-8 border-t border-white/5">
                          <div className="flex items-center gap-3">
                             <ShieldAlert size={16} className="text-accent shrink-0" />
                             <h4 className="font-heading text-[10px] sm:text-xs tracking-[0.4em] uppercase text-white font-black">ROOT</h4>
                          </div>
                          <button 
                             onClick={() => { 
                               const next = !selectedUser.permissions?.allAccess; 
                               const newPermissions = {
                                 ...selectedUser.permissions!, 
                                 allAccess: next
                                 // We intentionally do NOT modify categories, categoryPermissions, 
                                 // or moneyManagement here. This preserves their original expiration 
                                 // dates so that if ROOT is revoked, the user falls back to their 
                                 // previous subscription state and remaining time.
                               };
                               updateStudentPermissions(selectedUser.uid, newPermissions); 
                               setSelectedUser({...selectedUser, permissions: newPermissions}); 
                             }} 
                             className={`px-6 py-2 border text-[8px] font-heading tracking-[0.2em] uppercase font-black transition-all square-button ${selectedUser.permissions?.allAccess ? 'bg-accent text-black border-accent shadow-glow-sm' : 'border-white/10 text-muted hover:border-white'}`}
                          >
                             {selectedUser.permissions?.allAccess ? 'ACTIVE' : 'GRANT'}
                          </button>
                       </div>

                       <div className="bg-[#050505] border border-white/5 p-6 space-y-8">
                          {/* Permission Type Selection */}
                          <div className="space-y-3">
                            <label className="text-[8px] font-heading font-black text-muted/40 uppercase tracking-[0.4em] block">TYPE</label>
                            <div className="grid grid-cols-2 gap-2">
                              <button 
                                onClick={() => setPermType('MONEY_MANAGEMENT')}
                                className={`py-3 px-4 border text-[9px] font-heading font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${permType === 'MONEY_MANAGEMENT' ? 'bg-accent border-accent text-black shadow-glow-sm' : 'bg-white/[0.02] border-white/5 text-muted/40 hover:border-white/20'}`}
                                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                              >
                                <TrendingUp size={14} />
                                TOOLS
                              </button>
                              <button 
                                onClick={() => setPermType('CATEGORY')}
                                className={`py-3 px-4 border text-[9px] font-heading font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${permType === 'CATEGORY' ? 'bg-accent border-accent text-black shadow-glow-sm' : 'bg-white/[0.02] border-white/5 text-muted/40 hover:border-white/20'}`}
                                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                              >
                                <Layers size={14} />
                                PERMISSIONS
                              </button>
                            </div>
                          </div>

                          {/* Search & Results */}
                          <div className="space-y-4">
                            <div className="relative group">
                              <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/40 group-focus-within:text-accent transition-colors" />
                              <input 
                                type="text"
                                value={permSearch}
                                onChange={(e) => setPermSearch(e.target.value)}
                                placeholder="SEARCH..."
                                className="w-full bg-white/[0.02] border border-white/10 py-4 pl-12 pr-5 text-[10px] font-heading text-white focus:border-accent/50 outline-none transition-colors duration-300 placeholder:text-muted/10"
                                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                              />
                              <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                            </div>
                            
                            <div className="bg-[#080808] border border-white/10 h-40 overflow-y-auto custom-scrollbar">
                              <div className="p-2 border-b border-white/5 bg-white/[0.02] sticky top-0 z-10">
                                <p className="text-[7px] font-heading font-black text-muted/40 uppercase tracking-[0.3em]">AVAILABLE:</p>
                              </div>
                              {permResults.length > 0 ? (
                                permResults.map(res => (
                                  <button 
                                    key={res.id}
                                    onClick={() => toggleTarget(res.id)}
                                    className="w-full text-left p-3 hover:bg-accent/5 border-b border-white/5 flex items-center justify-between group transition-all"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-1 h-1 bg-accent/40 group-hover:bg-accent transition-colors"></div>
                                      <span className="text-[10px] font-heading font-bold text-white/60 group-hover:text-white uppercase tracking-widest">{res.name}</span>
                                    </div>
                                    <Plus size={12} className="text-muted/20 group-hover:text-accent transition-all" />
                                  </button>
                                ))
                              ) : (
                                <div className="p-8 text-center">
                                  <p className="text-[8px] font-heading text-muted/20 uppercase tracking-widest">No_Results_Found</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Pending Selection Display */}
                          {selectedTargets.length > 0 && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 bg-accent/5 border border-accent/20 p-4">
                              <div className="flex items-center justify-between">
                                <p className="text-[7px] font-heading font-black text-accent uppercase tracking-[0.3em]">PENDING:</p>
                                <button onClick={() => setSelectedTargets([])} className="text-[7px] font-heading font-black text-error/40 hover:text-error uppercase tracking-widest transition-colors">Discard</button>
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
                              <p className="text-[6px] font-heading text-accent/40 uppercase tracking-widest italic">Set duration below and click "ADD_TO_LIST"</p>
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
                                <button onClick={() => { setSelectedTargetDurations({}); setSelectedInSummary([]); }} className="text-[7px] font-heading font-black text-error/40 hover:text-error uppercase tracking-widest transition-colors">Clear_All</button>
                              </div>

                              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
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

                          {/* Duration Selection */}
                          <div className="space-y-4">
                            <label className="text-[8px] font-heading font-black text-muted/40 uppercase tracking-[0.4em] block">Access Duration (Days)</label>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                              {[7, 15, 30, 90, 180, 365].map(d => (
                                <button 
                                  key={d}
                                  onClick={() => setPermDuration(d)}
                                  className={`py-2 text-[9px] font-heading font-bold border transition-all ${permDuration === d ? 'bg-white border-white text-black' : 'bg-black/40 border-white/5 text-muted/40 hover:border-white/20'}`}
                                >
                                  {d === 365 ? '1Y' : d === 180 ? '6M' : d === 90 ? '3M' : d === 30 ? '1M' : `${d}D`}
                                </button>
                              ))}
                            </div>
                            <div className="relative group">
                              <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                              <Clock size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/40 group-focus-within:text-accent transition-colors" />
                              <input 
                                type="number"
                                value={permDuration}
                                onChange={(e) => setPermDuration(parseInt(e.target.value) || 0)}
                                placeholder="CUSTOM_DAYS..."
                                className="w-full bg-white/[0.02] border border-white/10 py-4 pl-12 pr-5 text-[10px] font-heading text-white focus:border-accent/50 outline-none transition-colors duration-300 placeholder:text-muted/10"
                                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                              />
                              <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                            </div>
                          </div>

                          {/* Confirm Selection Button */}
                          {selectedTargets.length > 0 && (
                            <button 
                              onClick={confirmPayloads}
                              className="w-full py-5 bg-white text-black font-heading font-black text-[10px] tracking-[0.4em] uppercase hover:bg-accent transition-all flex items-center justify-center gap-3 shadow-glow-sm animate-in slide-in-from-bottom-4 duration-500"
                              style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 75%, 95% 100%, 0 100%, 0 25%)' }}
                            >
                              <Plus size={14} />
                              ADD
                            </button>
                          )}

                          {/* Update Button */}
                          <button 
                            onClick={handleUpdatePermissions}
                            disabled={Object.keys(selectedTargetDurations).length === 0}
                            className="w-full py-4 bg-accent text-black font-heading font-black text-[10px] tracking-[0.4em] uppercase hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-glow-sm"
                            style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 75%, 95% 100%, 0 100%, 0 25%)' }}
                          >
                            <ShieldCheck size={14} />
                            UPDATE
                          </button>
                       </div>
                    </div>
                 </div>

                 <div className="p-5 sm:p-8 lg:p-10 border-t border-white/5 bg-[#050505] backdrop-blur-3xl flex flex-col sm:flex-row gap-3 sm:gap-6 sticky bottom-0 z-20 shrink-0">
                    {editMode ? (
                       <>
                          <button onClick={() => setEditMode(false)} className="flex-1 py-4 sm:py-8 border border-white/10 text-[10px] sm:text-[11px] font-heading font-black tracking-[0.4em] sm:tracking-[0.6em] uppercase text-muted hover:text-white transition-all square-button">CANCEL</button>
                          <button onClick={handleSave} className="flex-[2] py-4 sm:py-8 bg-accent text-black text-[10px] sm:text-[11px] font-heading font-black uppercase tracking-[0.4em] sm:tracking-[0.6em] hover:shadow-glow transition-all active:scale-95 square-button">SAVE</button>
                       </>
                    ) : (
                       <button onClick={() => setEditMode(true)} className="w-full py-4 sm:py-8 border-2 border-white text-white text-[10px] sm:text-[12px] font-heading font-black uppercase tracking-[0.6em] sm:tracking-[0.8em] hover:bg-white hover:text-black transition-all square-button">EDIT</button>
                    )}
                 </div>
              </div>
           </div>
        </div>,
        document.body
      )}

      {/* Image Cropper Modal */}
      {isCropping && imageSrc && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#050505] border border-white/10 relative flex flex-col h-[80vh] sm:h-[600px]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 95%, 95% 100%, 0 100%)' }}>
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-heading text-sm tracking-[0.2em] uppercase font-black text-white">Adjust Image</h3>
              <button onClick={handleCropCancel} className="text-muted hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="relative flex-1 bg-black w-full overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                classes={{
                  containerClassName: 'bg-black',
                  mediaClassName: '',
                  cropAreaClassName: 'border-2 border-accent shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]'
                }}
              />
            </div>

            <div className="p-6 space-y-6 bg-[#050505] border-t border-white/10">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-heading uppercase tracking-widest text-muted">
                  <span>Zoom</span>
                  <span>{(zoom * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCropCancel}
                  className="flex-1 py-3 border border-white/10 text-muted font-heading text-[10px] font-black tracking-[0.2em] uppercase hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropConfirm}
                  className="flex-1 py-3 bg-accent text-black font-heading text-[10px] font-black tracking-[0.2em] uppercase hover:bg-accent/90 transition-all shadow-glow-sm"
                  style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{` 
        @keyframes v-scan { 0% { top: -10%; opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.8; } 100% { top: 110%; opacity: 0; } } 
        @keyframes h-scan { 0% { left: -10%; } 100% { left: 110%; } } 
      `}</style>
    </div>
  );
};

export default UserManagement;
