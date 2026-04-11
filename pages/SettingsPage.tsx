
import React, { useState, useEffect } from 'react';
import { useDataStore } from '../store/dataStore';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { 
  Settings, 
  Key, 
  Globe, 
  Shield, 
  Save, 
  RefreshCw,
  Cpu,
  Terminal,
  Activity,
  Zap,
  ShieldCheck,
  ShieldX,
  Binary,
  Layers,
  Database,
  Palette,
  Lock,
  Wifi,
  Target,
  Loader2,
  User as UserIcon,
  Phone,
  MapPin,
  Mail,
  MessageCircle,
  Clock,
  Image as ImageIcon,
  Camera
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { 
    registrationToken, 
    registrationKeyRequired,
    defaultAdminId,
    brandingName, 
    ownerName, 
    ownerPhone, 
    ownerEmail, 
    ownerAddress, 
    whatsappNumber, 
    officeHours,
    faviconURL,
    seoTitle,
    seoDescription,
    seoKeywords,
    seoImage,
    updateSettings, 
    addLog 
  } = useDataStore();
  
  const { addNotification } = useUIStore();
  const { user } = useAuthStore();
  
  const [newKey, setNewKey] = useState(registrationToken);
  const [newKeyRequired, setNewKeyRequired] = useState(registrationKeyRequired);
  const [newDefaultAdminId, setNewDefaultAdminId] = useState(defaultAdminId);
  const [newName, setNewName] = useState(brandingName);
  const [newFavicon, setNewFavicon] = useState(faviconURL);
  const [newSeoTitle, setNewSeoTitle] = useState(seoTitle);
  const [newSeoDescription, setNewSeoDescription] = useState(seoDescription);
  const [newSeoKeywords, setNewSeoKeywords] = useState(seoKeywords);
  const [newSeoImage, setNewSeoImage] = useState(seoImage);
  
  const [contactInfo, setContactInfo] = useState({
    ownerName: ownerName,
    ownerPhone: ownerPhone,
    ownerEmail: ownerEmail,
    ownerAddress: ownerAddress,
    whatsappNumber: whatsappNumber,
    officeHours: officeHours
  });
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNewKey(registrationToken);
    setNewKeyRequired(registrationKeyRequired);
    setNewDefaultAdminId(defaultAdminId);
    setNewName(brandingName);
    setNewFavicon(faviconURL);
    setNewSeoTitle(seoTitle);
    setNewSeoDescription(seoDescription);
    setNewSeoKeywords(seoKeywords);
    setNewSeoImage(seoImage);
    setContactInfo({
      ownerName,
      ownerPhone,
      ownerEmail,
      ownerAddress,
      whatsappNumber,
      officeHours
    });
  }, [registrationToken, registrationKeyRequired, defaultAdminId, brandingName, ownerName, ownerPhone, ownerEmail, ownerAddress, whatsappNumber, officeHours, faviconURL, seoTitle, seoDescription, seoKeywords]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // If disabling key requirement, ensure we have a default admin ID (the current admin)
      const adminToSet = !newKeyRequired ? (newDefaultAdminId || user?.uid || '') : newDefaultAdminId;
      
      await updateSettings(newKey, newName, newFavicon, contactInfo, newKeyRequired, adminToSet, newSeoTitle, newSeoDescription, newSeoKeywords, newSeoImage);
      await addLog('SETTINGS_UPDATE', 'Admin', `Updated parameters for ${newName}`);
      addNotification('SUCCESS', 'COMPLETE', 'Institutional parameters synchronized.');
    } catch (e: any) {
      addNotification('ERROR', 'FAILED', 'Failed to commit changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, val: string) => {
    setContactInfo(prev => ({ ...prev, [field]: val }));
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        return addNotification('ERROR', 'FILE_TOO_LARGE', 'Favicon must be under 500KB.');
      }
      const reader = new FileReader();
      reader.onloadend = () => setNewFavicon(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSeoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        return addNotification('ERROR', 'FILE_TOO_LARGE', 'Image must be under 1MB.');
      }
      const reader = new FileReader();
      reader.onloadend = () => setNewSeoImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const statItems = [
    { label: 'TOKENS', val: '08', color: 'text-white', icon: <Key size={16}/>, desc: 'TOKENS' },
    { label: 'SYNC', val: 'STABLE', color: 'text-accent', icon: <Settings size={16}/>, desc: 'STABLE' },
    { label: 'BRAND', val: 'ACTIVE', color: 'text-yellow-500', icon: <Globe size={16}/>, desc: 'ACTIVE' },
    { label: 'RATE', val: '1.2GB/S', color: 'text-error', icon: <Activity size={16}/>, desc: 'STABLE' },
  ];

  return (
    <div className="max-w-[1700px] mx-auto space-y-10 animate-in fade-in duration-1000 pb-20 relative px-0.5 sm:px-4 select-none">
      {/* 2. HUD HEADER */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-accent">
            <Settings size={16} className="animate-pulse" />
            <p className="text-[10px] font-heading tracking-[0.5em] uppercase font-black">TERMINAL</p>
          </div>
          <h2 className="text-2xl sm:text-5xl font-heading font-black tracking-tighter text-white uppercase leading-none">SETTINGS</h2>
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
                     <p className="text-[7px] font-heading tracking-[0.4em] text-muted uppercase opacity-40">SET_{i.toString().padStart(2, '0')}</p>
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

      {/* 4. MAIN CONFIGURATION GRID */}
      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-8">
          <div 
            className="bg-black/60 border border-white/10 p-6 sm:p-10 relative overflow-hidden shadow-2xl"
            style={{ clipPath: 'polygon(0 40px, 40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)' }}
          >
            <div className="space-y-12 relative z-10">
              {/* Brand Identity & Name Section */}
              <div className="space-y-6 border-b border-white/5 pb-12">
                <div className="flex items-center gap-4">
                  <Palette size={18} className="text-accent shrink-0" />
                  <h3 className="font-heading text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.4em] uppercase font-black text-white">BRAND IDENTITY</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-2.5 group">
                    <label className="flex items-center gap-2 text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                      <Globe size={14} className="text-accent/40 group-focus-within:text-accent shrink-0" /> BRAND NAME
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                      <input 
                        type="text" 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)} 
                        className="w-full bg-white/[0.02] border border-white/10 p-4 sm:p-5 text-[11px] sm:text-[12px] font-heading tracking-widest outline-none focus:border-accent/50 transition-colors duration-300 uppercase" 
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                        placeholder="NAME" 
                      />
                      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                    </div>
                  </div>
                  <div className="space-y-2.5 group">
                    <label className="flex items-center gap-2 text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                      <ImageIcon size={14} className="text-accent/40 group-focus-within:text-accent shrink-0" /> FAVICON
                    </label>
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <div className="w-20 h-20 bg-black border border-white/10 p-2 flex items-center justify-center relative overflow-hidden">
                          {newFavicon ? (
                            <img src={newFavicon || undefined} className="w-full h-full object-contain" alt="Favicon Preview" />
                          ) : (
                            <ImageIcon size={24} className="text-white/10" />
                          )}
                          <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                             <Camera size={16} className="text-accent" />
                          </div>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFaviconUpload} 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[8px] font-heading text-white uppercase tracking-widest">UPLOAD</p>
                        <p className="text-[7px] font-heading text-muted uppercase tracking-widest leading-relaxed">Recommended: 32x32 or 64x64 PNG/ICO.<br/>Max size: 500KB.</p>
                        {newFavicon && (
                          <button 
                            onClick={() => setNewFavicon('')} 
                            className="text-[7px] font-heading text-error/60 hover:text-error uppercase tracking-widest transition-all"
                          >
                            [ REMOVE ]
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration Key Required Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-white/5 pb-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Settings size={18} className="text-accent shrink-0" />
                    <h3 className="font-heading text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.4em] uppercase font-black text-white">WEBSITE SETTINGS</h3>
                  </div>
                  <div className="space-y-2.5 group">
                    <label className="flex items-center gap-2 text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                      <Lock size={14} className="text-accent/40 group-focus-within:text-accent shrink-0" /> REGISTRATION LOCK
                    </label>
                    <p className="text-[9px] text-muted/40 uppercase tracking-tight pl-1 mb-2">
                      When enabled, users must provide a valid registration key to create an account.
                    </p>
                    <div className="relative">
                      <button 
                        onClick={() => setNewKeyRequired(!newKeyRequired)}
                        className={`w-full p-4 text-[11px] font-heading tracking-widest uppercase flex items-center justify-between border ${newKeyRequired ? 'bg-accent/10 border-accent/50 text-accent' : 'bg-white/5 border-white/10 text-muted'}`}
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                      >
                        {newKeyRequired ? 'ENABLED' : 'DISABLED'}
                        {newKeyRequired ? <ShieldCheck size={16} /> : <ShieldX size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Globe size={18} className="text-accent shrink-0" />
                    <h3 className="font-heading text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.4em] uppercase font-black text-white">SEO SETTINGS</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2.5 group">
                      <label className="flex items-center gap-2 text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                        SEO TITLE
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={newSeoTitle} 
                          onChange={(e) => setNewSeoTitle(e.target.value)} 
                          className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading tracking-widest outline-none focus:border-accent/50 transition-colors duration-300" 
                          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                          placeholder="META TITLE" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2.5 group">
                      <label className="flex items-center gap-2 text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                        SEO DESCRIPTION
                      </label>
                      <div className="relative">
                        <textarea 
                          value={newSeoDescription} 
                          onChange={(e) => setNewSeoDescription(e.target.value)} 
                          className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading tracking-widest outline-none focus:border-accent/50 transition-colors duration-300 h-24 resize-none" 
                          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                          placeholder="META DESCRIPTION" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2.5 group">
                      <label className="flex items-center gap-2 text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                        SEO KEYWORDS
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={newSeoKeywords} 
                          onChange={(e) => setNewSeoKeywords(e.target.value)} 
                          className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading tracking-widest outline-none focus:border-accent/50 transition-colors duration-300" 
                          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                          placeholder="KEYWORDS (COMMA SEPARATED)" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5 group">
                      <label className="flex items-center gap-2 text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                        SOCIAL PREVIEW IMAGE (OG:IMAGE)
                      </label>
                      <div className="space-y-4">
                        <div className="flex items-center gap-6">
                          <div className="relative group">
                            <div className="w-32 h-20 bg-black border border-white/10 p-1 flex items-center justify-center relative overflow-hidden">
                              {newSeoImage ? (
                                <img src={newSeoImage} className="w-full h-full object-cover" alt="SEO Preview" />
                              ) : (
                                <ImageIcon size={24} className="text-white/10" />
                              )}
                              <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                 <Camera size={16} className="text-accent" />
                              </div>
                            </div>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleSeoImageUpload} 
                              className="absolute inset-0 opacity-0 cursor-pointer" 
                            />
                          </div>
                          <div className="space-y-2">
                            <p className="text-[8px] font-heading text-white uppercase tracking-widest">UPLOAD IMAGE</p>
                            <p className="text-[7px] font-heading text-muted uppercase tracking-widest leading-relaxed">Recommended: 1200x630px.<br/>Max size: 1MB.</p>
                            {newSeoImage && (
                              <button 
                                onClick={() => setNewSeoImage('')} 
                                className="text-[7px] font-heading text-error/60 hover:text-error uppercase tracking-widest transition-all"
                              >
                                [ REMOVE ]
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 group">
                          <label className="text-[9px] font-heading text-muted/40 uppercase tracking-widest pl-1">OR PASTE IMAGE URL (RECOMMENDED FOR SOCIAL MEDIA)</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              value={newSeoImage.startsWith('data:') ? '' : newSeoImage} 
                              onChange={(e) => setNewSeoImage(e.target.value)} 
                              className="w-full bg-white/[0.02] border border-white/10 p-3 text-[10px] font-heading tracking-widest outline-none focus:border-accent/50 transition-colors duration-300" 
                              style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%)' }}
                              placeholder="https://example.com/image.jpg" 
                            />
                          </div>
                          <p className="text-[8px] text-yellow-500/60 uppercase tracking-tight pl-1 leading-relaxed">
                            Note: Social media platforms (Facebook, IMO, etc.) usually require a direct URL to an image. Uploaded images (Base64) may not show up in previews.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                <div className="space-y-10">
                <div className="flex items-center gap-4">
                   <Terminal size={18} className="text-accent shrink-0" />
                   <h3 className="font-heading text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.4em] uppercase font-black text-white">CONTACT</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2.5 group">
                      <label className="flex items-center gap-2 text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors"><UserIcon size={14} className="text-accent/40 group-focus-within:text-accent shrink-0" /> OWNER</label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                        <input value={contactInfo.ownerName} onChange={e => updateField('ownerName', e.target.value)} className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading tracking-widest outline-none focus:border-accent/50 transition-colors duration-300" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }} />
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                      </div>
                   </div>
                   <div className="space-y-2.5 group">
                      <label className="flex items-center gap-2 text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors"><Phone size={14} className="text-accent/40 group-focus-within:text-accent shrink-0" /> PHONE</label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                        <input value={contactInfo.ownerPhone} onChange={e => updateField('ownerPhone', e.target.value)} className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading tracking-widest outline-none focus:border-accent/50 transition-colors duration-300" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }} />
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                      </div>
                   </div>
                   <div className="space-y-2.5 group">
                      <label className="flex items-center gap-2 text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors"><Mail size={14} className="text-accent/40 group-focus-within:text-accent shrink-0" /> EMAIL</label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                        <input value={contactInfo.ownerEmail} onChange={e => updateField('ownerEmail', e.target.value)} className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading tracking-widest outline-none focus:border-accent/50 transition-colors duration-300" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }} />
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                      </div>
                   </div>
                   <div className="space-y-2.5 group">
                      <label className="flex items-center gap-2 text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors"><MessageCircle size={14} className="text-accent/40 group-focus-within:text-accent shrink-0" /> WHATSAPP</label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                        <input value={contactInfo.whatsappNumber} onChange={e => updateField('whatsappNumber', e.target.value)} className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading tracking-widest outline-none focus:border-accent/50 transition-colors duration-300" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }} />
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                      </div>
                   </div>
                   <div className="space-y-2.5 group">
                      <label className="flex items-center gap-2 text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors"><Clock size={14} className="text-accent/40 group-focus-within:text-accent shrink-0" /> HOURS</label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                        <input value={contactInfo.officeHours} onChange={e => updateField('officeHours', e.target.value)} className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading tracking-widest outline-none focus:border-accent/50 transition-colors duration-300" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }} />
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                      </div>
                   </div>
                   <div className="space-y-2.5 group md:col-span-2">
                      <label className="flex items-center gap-2 text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors"><MapPin size={14} className="text-accent/40 group-focus-within:text-accent shrink-0" /> ADDRESS</label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                        <textarea value={contactInfo.ownerAddress} onChange={e => updateField('ownerAddress', e.target.value)} className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading tracking-widest outline-none focus:border-accent/50 transition-colors duration-300 h-24 resize-none" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }} />
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Centered button container */}
              <div className="pt-10 flex justify-center">
                 <button 
                  disabled={isSaving} 
                  onClick={handleSave} 
                  className="w-full py-5 bg-white text-black font-heading text-[12px] font-black tracking-[0.6em] uppercase hover:bg-accent hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group" 
                  style={{ clipPath: 'polygon(12% 0, 100% 0, 100% 65%, 88% 100%, 0 100%, 0 35%)' }}
                 >
                    {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={18} className="group-hover:scale-110 transition-transform" />}
                    {isSaving ? 'SYNCHRONIZING...' : 'SAVE_SETTINGS'}
                 </button>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
           <div className="bg-surface border border-white/10 p-10 space-y-8 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)' }}>
              <Shield size={48} className="text-accent opacity-20" />
              <div className="space-y-4">
                 <h4 className="font-heading text-sm font-black uppercase text-white tracking-widest">SECURITY</h4>
                 <p className="text-[10px] text-muted uppercase tracking-widest leading-loose">
                    Changes to institutional parameters will be synchronized across all identity nodes globally. Authenticate before deployment.
                 </p>
              </div>
           </div>
        </div>
      </div>

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

export default SettingsPage;
