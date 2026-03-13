import React, { useState, useRef, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import { useUIStore } from '../store/uiStore';
import { isPermissionActive } from '../lib/utils';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../lib/cropImage';
import { 
  Shield, 
  Mail, 
  Phone, 
  MapPin, 
  Activity, 
  Fingerprint,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Cpu,
  Terminal,
  Binary,
  Target,
  Wifi,
  Database,
  Layers,
  TrendingUp,
  Wrench,
  Zap,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Box,
  Square,
  Crosshair,
  ChevronDown,
  ChevronRight,
  Ticket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const { categories, students, updateStudent, redeemSubscriptionCode, subscriptionCodes } = useDataStore();
  const { addNotification, setGlobalLoading } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [redemptionCode, setRedemptionCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [openSections, setOpenSections] = useState({
    details: true,
    subscription: false,
    history: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    if (isEditing) {
      setOpenSections(prev => ({ ...prev, details: true }));
    }
  }, [isEditing]);

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
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImage) {
        try {
          const compressed = await compressImage(croppedImage);
          setFormData({ ...formData, photoURL: compressed });
        } catch (err) {
          console.error("Compression failed:", err);
          setFormData({ ...formData, photoURL: croppedImage });
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentSyncUser = useMemo(() => {
    if (!user) return null;
    const syncedStudent = students.find(s => s.uid === user.uid);
    return syncedStudent ? { ...user, ...syncedStudent } : user;
  }, [user, students]);

  const [formData, setFormData] = useState({
    displayName: currentSyncUser?.displayName || '',
    email: currentSyncUser?.email || '',
    username: currentSyncUser?.username || '',
    phone: currentSyncUser?.phone || '',
    address: currentSyncUser?.address || '',
    photoURL: currentSyncUser?.photoURL || ''
  });

  useEffect(() => {
    if (currentSyncUser && !isEditing) {
      setFormData({
        displayName: currentSyncUser.displayName || '',
        email: currentSyncUser.email || '',
        username: currentSyncUser.username || '',
        phone: currentSyncUser.phone || '',
        address: currentSyncUser.address || '',
        photoURL: currentSyncUser.photoURL || ''
      });
    }
  }, [currentSyncUser, isEditing]);

  // Sync permissions to authStore for global access (e.g. App.tsx routes)
  useEffect(() => {
    if (currentSyncUser && user && JSON.stringify(currentSyncUser.permissions) !== JSON.stringify(user.permissions)) {
      updateUser({ permissions: currentSyncUser.permissions });
    }
  }, [currentSyncUser, user, updateUser]);

  if (!currentSyncUser) return null;

  const handleRedeem = async () => {
    if (!redemptionCode || !user) return;
    setIsRedeeming(true);
    setGlobalLoading(true);
    try {
      await redeemSubscriptionCode(redemptionCode, user.uid);
      addNotification('SUCCESS', 'PROVISION_ACTIVE', 'Access provisioned successfully.');
      setRedemptionCode('');
    } catch (error: any) {
      addNotification('ERROR', 'PROVISION_FAILED', error.message || 'Invalid or expired provision code.');
    } finally {
      setIsRedeeming(false);
      setGlobalLoading(false);
    }
  };

  const authorizedCategories = categories.filter(cat => {
    const perm = currentSyncUser.permissions?.categoryPermissions?.[cat.id];
    return currentSyncUser.permissions?.allAccess || 
           (currentSyncUser.permissions?.categories?.includes(cat.id) && isPermissionActive(perm));
  }).map(cat => {
    const perm = currentSyncUser.permissions?.categoryPermissions?.[cat.id];
    return { ...cat, perm, isExpired: false };
  });

  const toolPermissions = [
    { 
      id: 'money-management', 
      name: 'MONEY_MANAGEMENT', 
      active: currentSyncUser.permissions?.allAccess || 
              (currentSyncUser.permissions?.canAccessMoneyManagement && 
               isPermissionActive(currentSyncUser.permissions?.moneyManagement)), 
      icon: <Wifi size={12} className="text-accent/30 shrink-0" />,
      perm: currentSyncUser.permissions?.moneyManagement,
      isExpired: false
    }
  ].filter(t => t.active);

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
    });
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const { email, ...updatePayload } = formData;
      await updateStudent(currentSyncUser.uid, updatePayload);
      updateUser(formData);
      setIsEditing(false);
      addNotification('SUCCESS', 'SYNC_COMPLETE', 'Identity profile synchronized globally.');
    } catch (error: any) {
      addNotification('ERROR', 'SYNC_FAILED', error.message || 'Database write rejected by security protocol.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: currentSyncUser.displayName || '',
      email: currentSyncUser.email || '',
      username: currentSyncUser.username || '',
      phone: currentSyncUser.phone || '',
      address: currentSyncUser.address || '',
      photoURL: currentSyncUser.photoURL || ''
    });
    setIsEditing(false);
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

  const statItems = [
    { label: 'CLEARANCE', val: currentSyncUser.role === 'ADMIN' ? 'ROOT' : (currentSyncUser.permissions?.allAccess ? 'MAX' : '01'), color: 'text-accent', icon: <Shield size={16} className="shrink-0" />, desc: 'AUTH_OK' },
    { label: 'IDENTITY', val: 'LINK', color: 'text-white', icon: <Fingerprint size={16} className="shrink-0" />, desc: 'BIOMETRIC' },
    { label: 'SIGNAL', val: 'STABLE', color: 'text-yellow-500', icon: <Wifi size={16} className="shrink-0" />, desc: 'ACTIVE' },
    { label: 'INSTANCE', val: currentSyncUser.adminId?.slice(0, 4).toUpperCase() || 'ROOT', color: 'text-error', icon: <Database size={16} className="shrink-0" />, desc: 'GRID' },
  ];

  const myHistory = useMemo(() => {
    return subscriptionCodes
      .filter(code => code.usedBy === currentSyncUser.uid && code.type !== 'MANUAL_UPDATE' as any)
      .sort((a, b) => new Date(b.usedAt || 0).getTime() - new Date(a.usedAt || 0).getTime());
  }, [subscriptionCodes, currentSyncUser.uid]);

  const getTargetNames = (code: any) => {
    if (code.type === 'MONEY_MANAGEMENT') return 'MONEY_MANAGEMENT';
    if (code.type === 'ANALYTICS') return 'ANALYTICS';
    if (code.targetIds) {
      return code.targetIds.map((id: string) => {
        if (id === 'MONEY_MGMT') return 'MONEY_MGMT';
        const cat = categories.find(c => c.id === id);
        return cat ? cat.name : id;
      }).join(', ');
    }
    return code.type;
  };

  const ActionButtons = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`flex items-center gap-3 ${isMobile ? 'w-full px-0' : ''}`}>
      {!isEditing ? (
        <button 
          onClick={() => setIsEditing(true)}
          className={`bg-white text-black font-heading font-black tracking-[0.4em] uppercase hover:bg-accent hover:shadow-glow transition-all flex items-center justify-center gap-4 active:scale-95 shadow-glow-sm ${isMobile ? 'w-full py-3 px-4 text-[9px]' : 'py-5 px-10 text-[11px]'}`}
          style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
        >
          <Edit3 size={isMobile ? 14 : 18} className="shrink-0" /> EDIT_PROFILE
        </button>
      ) : (
        <div className={`flex gap-3 ${isMobile ? 'w-full justify-between' : ''}`}>
          <button 
            onClick={handleCancel}
            disabled={isSaving}
            className={`bg-zinc-900 text-white font-heading font-black tracking-[0.4em] uppercase hover:bg-error transition-all flex items-center justify-center gap-3 ${isMobile ? 'flex-1 py-3 px-3 text-[9px]' : 'py-5 px-8 text-[11px]'}`}
            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
          >
            <X size={isMobile ? 14 : 18} className="shrink-0" /> ABORT
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`font-heading font-black tracking-[0.4em] uppercase hover:shadow-glow transition-all flex items-center justify-center gap-3 active:scale-95 shadow-glow-lg group overflow-hidden relative ${
              isSaving ? 'bg-accent text-black animate-pulse cursor-wait' : 'bg-accent text-black'
            } ${isMobile ? 'flex-[1.5] py-3 px-3 text-[9px]' : 'py-5 px-12 text-[11px]'}`}
            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
          >
            {isSaving ? <Loader2 size={isMobile ? 14 : 18} className="animate-spin shrink-0" /> : <Save size={isMobile ? 14 : 18} className="shrink-0" />}
            {isSaving ? 'SYNCING' : 'SYNC'}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-[1700px] mx-auto space-y-6 sm:space-y-10 animate-in fade-in duration-1000 pb-20 relative px-0.5 sm:px-4 select-none">
      {/* 2. HUD HEADER */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 border-b border-white/5 pb-6 sm:pb-8">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-3 text-accent">
            <Activity size={14} className="animate-pulse shrink-0" />
            <p className="text-[8px] sm:text-[10px] font-heading tracking-[0.5em] uppercase font-black">REGISTRY</p>
          </div>
          <h2 className="text-2xl sm:text-5xl font-heading font-black tracking-tighter text-white uppercase leading-none">PROFILE</h2>
        </div>
        
        <div className="hidden md:block">
           <ActionButtons />
        </div>
      </div>

      {/* 3. HUD DATA MODULES */}
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
                     {s.val}
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

      {/* 4. MOBILE ACTION BUTTONS */}
      <div className="md:hidden relative z-10 w-full flex justify-center py-1">
         <ActionButtons isMobile />
      </div>

      {/* 5. MAIN INTERFACE */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* LEFT COLUMN: BIOMETRIC SECTOR */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          <div 
            className="bg-[#050505] border border-white/10 p-6 sm:p-12 relative overflow-hidden flex flex-col items-center text-center space-y-6 sm:space-y-10"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)' }}
          >
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(rgba(0,240,255,0.4) 0px, rgba(0,240,255,0.4) 1px, transparent 1px, transparent 40px)' }}></div>
             
             <div className="relative group/avatar cursor-pointer" onClick={() => isEditing ? fileInputRef.current?.click() : formData.photoURL && setShowPhotoModal(true)}>
                <div className="w-24 h-24 sm:w-44 sm:h-44 p-0.5 sm:p-1 bg-black border border-white/10 relative overflow-hidden group-hover:border-accent transition-all duration-1000 shadow-glow-sm">
                   <div className="w-full h-full bg-zinc-950 flex items-center justify-center overflow-hidden relative">
                      {formData.photoURL ? (
                        <img src={formData.photoURL || undefined} className="w-full h-full object-cover grayscale opacity-60 group-hover/avatar:grayscale-0 group-hover/avatar:opacity-100 transition-all duration-1000" alt="Identity" />
                      ) : (
                        <Fingerprint size={40} className="text-muted/10 group-hover:text-accent/20 transition-all shrink-0 sm:size-[60px]" />
                      )}
                      
                      {isEditing && (
                        <div className="absolute inset-0 bg-accent/40 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                           <Camera size={24} className="text-white mb-1 shrink-0 sm:size-[32px] sm:mb-2" />
                           <span className="text-[8px] font-heading text-white uppercase tracking-[0.4em] font-black sm:text-[10px]">REMAP</span>
                        </div>
                      )}
                      <div className="absolute inset-0 pointer-events-none opacity-20">
                         <div className="w-full h-[1px] bg-accent/60 shadow-[0_0_15px_#00F0FF] animate-[v-scan_4s_linear_infinite]"></div>
                      </div>
                   </div>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-accent/40 group-hover/avatar:border-accent transition-colors sm:w-5 sm:h-5 sm:border-t-2 sm:border-r-2 sm:-top-2 sm:-right-2"></div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
             </div>

             <div className="space-y-3 w-full px-1">
                <div className="space-y-1">
                   <h3 className="text-xl sm:text-3xl font-heading font-black uppercase text-white tracking-tighter leading-none break-words overflow-hidden">{formData.displayName || 'UNSET_ID'}</h3>
                   <div className="flex items-center justify-center gap-2 text-accent/60">
                      <Terminal size={12} className="shrink-0" />
                      <p className="text-[8px] sm:text-[10px] font-heading tracking-[0.4em] uppercase font-black truncate">@{formData.username || 'UNSET'}</p>
                   </div>
                </div>
                
                <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
                   <div className="flex items-center justify-between text-[8px] font-heading text-muted/40 uppercase tracking-widest">
                      <span className="flex items-center gap-2"><Calendar size={9} className="shrink-0" /> CREATED</span>
                      <span className="text-white/60 font-black">2025_OK</span>
                   </div>
                   <div className="flex items-center justify-between text-[8px] font-heading text-muted/40 uppercase tracking-widest">
                      <span className="flex items-center gap-2"><Target size={9} className="shrink-0" /> STATUS</span>
                      <span className="text-accent font-black">ACTIVE</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-accent/5 border border-accent/20 p-4 sm:p-8 flex items-center gap-4 sm:gap-6 relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-[2px] sm:w-1 h-full bg-accent animate-pulse"></div>
             <ShieldCheck size={24} className="text-accent/60 group-hover:text-accent transition-colors shrink-0 sm:size-[32px]" />
             <div className="space-y-0.5">
                <p className="text-[8px] sm:text-[10px] font-heading text-accent tracking-[0.5em] uppercase font-black leading-tight">Neural_Link_OK</p>
                <p className="text-[7px] sm:text-[9px] text-muted uppercase tracking-[0.2em] font-bold">Encrypted active. Logs synced.</p>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: IDENTITY INTEL STREAM */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
           
           {/* SECTION 1: IDENTITY DETAILS */}
           <div 
             className="bg-[#050505] border border-white/10 relative overflow-hidden shadow-2xl flex flex-col"
             style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}
           >
              <div 
                onClick={() => toggleSection('details')}
                className="flex items-center justify-between p-6 sm:p-8 cursor-pointer hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex items-center gap-4 sm:gap-6">
                   <div className="p-2 sm:p-3 bg-accent/10 border border-accent/20 relative shrink-0">
                      <Cpu size={18} className="text-accent animate-pulse shrink-0 sm:size-[24px]" />
                      <div className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t border-l border-accent"></div>
                      <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b border-r border-accent"></div>
                   </div>
                   <div>
                      <h3 className="text-sm sm:text-xl font-heading font-black tracking-[0.3em] sm:tracking-[0.4em] uppercase text-white">{isEditing ? 'EDIT_PROFILE' : 'DETAILS'}</h3>
                      <p className="text-[7px] sm:text-[9px] text-muted uppercase tracking-[0.3em] sm:tracking-[0.4em] mt-0.5 font-black">IDENTITY_INTEL</p>
                   </div>
                </div>
                <div className={`transition-transform duration-500 ${openSections.details ? 'rotate-180' : ''}`}>
                   <ChevronDown size={20} className="text-muted/40 group-hover:text-accent transition-colors" />
                </div>
              </div>

              <AnimatePresence>
                {openSections.details && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 sm:p-12 lg:p-16 pt-0 sm:pt-0 lg:pt-0 border-t border-white/5 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12 mt-8">
                         {[
                           { label: 'NAME', key: 'displayName', icon: <Fingerprint size={14} className="shrink-0" />, placeholder: 'NAME_ID' },
                           { label: 'EMAIL', key: 'email', icon: <Mail size={14} className="shrink-0" />, placeholder: 'EMAIL_NODE', readonly: true },
                           { label: 'USERNAME', key: 'username', icon: <Binary size={14} className="shrink-0" />, placeholder: 'ALIAS_KEY' },
                           { label: 'PHONE', key: 'phone', icon: <Phone size={14} className="shrink-0" />, placeholder: 'PHONE_SIGNAL' },
                           { label: 'ADDRESS', key: 'address', icon: <MapPin size={14} className="shrink-0" />, multiline: true, placeholder: 'ZONE_LOCATION' },
                         ].map(field => (
                           <div key={field.key} className={`space-y-2.5 group ${field.multiline ? 'md:col-span-2' : ''}`}>
                              <label className="flex items-center gap-2 text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                                <span className="text-accent/40 group-focus-within:text-accent">{field.icon}</span>
                                {field.label}
                              </label>
                              
                              {isEditing && !field.readonly ? (
                                <div className="relative">
                                  <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                                  
                                  {field.multiline ? (
                                    <textarea 
                                      value={(formData as any)[field.key] || ''}
                                      onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                                      placeholder={field.placeholder}
                                      className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-muted/10 uppercase h-24 resize-none custom-scrollbar"
                                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                                    />
                                  ) : (
                                    <input 
                                      value={(formData as any)[field.key] || ''}
                                      onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                                      placeholder={field.placeholder}
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
                                      {(formData as any)[field.key] || '--- NULL_STREAM ---'}
                                   </div>
                                   <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/10 group-hover/readonly:border-white/40 transition-colors"></div>
                                </div>
                              )}
                           </div>
                         ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>

           {/* SECTION 2: SUBSCRIPTION & REDEEM */}
           <div 
             className="bg-[#050505] border border-white/10 relative overflow-hidden shadow-2xl flex flex-col"
             style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}
           >
              <div 
                onClick={() => toggleSection('subscription')}
                className="flex items-center justify-between p-6 sm:p-8 cursor-pointer hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex items-center gap-4 sm:gap-6">
                   <div className="p-2 sm:p-3 bg-accent/10 border border-accent/20 relative shrink-0">
                      <Zap size={18} className="text-accent animate-pulse shrink-0 sm:size-[24px]" />
                      <div className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t border-l border-accent"></div>
                      <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b border-r border-accent"></div>
                   </div>
                   <div>
                      <h3 className="text-sm sm:text-xl font-heading font-black tracking-[0.3em] sm:tracking-[0.4em] uppercase text-white">SUBSCRIPTION_&_REDEEM</h3>
                      <p className="text-[7px] sm:text-[9px] text-muted uppercase tracking-[0.3em] sm:tracking-[0.4em] mt-0.5 font-black">ACCESS_CONTROL</p>
                   </div>
                </div>
                <div className={`transition-transform duration-500 ${openSections.subscription ? 'rotate-180' : ''}`}>
                   <ChevronDown size={20} className="text-muted/40 group-hover:text-accent transition-colors" />
                </div>
              </div>

              <AnimatePresence>
                {openSections.subscription && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 sm:p-12 lg:p-16 pt-0 sm:pt-0 lg:pt-0 border-t border-white/5 mt-4 space-y-10">
                        {/* Redemption Module */}
                        <div className="relative group mt-8">
                          <div className="relative bg-zinc-950/50 border border-white/5 p-5 sm:p-8 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-4 overflow-hidden">
                            <div className="space-y-2 relative z-10">
                              <div className="flex flex-col">
                                 <h4 className="font-heading text-[12px] sm:text-sm tracking-[0.1em] sm:tracking-[0.4em] uppercase text-white font-black leading-none">REDEEM_CODE</h4>
                                 <p className="text-[7px] sm:text-[8px] font-heading text-accent/60 tracking-[0.2em] uppercase mt-1">STATUS: READY</p>
                              </div>
                              <p className="text-[9px] sm:text-[10px] text-muted/60 uppercase tracking-[0.1em] sm:tracking-[0.2em] font-medium leading-relaxed max-w-md">
                                Enter your secure access code to synchronize new clearance protocols.
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                              <div className="flex-1 relative group">
                                <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                                <div className="absolute inset-y-0 left-4 flex items-center text-muted/40 group-focus-within:text-accent transition-colors z-10">
                                  <Terminal size={14} />
                                </div>
                                <input 
                                  type="text"
                                  value={redemptionCode}
                                  onChange={(e) => setRedemptionCode(e.target.value.toUpperCase())}
                                  placeholder="SUB-XXXXXX-XXXX"
                                  className="w-full bg-white/[0.02] border border-white/10 py-4 pl-12 pr-6 text-[11px] font-heading outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-muted/10 uppercase text-accent"
                                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                                />
                                <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                              </div>
                              <button 
                                onClick={handleRedeem}
                                disabled={isRedeeming || !redemptionCode}
                                className={`font-heading font-black tracking-[0.2em] sm:tracking-[0.4em] uppercase transition-all flex items-center justify-center gap-3 active:scale-95 group overflow-hidden relative ${
                                  isRedeeming ? 'bg-accent text-black animate-pulse cursor-wait' : 'bg-white text-black hover:bg-accent'
                                } py-4 px-10 text-[10px] sm:text-[11px]`}
                                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                              >
                               <span className="relative z-10 flex items-center justify-center gap-2">
                                 {isRedeeming ? (
                                   <>
                                     <Loader2 size={14} className="animate-spin shrink-0" />
                                     SYNCING...
                                   </>
                                 ) : (
                                   <>
                                     <Zap size={14} className="group-hover:animate-pulse" />
                                     ACTIVATE
                                   </>
                                 )}
                               </span>
                             </button>
                           </div>
                         </div>
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <Layers size={14} className="text-accent shrink-0 sm:size-[18px]" />
                                <h4 className="font-heading text-[8px] sm:text-xs tracking-[0.1em] sm:tracking-[0.4em] uppercase text-white font-black">ACTIVE_PERMISSIONS</h4>
                             </div>
                             <p className="hidden sm:block text-[8px] font-heading text-muted/40 uppercase tracking-[0.6em] font-black">SECURE_AUTH</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                            {currentSyncUser.permissions?.allAccess ? (
                              <div className="col-span-full p-4 sm:p-6 bg-accent/10 border border-accent/40 flex flex-col items-center text-center space-y-2 overflow-hidden">
                                <ShieldCheck size={24} className="text-accent animate-pulse" />
                                <p className="text-[12px] sm:text-[14px] font-heading font-black text-accent tracking-normal sm:tracking-[0.4em] uppercase break-words w-full leading-tight">ROOT_ACTIVE</p>
                                <p className="text-[8px] sm:text-[9px] font-heading text-accent/60 tracking-widest uppercase">Unlimited access to all neural grid sectors</p>
                              </div>
                            ) : (
                              <>
                                {toolPermissions.length > 0 || authorizedCategories.length > 0 ? (
                                  <>
                                    {toolPermissions.map(tool => (
                                      <div key={tool.id} className={`p-4 sm:p-5 lg:p-4 border flex flex-col gap-2 sm:gap-3 relative overflow-hidden group transition-all ${tool.isExpired ? 'bg-error/5 border-error/20 grayscale' : 'bg-white/[0.02] border-white/5 hover:border-accent/40'}`}>
                                        <div className="flex items-center justify-between relative z-10">
                                          <div className={`w-1.5 h-1.5 shadow-glow animate-pulse ${tool.isExpired ? 'bg-error' : 'bg-accent'}`}></div>
                                          <Wrench size={12} className="text-accent/30 shrink-0" />
                                        </div>
                                        <div className="relative z-10 min-w-0">
                                          <span className={`text-[9px] sm:text-[11px] font-heading font-black tracking-widest uppercase truncate block ${tool.isExpired ? 'text-error/60' : 'text-white/80'}`}>{tool.name}</span>
                                          <p className="text-[7px] sm:text-[8px] font-heading text-accent/40 uppercase tracking-widest mt-0.5 truncate">{tool.perm?.serialNumber || 'SN: N/A'}</p>
                                        </div>
                                        {tool.perm && (
                                          <div className="pt-2 mt-2 border-t border-white/5 space-y-1.5 relative z-10">
                                            <div className="flex items-center justify-between text-[7px] sm:text-[8px] font-heading uppercase tracking-widest">
                                              <span className="text-muted/40">Status</span>
                                              <span className="text-accent font-black">ACTIVE</span>
                                            </div>
                                            <div className="flex items-center justify-between text-[7px] sm:text-[8px] font-heading uppercase tracking-widest">
                                              <span className="text-muted/40">Expires</span>
                                              <span className={tool.isExpired ? 'text-error font-black' : 'text-white/60 font-black'}>
                                                {tool.isExpired ? 'EXPIRED' : new Date(tool.perm.expiresAt!).toLocaleDateString()}
                                              </span>
                                            </div>
                                            {!tool.isExpired && tool.perm.expiresAt && (
                                              <div className="flex items-center justify-between text-[7px] sm:text-[8px] font-heading uppercase tracking-widest">
                                                <span className="text-muted/40">Remaining</span>
                                                <span className="text-yellow-500 font-black">
                                                  {Math.max(0, Math.ceil((new Date(tool.perm.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} DAYS
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                    {authorizedCategories.map(cat => (
                                      <div key={cat.id} className={`p-4 sm:p-5 lg:p-4 border flex flex-col gap-2 sm:gap-3 relative overflow-hidden group transition-all ${cat.isExpired ? 'bg-error/5 border-error/20 grayscale' : 'bg-white/[0.02] border-white/5 hover:border-accent/40'}`}>
                                        <div className="flex items-center justify-between relative z-10">
                                          <div className={`w-1.5 h-1.5 shadow-glow animate-pulse ${cat.isExpired ? 'bg-error' : 'bg-accent'}`}></div>
                                          <Layers size={12} className="text-accent/30 shrink-0" />
                                        </div>
                                        <div className="relative z-10 min-w-0">
                                          <span className={`text-[9px] sm:text-[11px] font-heading font-black tracking-widest uppercase truncate block ${cat.isExpired ? 'text-error/60' : 'text-white/80'}`}>{cat.name}</span>
                                          <p className="text-[7px] sm:text-[8px] font-heading text-accent/40 uppercase tracking-widest mt-0.5 truncate">{cat.perm?.serialNumber || 'SN: N/A'}</p>
                                        </div>
                                        {cat.perm && (
                                          <div className="pt-2 mt-2 border-t border-white/5 space-y-1.5 relative z-10">
                                            <div className="flex items-center justify-between text-[7px] sm:text-[8px] font-heading uppercase tracking-widest">
                                              <span className="text-muted/40">Status</span>
                                              <span className="text-accent font-black">ACTIVE</span>
                                            </div>
                                            <div className="flex items-center justify-between text-[7px] sm:text-[8px] font-heading uppercase tracking-widest">
                                              <span className="text-muted/40">Expires</span>
                                              <span className={cat.isExpired ? 'text-error font-black' : 'text-white/60 font-black'}>
                                                {cat.isExpired ? 'EXPIRED' : new Date(cat.perm.expiresAt!).toLocaleDateString()}
                                              </span>
                                            </div>
                                            {!cat.isExpired && cat.perm.expiresAt && (
                                              <div className="flex items-center justify-between text-[7px] sm:text-[8px] font-heading uppercase tracking-widest">
                                                <span className="text-muted/40">Remaining</span>
                                                <span className="text-yellow-500 font-black">
                                                  {Math.max(0, Math.ceil((new Date(cat.perm.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} DAYS
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </>
                                ) : (
                                  <div className="col-span-full py-8 text-center border border-dashed border-white/5 bg-white/[0.01] space-y-3">
                                    <ShieldAlert size={24} className="mx-auto text-muted/20 shrink-0 sm:size-[32px]" />
                                    <p className="text-[8px] sm:text-[10px] font-heading text-muted/40 uppercase tracking-[0.4em]">NO_PERMISSIONS</p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>

           {/* SECTION 3: SUBSCRIPTION HISTORY */}
           <div 
             className="bg-[#050505] border border-white/10 relative overflow-hidden shadow-2xl flex flex-col"
             style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}
           >
              <div 
                onClick={() => toggleSection('history')}
                className="flex items-center justify-between p-6 sm:p-8 cursor-pointer hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex items-center gap-4 sm:gap-6">
                   <div className="p-2 sm:p-3 bg-accent/10 border border-accent/20 relative shrink-0">
                      <Ticket size={18} className="text-accent animate-pulse shrink-0 sm:size-[24px]" />
                      <div className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t border-l border-accent"></div>
                      <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b border-r border-accent"></div>
                   </div>
                   <div>
                      <h3 className="text-sm sm:text-xl font-heading font-black tracking-[0.3em] sm:tracking-[0.4em] uppercase text-white">SUBSCRIPTION_HISTORY</h3>
                      <p className="text-[7px] sm:text-[9px] text-muted uppercase tracking-[0.3em] sm:tracking-[0.4em] mt-0.5 font-black">REDEEM_LOGS</p>
                   </div>
                </div>
                <div className={`transition-transform duration-500 ${openSections.history ? 'rotate-180' : ''}`}>
                   <ChevronDown size={20} className="text-muted/40 group-hover:text-accent transition-colors" />
                </div>
              </div>

              <AnimatePresence>
                {openSections.history && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 sm:p-12 lg:p-16 pt-0 sm:pt-0 lg:pt-0 border-t border-white/5 mt-4">
                      {myHistory.length > 0 ? (
                        <div className="space-y-2 mt-8 max-h-[480px] sm:max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                          {myHistory.map((history) => {
                            const usedAtDate = new Date(history.usedAt || '');
                            const expiryDate = new Date(usedAtDate);
                            expiryDate.setDate(expiryDate.getDate() + history.durationDays);
                            const isExpired = expiryDate < new Date();

                            return (
                              <div key={history.id} className="bg-white/[0.02] border border-white/5 p-3 sm:p-4 flex flex-col sm:grid sm:grid-cols-[1fr_100px_1fr] sm:items-center justify-between gap-3 sm:gap-4 group hover:border-white/10 transition-all relative overflow-hidden min-h-[90px] sm:min-h-[70px]">
                                <div className="flex items-center gap-4 relative z-10 min-w-0">
                                  <div className={`w-1 h-8 sm:h-10 ${isExpired ? 'bg-muted/20' : 'bg-accent'} shrink-0`}></div>
                                  <div className="space-y-1 min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-[10px] sm:text-[11px] font-heading font-black text-white/90 tracking-wider uppercase truncate block">{getTargetNames(history)}</span>
                                      
                                      {/* Mobile Duration Tag - Aligned with title, strictly uniform size */}
                                      <div className="sm:hidden shrink-0">
                                        <span className={`text-[7px] font-heading h-5 w-12 flex items-center justify-center border ${isExpired ? 'border-muted/20 text-muted/40' : 'border-accent/30 text-accent/60'} uppercase font-black text-center`}>
                                          {history.durationDays}D
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-[8px] font-heading text-muted/40 uppercase tracking-widest">
                                      <span className="flex items-center gap-1"><Calendar size={8} /> {usedAtDate.toLocaleDateString()}</span>
                                      <span className="flex items-center gap-1"><Target size={8} /> {history.code}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Desktop Duration Tag - Exactly in the middle, strictly uniform size */}
                                <div className="hidden sm:flex items-center justify-center relative z-10">
                                  <span className={`text-[8px] font-heading h-6 w-14 flex items-center justify-center border ${isExpired ? 'border-muted/20 text-muted/40' : 'border-accent/30 text-accent/60'} uppercase font-black text-center`}>
                                    {history.durationDays}D
                                  </span>
                                </div>

                                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 relative z-10 shrink-0">
                                  <p className="text-[7px] font-heading text-muted/40 uppercase tracking-widest">EXPIRY_DATE</p>
                                  <p className={`text-[9px] sm:text-[10px] font-heading font-black tracking-widest ${isExpired ? 'text-error/60' : 'text-white/80'}`}>
                                    {expiryDate.toLocaleDateString()}
                                  </p>
                                </div>
                                
                                {/* Background subtle code */}
                                <div className="absolute -right-4 -bottom-2 text-[40px] font-heading font-black text-white/[0.02] select-none pointer-events-none uppercase italic">
                                  {history.code.split('-')[1]}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-8 text-center border border-dashed border-white/5 bg-white/[0.01] mt-8">
                          <p className="text-[8px] sm:text-[10px] font-heading text-muted/40 uppercase tracking-[0.4em]">NO_HISTORY_FOUND</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>

           {/* SYSTEM STATS FOOTER */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4">
              <div className="bg-black/60 border border-white/5 p-4 sm:p-8 flex flex-col gap-2 sm:gap-3 group hover:border-accent/20 transition-all overflow-hidden">
                 <div className="flex items-center justify-between">
                    <Database size={14} className="text-muted shrink-0 sm:size-[16px]" />
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-glow"></div>
                 </div>
                 <p className="text-[8px] sm:text-[9px] font-heading text-muted uppercase tracking-[0.4em] font-black leading-none">LAST_SYNC</p>
                 <p className="text-xs sm:text-lg font-heading font-black text-white uppercase tracking-widest truncate">{new Date().toLocaleTimeString()}</p>
              </div>
              <div className="bg-black/60 border border-white/5 p-4 sm:p-8 flex flex-col gap-2 sm:gap-3 group hover:border-accent/20 transition-all overflow-hidden">
                 <div className="flex items-center justify-between">
                    <Wifi size={14} className="text-muted shrink-0 sm:size-[16px]" />
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-glow"></div>
                 </div>
                 <p className="text-[8px] sm:text-[9px] font-heading text-muted uppercase tracking-[0.4em] font-black leading-none">STATUS</p>
                 <p className="text-xs sm:text-lg font-heading font-black text-white uppercase tracking-widest">SSL_STABLE_SYNC</p>
              </div>
           </div>
        </div>
      </div>

      {/* PHOTO PREVIEW MODAL - UPDATED SCALING */}
      {showPhotoModal && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/30 flex items-center justify-center p-6 animate-in fade-in duration-700 backdrop-blur-[20px]"
          onClick={() => setShowPhotoModal(false)}
        >
           <div 
             className="relative max-w-xl w-full border border-accent/40 p-2 bg-zinc-950 shadow-[0_0_100px_rgba(0,240,255,0.15)] animate-in zoom-in duration-300"
             style={{ clipPath: 'polygon(0 50px, 50px 0, 100% 0, 100% calc(100% - 50px), calc(100% - 50px) 100%, 0 100%)' }}
             onClick={e => e.stopPropagation()}
           >
              <button 
                onClick={() => setShowPhotoModal(false)} 
                className="absolute sm:top-10 sm:right-10 top-4 right-4 text-muted hover:text-white transition-all hover:scale-125 z-20 p-2 sm:p-0"
              >
                <X size={32} className="sm:size-[44px] shrink-0" />
              </button>
              <div className="relative border border-white/10 bg-black overflow-hidden aspect-square">
                <img src={formData.photoURL || undefined} className="w-full h-full object-cover" alt="Identity Scan" />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-transparent to-black/80"></div>
                
                <div className="absolute top-4 left-4 sm:top-10 sm:left-10 space-y-1 sm:space-y-2 pointer-events-none">
                   <p className="text-accent font-heading text-[8px] sm:text-[12px] tracking-[0.2em] sm:tracking-[0.6em] uppercase font-black">PHOTO_PREVIEW</p>
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
        @keyframes v-scan {
          0% { top: -10%; opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { top: 110%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;