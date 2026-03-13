
import React, { useState, useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import { generateDocumentUrl, isPermissionActive } from '../lib/utils';
import { 
  FileText, 
  ChevronRight, 
  ChevronDown,
  Clock, 
  Eye, 
  Hash,
  Layers,
  Search,
  AlertTriangle,
  Bookmark,
  Maximize2,
  Database,
  ShieldAlert,
  Activity,
  LayoutGrid,
  List as ListIcon,
  Binary
} from 'lucide-react';

const PermissionViewPage: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const { categories, documents } = useDataStore();
  const { user, toggleBookmark } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [filterType, setFilterType] = useState<'ALL' | 'SAVED'>('ALL');

  const category = categories.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === categoryName);

  const categoryDocs = useMemo(() => {
    if (!category) return [];
    const searchLower = searchTerm.toLowerCase();
    return documents.filter(doc => {
      const matchesCategory = doc.categoryIds?.includes(category.id) || doc.categoryId === category.id;
      const matchesSearch = doc.title.toLowerCase().includes(searchLower) || 
                          doc.serialNumber?.toLowerCase().includes(searchLower) ||
                          doc.id.toLowerCase().includes(searchLower);
      const matchesFilter = filterType === 'ALL' ? true : user?.bookmarks?.includes(doc.id);
      return matchesCategory && matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [documents, category, searchTerm, filterType, user]);

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <AlertTriangle size={64} className="text-error animate-pulse" />
        <h2 className="text-2xl font-heading font-black uppercase tracking-widest">PERMISSION_NOT_FOUND</h2>
        <Link to="/dashboard" className="px-8 py-3 bg-white text-black font-heading text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-all">RETURN_TO_BASE</Link>
      </div>
    );
  }

  // Permission Check
  const hasPermission = user?.role === UserRole.ADMIN || 
                        user?.permissions?.allAccess || 
                        (user?.permissions?.categories?.includes(category.id) && 
                         isPermissionActive(user?.permissions?.categoryPermissions?.[category.id]));

  if (!hasPermission) {
    return <Navigate to="/dashboard" replace />;
  }

  const statItems = [
    { label: 'NODES', val: categoryDocs.length, color: 'text-white', icon: <Database size={16} className="shrink-0" />, desc: 'STORAGE' },
    { label: 'CLEARANCE', val: user?.permissions?.allAccess ? 'MAX' : 'L1', color: 'text-accent', icon: <ShieldAlert size={16} className="shrink-0" />, desc: 'AUTH' },
    { label: 'VAULT', val: user?.bookmarks?.length || 0, color: 'text-yellow-500', icon: <Bookmark size={16} className="shrink-0" />, desc: 'LINKS' },
    { label: 'SYNC', val: '100%', color: 'text-error', icon: <Activity size={16} className="shrink-0" />, desc: 'LINK_OK' },
  ];

  return (
    <div className="max-w-[1700px] mx-auto space-y-6 sm:space-y-10 animate-in fade-in duration-1000 pb-20 relative px-0.5 sm:px-4 select-none">
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 border-b border-white/5 pb-6 sm:pb-8">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-3 text-accent">
            <Layers size={14} className="animate-pulse shrink-0" />
            <p className="text-[8px] sm:text-[10px] font-heading tracking-[0.5em] uppercase font-black">KNOWLEDGE_BASE // {category.id.toUpperCase()}</p>
          </div>
          <h2 className="text-2xl sm:text-5xl font-heading font-black tracking-tighter text-white uppercase leading-none">{category.name}</h2>
        </div>
        
        <div className="hidden md:block">
          <div className="flex items-center gap-4 bg-white/5 px-6 py-2 border border-white/5">
             <Clock size={14} className="text-accent" />
             <p className="text-[10px] font-heading text-muted uppercase tracking-[0.4em]">UPLINK: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Stat Boxes */}
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

      {/* Search Bar */}
      <div className="relative z-10 flex flex-col md:flex-row gap-2 sm:gap-4 md:items-stretch">
        <div className="relative group bg-black/60 border border-white/5 p-1.5 sm:p-2 backdrop-blur-xl md:flex-[1.5]">
           <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" />
           <input 
             value={searchTerm} 
             onChange={e => setSearchTerm(e.target.value)} 
             placeholder="SEARCH..." 
             className="w-full bg-surface/40 px-12 py-3 sm:px-16 sm:py-5 text-[10px] sm:text-[11px] font-heading tracking-[0.3em] uppercase outline-none focus:border-accent transition-colors duration-300 placeholder:text-muted/10" 
           />
        </div>

        <div className="flex gap-2 bg-black/60 border border-white/5 p-1.5 sm:p-2 backdrop-blur-xl md:flex-1 items-stretch">
          <div className="flex-1 flex items-center bg-surface/40 px-2 sm:px-6 gap-2 sm:gap-3 py-2.5 sm:py-0 relative">
            <Binary size={14} className="text-accent/40 shrink-0" />
            <select 
              className="w-full bg-transparent text-[8px] sm:text-[10px] font-heading tracking-[0.1em] sm:tracking-[0.2em] uppercase outline-none cursor-pointer text-white/60 focus:text-accent min-w-0 appearance-none pr-8"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'ALL' | 'SAVED')}
            >
              <option value="ALL" className="bg-black text-white">GLOBAL</option>
              <option value="SAVED" className="bg-black text-white">VAULT</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          </div>

          <div className="flex gap-1 shrink-0">
            <button 
              onClick={() => setViewMode('GRID')}
              className={`w-12 sm:w-16 transition-all flex items-center justify-center ${viewMode === 'GRID' ? 'bg-surface/40 text-accent' : 'bg-surface/40 text-muted hover:text-white'}`}
            >
              <LayoutGrid size={16} className="sm:size-[18px] drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" />
            </button>
            <button 
              onClick={() => setViewMode('LIST')}
              className={`w-12 sm:w-16 transition-all flex items-center justify-center ${viewMode === 'LIST' ? 'bg-surface/40 text-accent' : 'bg-surface/40 text-muted hover:text-white'}`}
            >
              <ListIcon size={16} className="sm:size-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {categoryDocs.length > 0 ? (
        <div className={`relative z-10 grid ${viewMode === 'GRID' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
          {categoryDocs.map((doc) => {
            const isSaved = user?.bookmarks?.includes(doc.id);
            
            if (viewMode === 'LIST') {
              return (
                <div key={doc.id} className="group relative bg-black/40 border-b border-white/5 hover:bg-white/5 transition-all">
                   <div className="flex items-center gap-4 p-3 h-16 sm:h-20">
                      <div className="w-20 h-full sm:w-32 shrink-0 bg-zinc-900 border border-white/10 overflow-hidden">
                          {doc.thumbnail ? (
                            <img src={doc.thumbnail || undefined} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-all" alt="" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted/10">
                              <FileText size={24} />
                            </div>
                          )}
                      </div>
                      
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                          <h4 className="font-heading text-xs sm:text-sm font-bold text-white truncate group-hover:text-accent">{doc.title}</h4>
                          <span className="shrink-0 text-[9px] text-muted/40 font-heading uppercase tracking-wider border border-white/5 px-2 py-1 rounded hidden sm:block">{category.name}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                          <button 
                              type="button"
                              onClick={(e) => { 
                                e.preventDefault(); 
                                e.stopPropagation();
                                toggleBookmark(doc.id); 
                              }} 
                              className={`w-10 h-10 flex items-center justify-center border transition-all ${isSaved ? 'bg-accent text-black border-accent' : 'bg-transparent border-white/10 text-muted hover:text-white'}`}
                          >
                              <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
                          </button>
                          <Link to={generateDocumentUrl(doc)} className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-heading text-white/60 hover:bg-accent hover:text-black transition-all">
                              <Maximize2 size={14} />
                          </Link>
                      </div>
                   </div>
                </div>
              );
            }

            return (
              <div key={doc.id} className="relative group bg-black border border-white/10 p-px transition-all duration-500 hover:border-accent hover:-translate-y-1" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)' }}>
                <div className="bg-surface/40 flex flex-col h-full relative group-hover:bg-surface/60">
                  <button 
                    type="button"
                    onClick={(e) => { 
                      e.preventDefault(); 
                      e.stopPropagation();
                      toggleBookmark(doc.id); 
                    }} 
                    className={`absolute top-4 right-4 z-20 p-2 border transition-all ${isSaved ? 'bg-accent text-black border-accent' : 'bg-black/60 border-white/10 text-white/40'}`}
                  >
                    <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
                  </button>
                  <div className="relative aspect-video overflow-hidden border-b border-white/5 bg-zinc-950">
                    {doc.thumbnail ? (
                      <img 
                        src={doc.thumbnail || undefined} 
                        className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" 
                        alt={doc.title} 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted/10">
                        <FileText size={48} />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-black/80 border border-accent/20 px-3 py-1 text-[8px] font-heading text-accent uppercase font-black tracking-widest">
                      {doc.serialNumber || `SN: DOC-${doc.id.toUpperCase().slice(0, 6)}`}
                    </div>
                  </div>
                  <div className="p-8 space-y-6 flex-1 flex flex-col">
                    <h4 className="font-heading text-lg font-black uppercase text-white truncate group-hover:text-accent duration-500">{doc.title}</h4>
                    <p className="text-[9px] font-heading text-muted uppercase tracking-[0.2em] font-black opacity-40 mt-auto">
                      {category.name}
                    </p>
                  </div>
                  <Link 
                    to={generateDocumentUrl(doc)} 
                    className="w-full py-5 bg-white/5 border-t border-white/5 text-[10px] font-heading font-black text-white/60 uppercase tracking-[0.4em] hover:bg-accent hover:text-black transition-all flex items-center justify-center gap-2"
                  >
                    VIEW <Maximize2 size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="relative z-10 bg-white/5 border border-dashed border-white/10 p-20 text-center space-y-6">
          <Search size={48} className="mx-auto text-muted/20" />
          <div className="space-y-2">
            <h3 className="text-xl font-heading font-black text-white uppercase tracking-widest">NO_ASSETS_FOUND</h3>
            <p className="text-muted text-[10px] font-heading uppercase tracking-[0.3em]">This knowledge sector is currently empty.</p>
          </div>
        </div>
      )}
      <style>{` @keyframes v-scan { 0% { top: -10%; opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.8; } 100% { top: 110%; opacity: 0; } } `}</style>
    </div>
  );
};

export default PermissionViewPage;
