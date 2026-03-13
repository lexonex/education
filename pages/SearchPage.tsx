
import React, { useState } from 'react';
import { useDataStore } from '../store/dataStore';
import { useMoneyManagementStore } from '../store/moneyManagementStore';
import { useAuthStore } from '../store/authStore';
import { generateDocumentUrl, isPermissionActive } from '../lib/utils';
import { UserRole } from '../types';
import { 
  Search, 
  FileText, 
  User as UserIcon, 
  Folder, 
  ChevronRight, 
  Hash,
  Activity,
  Cpu,
  Binary,
  Layers,
  Database,
  Wifi,
  Target,
  Zap,
  Box,
  Square,
  Crosshair,
  Terminal,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const { documents, students, categories } = useDataStore();
  const { historySessions, fetchHistoryData, isHistoryLoaded } = useMoneyManagementStore();
  const { user } = useAuthStore();
  const searchLower = query.toLowerCase();

  const isAdmin = user?.role === UserRole.ADMIN;

  React.useEffect(() => {
    if (user && !isHistoryLoaded && (isAdmin || user?.permissions?.allAccess || (user?.permissions?.canAccessMoneyManagement && isPermissionActive(user?.permissions?.moneyManagement)))) {
      fetchHistoryData(user.uid);
    }
  }, [user, isHistoryLoaded, fetchHistoryData, isAdmin]);

  const filteredDocs = query.length > 0 ? documents.filter(d => {
    const matches = d.title.toLowerCase().includes(searchLower) || 
                    d.id.toLowerCase().includes(searchLower) ||
                    d.serialNumber?.toLowerCase().includes(searchLower);
    
    if (!matches) return false;
    if (isAdmin || user?.permissions?.allAccess) return true;
    
    const perm = user?.permissions?.categoryPermissions?.[d.categoryId];
    return user?.permissions?.categories?.includes(d.categoryId) && isPermissionActive(perm);
  }).map(d => ({ ...d, type: 'DOCUMENT', link: generateDocumentUrl(d), icon: <FileText size={16} className="text-accent" /> })) : [];

  const filteredUsers = (query.length > 0 && isAdmin) ? students.filter(s => 
    s.displayName.toLowerCase().includes(searchLower) || 
    s.email.toLowerCase().includes(searchLower) || 
    s.uid.toLowerCase().includes(searchLower)
  ).map(u => ({ ...u, type: 'USER', link: '/users', icon: <UserIcon size={16} className="text-white" /> })) : [];

  const filteredCats = query.length > 0 ? categories.filter(c => {
    const matches = c.name.toLowerCase().includes(searchLower) || 
                    c.id.toLowerCase().includes(searchLower) ||
                    c.serialNumber?.toLowerCase().includes(searchLower);
    
    if (!matches) return false;
    if (isAdmin || user?.permissions?.allAccess) return true;
    
    const perm = user?.permissions?.categoryPermissions?.[c.id];
    return user?.permissions?.categories?.includes(c.id) && isPermissionActive(perm);
  }).map(c => ({ ...c, type: 'PERMISSION', link: `/category/${c.name}`, icon: <Layers size={16} className="text-yellow-500" /> })) : [];

  const canAccessMoneyManagement = isAdmin || user?.permissions?.allAccess || (user?.permissions?.canAccessMoneyManagement && isPermissionActive(user?.permissions?.moneyManagement));

  const filteredSessions = (query.length > 0 && canAccessMoneyManagement) ? historySessions.filter(s => 
    (s.name?.toLowerCase().includes(searchLower)) || 
    (s.serialNumber?.toLowerCase().includes(searchLower)) ||
    (s.id?.toLowerCase().includes(searchLower))
  ).map(s => ({ ...s, type: 'SESSION', link: '/money-management-history', icon: <TrendingUp size={16} className="text-emerald-500" /> })) : [];

  const allResults = [...filteredDocs, ...filteredUsers, ...filteredCats, ...filteredSessions];

  const statItems = [
    { label: 'NODES_FOUND', val: filteredDocs.length, color: 'text-accent', icon: <FileText size={16}/>, desc: 'KNOWLEDGE_PACKETS' },
    { label: 'IDENT_FOUND', val: filteredUsers.length, color: 'text-white', icon: <UserIcon size={16}/>, desc: 'NEURAL_PROFILES' },
    { label: 'SCT_MATCHES', val: filteredCats.length, color: 'text-yellow-500', icon: <Layers size={16}/>, desc: 'TAXONOMY_LINKS' },
    { label: 'SESS_MATCHES', val: filteredSessions.length, color: 'text-emerald-500', icon: <TrendingUp size={16}/>, desc: 'FINANCIAL_NODES' },
  ];

  return (
    <div className="max-w-[1700px] mx-auto space-y-6 sm:space-y-10 animate-in fade-in duration-1000 pb-20 relative px-0.5 sm:px-4 select-none">
      {/* 2. PAGE HEADER (TOP) */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6 sm:pb-8">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-3 text-accent">
            <Activity size={16} className="animate-pulse" />
            <p className="text-[8px] sm:text-[10px] font-heading tracking-[0.5em] uppercase font-black">Central_Intelligence</p>
          </div>
          <h2 className="text-2xl sm:text-5xl font-heading font-black tracking-tighter text-white uppercase leading-none">INTELLIGENCE_CENTER</h2>
        </div>
      </div>

      {/* 3. SEARCH INPUT BOX - OPTIMIZED FOR MOBILE */}
      <div className="relative z-10 flex flex-col gap-6 sm:gap-8">
        <div className="bg-black/60 border border-white/5 p-1 sm:p-2 backdrop-blur-xl relative">
          <div className="absolute -top-1 -left-1 w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-l-2 border-accent"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-r-2 border-accent"></div>
          <div className="flex-1 relative group bg-surface/40">
            <Search size={20} className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" />
            <input 
              autoFocus 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              placeholder="[ SCAN DATABASE... ]" 
              className="w-full bg-transparent px-12 sm:px-24 py-4 sm:py-10 text-sm sm:text-2xl font-heading tracking-[0.2em] sm:tracking-[0.3em] uppercase outline-none focus:border-accent text-white placeholder:text-muted/10" 
            />
          </div>
        </div>

        {/* 4. DYNAMIC GLOBAL SEARCH HEADER & STATS */}
        {query.length > 0 && (
          <div className="space-y-6 sm:space-y-10 animate-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-4 sm:gap-6 border-l-2 sm:border-l-4 border-accent pl-4 sm:pl-6 py-1 sm:py-2">
               <div className="space-y-0.5 sm:space-y-1">
                 <h2 className="text-xl sm:text-4xl font-heading font-black tracking-tighter text-white uppercase leading-none">GLOBAL_SEARCH</h2>
                 <p className="text-[7px] sm:text-[10px] font-heading text-accent tracking-[0.4em] sm:tracking-[0.6em] uppercase font-black opacity-60">Scanning_Distributed_Registry...</p>
               </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {statItems.map((s, i) => (
                <div key={i} className="bg-surface/80 border border-white/5 p-3 sm:p-5 relative overflow-hidden group hover:border-accent/40 transition-all duration-500">
                   <div className="absolute top-0 right-0 w-8 sm:w-12 h-0.5 sm:h-1 bg-accent/20"></div>
                   <div className="absolute bottom-0 left-0 w-0.5 sm:w-1 h-6 sm:h-8 bg-accent/20"></div>
                   <div className="flex items-center justify-between mb-2 sm:mb-6">
                      <div className={`p-1.5 sm:p-2 bg-black border border-white/10 ${s.color} transition-all duration-300
                        ${s.color === 'text-white' ? 'group-hover:bg-white group-hover:text-black' : 
                          s.color === 'text-accent' ? 'group-hover:bg-accent group-hover:text-black' : 
                          s.color === 'text-yellow-500' ? 'group-hover:bg-yellow-500 group-hover:text-black' : 
                          s.color === 'text-emerald-500' ? 'group-hover:bg-emerald-500 group-hover:text-black' : 
                          s.color === 'text-error' ? 'group-hover:bg-error group-hover:text-black' : 
                          'group-hover:bg-white group-hover:text-black'}`}>
                        {s.icon}
                      </div>
                      <div className="text-right hidden sm:block">
                         <p className="text-[7px] font-heading tracking-[0.4em] text-muted uppercase opacity-40">CH_{i.toString().padStart(2, '0')}</p>
                         <p className="text-[8px] font-heading tracking-widest text-accent uppercase font-black">{s.desc}</p>
                      </div>
                   </div>
                   <div className="space-y-0.5 sm:space-y-1">
                      <p className="text-[7px] sm:text-[9px] font-heading tracking-[0.3em] text-muted/60 uppercase">{s.label}</p>
                      <h3 className={`text-lg sm:text-4xl font-heading font-black tracking-tighter ${s.color}`}>
                         {typeof s.val === 'number' ? s.val.toString().padStart(2, '0') : s.val}
                      </h3>
                   </div>
                   <div className="flex gap-1 mt-3 sm:mt-6">
                     {[...Array(8)].map((_, b) => (
                       <div key={b} className={`h-0.5 sm:h-1 flex-1 transition-all duration-700 ${b <= 5 ? s.color.replace('text-', 'bg-') : 'bg-white/5'}`}></div>
                     ))}
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. SEARCH RESULTS LIST */}
      {query.length > 0 && (
        <div className="relative z-10 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="flex items-center gap-4 border-b border-white/10 pb-4">
             <Terminal size={16} className="text-accent" />
             <h3 className="font-heading text-xs tracking-[0.3em] uppercase text-white font-black">SCAN_RESULTS</h3>
          </div>
          
          <div className="space-y-2">
            {allResults.length > 0 ? allResults.map((res: any, idx) => (
              <Link 
                key={`${res.type}-${res.id || res.uid || idx}`} 
                to={res.link} 
                className="block group bg-black/40 border border-white/5 hover:border-accent transition-all duration-300"
                style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
              >
                <div className="p-4 sm:p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                    <div className="p-2 sm:p-3 bg-black border border-white/10 group-hover:border-accent/40 transition-colors">
                      {res.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <h4 className="font-heading text-[11px] sm:text-sm font-black uppercase text-white group-hover:text-accent duration-300 truncate">
                          {res.title || res.displayName || res.name || 'UNNAMED_NODE'}
                        </h4>
                        <span className="text-[7px] sm:text-[8px] font-heading px-2 py-0.5 border border-white/10 text-muted/40 uppercase tracking-widest">
                          {res.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-[7px] sm:text-[9px] font-heading text-muted/40 uppercase tracking-widest truncate">
                          ID: {res.id || res.uid || 'N/A'}
                        </p>
                        {res.serialNumber && (
                          <p className="text-[7px] sm:text-[9px] font-heading text-accent/60 uppercase tracking-widest flex items-center gap-1">
                            <Hash size={8} /> {res.serialNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted/20 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            )) : (
              <div className="py-20 text-center space-y-4">
                <Crosshair size={40} className="mx-auto text-muted/10" />
                <p className="text-[10px] sm:text-xs font-heading text-muted/20 uppercase tracking-[0.4em]">Zero_Matches_In_Distributed_Registry</p>
              </div>
            )}
          </div>
        </div>
      )}
      <style>{` @keyframes v-scan { 0% { top: -10%; opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.8; } 100% { top: 110%; opacity: 0; } } `}</style>
    </div>
  );
};

export default SearchPage;
