
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDataStore } from '../store/dataStore';
import ConfirmDialog from '../components/ConfirmDialog';
import { Link, useNavigate } from 'react-router-dom';
import { generateDocumentUrl } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Download, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Search,
  Database,
  Wifi,
  Activity,
  FileText,
  Binary,
  Layers,
  ShieldAlert,
  Cpu,
  Target,
  Maximize2,
  X,
  AlertTriangle,
  ExternalLink,
  Bookmark,
  LayoutGrid,
  List as ListIcon,
  ChevronDown
} from 'lucide-react';

const DocumentManager: React.FC = () => {
  const { documents, categories, deleteDocument, updateDocument } = useDataStore();
  const { user, toggleBookmark } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'ALL' | 'SAVED'>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const navigate = useNavigate();

  const getCategoryName = (id?: string) => {
    if (!id) return 'NAMESPACE_NULL';
    return categories.find(c => c.id === id)?.name || 'NAMESPACE_NULL';
  };
  
  const getDocCategoryName = (doc: any) => {
    const ids = doc.categoryIds || (doc.categoryId ? [doc.categoryId] : []);
    if (ids.length === 0) return 'GENERAL';
    const firstCat = categories.find(c => c.id === ids[0])?.name || 'GENERAL';
    return ids.length > 1 ? `${firstCat}+` : firstCat;
  };
  const confirmDelete = () => {
    if (deleteTarget) {
      deleteDocument(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const toggleStatus = (id: string, current: string) => { 
    updateDocument(id, { status: current === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' }); 
  };

  const filteredDocs = documents.filter(doc => {
    const docCategoryIds = doc.categoryIds || (doc.categoryId ? [doc.categoryId] : []);
    let matchesCategory = true;
    if (selectedCategory === 'SAVED') { matchesCategory = user?.bookmarks?.includes(doc.id) || false; } 
    else if (selectedCategory !== 'ALL') { matchesCategory = docCategoryIds.includes(selectedCategory); }
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = doc.title.toLowerCase().includes(searchLower) || doc.id.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  const stats = { 
    total: documents.length, 
    published: documents.filter(d => d.status === 'PUBLISHED').length, 
    drafts: documents.filter(d => d.status === 'DRAFT').length, 
    totalViews: documents.reduce((acc, d) => acc + d.viewCount, 0) 
  };

  const statItems = [
    { label: 'DOCUMENTS', val: stats.total, color: 'text-white', icon: <Database size={16}/>, desc: 'STORAGE' },
    { label: 'PUBLISHED', val: stats.published, color: 'text-accent', icon: <Wifi size={16}/>, desc: 'LIVE' },
    { label: 'DRAFTS', val: stats.drafts, color: 'text-yellow-500', icon: <Activity size={16}/>, desc: 'DRAFT' },
    { label: 'VIEWS', val: stats.totalViews > 999 ? (stats.totalViews/1000).toFixed(1) + 'K' : stats.totalViews, color: 'text-error', icon: <Eye size={16}/>, desc: 'SYNC' },
  ];

  return (
    <div className="max-w-[1700px] mx-auto space-y-10 animate-in fade-in duration-1000 pb-20 relative px-0.5 sm:px-4 select-none">
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-accent">
            <FileText size={16} className="animate-pulse" />
            <p className="text-[10px] font-heading tracking-[0.5em] uppercase font-black">REGISTRY</p>
          </div>
          <h2 className="text-2xl sm:text-5xl font-heading font-black tracking-tighter text-white uppercase leading-none">DOCUMENTS</h2>
        </div>

        <button 
          onClick={() => navigate('/documents/new')} 
          className="hidden md:flex w-full md:w-auto bg-white text-black px-8 py-4 text-[10px] font-heading font-black tracking-[0.2em] uppercase hover:bg-accent transition-all items-center justify-center gap-3 active:scale-95 shadow-glow-sm" 
          style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
        >
          <Plus size={18} /> NEW_DOCUMENT
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
                     <p className="text-[7px] font-heading tracking-[0.4em] text-muted uppercase opacity-40">DOC_{i.toString().padStart(2, '0')}</p>
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

      <div className="relative z-10 flex flex-col md:flex-row gap-2 sm:gap-4 md:items-stretch">
        <div className="relative group bg-black/60 border border-white/5 p-1.5 sm:p-2 backdrop-blur-xl md:flex-[1.5]">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" />
          <input 
            placeholder="SEARCH..." 
            className="w-full bg-surface/40 px-12 py-3 sm:px-16 sm:py-5 text-[10px] sm:text-[11px] font-heading tracking-[0.3em] uppercase outline-none focus:border-accent transition-colors duration-300 placeholder:text-muted/10" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="md:hidden relative z-10">
          <button 
            onClick={() => navigate('/documents/new')} 
            className="w-full bg-white text-black py-4 text-[10px] font-heading font-black tracking-[0.2em] uppercase hover:bg-accent transition-all flex items-center justify-center gap-3 active:scale-95 shadow-glow-sm" 
            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
          >
            <Plus size={18} /> NEW_DOCUMENT
          </button>
        </div>
        
        <div className="flex gap-2 bg-black/60 border border-white/5 p-1.5 sm:p-2 backdrop-blur-xl md:flex-1 items-stretch">
          <div className="flex-1 flex items-center bg-surface/40 px-2 sm:px-6 gap-2 sm:gap-3 py-2.5 sm:py-0 relative">
            <Binary size={14} className="text-accent/40 shrink-0" />
            <select 
              className="w-full bg-transparent text-[8px] sm:text-[10px] font-heading tracking-[0.1em] sm:tracking-[0.2em] uppercase outline-none cursor-pointer text-white/60 focus:text-accent min-w-0 appearance-none pr-8"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL" className="bg-black text-white">GLOBAL</option>
              <option value="SAVED" className="bg-black text-white">VAULT</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id} className="bg-black text-white">{cat.name.toUpperCase()}</option>
              ))}
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



      <div className={`relative z-10 grid ${viewMode === 'GRID' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
        {filteredDocs.map(doc => {
          if (viewMode === 'LIST') {
            return (
              <div key={doc.id} className="group relative bg-black/40 border-b border-white/5 hover:bg-white/5 transition-all">
                 <div className="flex items-center gap-4 p-3 h-16 sm:h-20">
                    <div className="w-20 h-full sm:w-32 shrink-0 bg-zinc-900 border border-white/10 overflow-hidden">
                        <img src={doc.thumbnail || undefined} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-all" alt="" />
                    </div>
                    
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                        <h4 className="font-heading text-xs sm:text-sm font-bold text-white truncate group-hover:text-accent">{doc.title}</h4>
                        <span className="shrink-0 text-[9px] text-muted/40 font-heading uppercase tracking-wider border border-white/5 px-2 py-1 rounded hidden sm:block">{getDocCategoryName(doc)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                         <Link 
                           to={generateDocumentUrl(doc)} 
                           title="Public View" 
                           className="w-10 h-10 bg-white/5 border border-white/10 text-muted/40 hover:text-accent hover:border-accent/40 flex items-center justify-center transition-all square-button"
                         >
                           <Eye size={14} />
                         </Link>
                         <Link 
                           to={`/documents/edit/${doc.id}`} 
                           title="Edit Protocol" 
                           className="w-10 h-10 bg-white/5 border border-white/10 text-muted/40 hover:text-accent hover:border-accent/40 flex items-center justify-center transition-all square-button"
                         >
                           <Edit3 size={14} />
                         </Link>
                         <button 
                           onClick={() => toggleStatus(doc.id, doc.status)} 
                           title="Toggle Status" 
                           className={`w-10 h-10 border transition-all flex items-center justify-center square-button ${
                             doc.status === 'PUBLISHED' 
                               ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500/60 hover:bg-emerald-500 hover:text-white hover:border-emerald-500' 
                               : 'bg-yellow-500/5 border-yellow-500/10 text-yellow-500/60 hover:bg-yellow-500 hover:text-black hover:border-yellow-500'
                           }`}
                         >
                           {doc.status === 'PUBLISHED' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                         </button>
                         <button 
                           onClick={() => setDeleteTarget(doc.id)} 
                           title="Purge Data" 
                           className="w-10 h-10 bg-error/5 border border-error/20 text-error/60 hover:bg-error hover:text-white hover:border-error flex items-center justify-center transition-all square-button"
                         >
                           <Trash2 size={14} />
                         </button>
                    </div>
                 </div>
              </div>
            );
          }

          return (
          <div key={doc.id} className={`relative group bg-black border p-px transition-all duration-500 hover:-translate-y-1 ${doc.status === 'PUBLISHED' ? 'border-accent/10 hover:border-accent' : 'border-yellow-500/10 hover:border-yellow-500'}`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)' }}>
            <div className="bg-surface/40 flex flex-col h-full relative overflow-hidden group-hover:bg-surface/60">
              <button 
                type="button"
                onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation();
                  toggleBookmark(doc.id); 
                }} 
                className={`absolute top-4 right-4 z-20 p-2 border transition-all ${user?.bookmarks?.includes(doc.id) ? 'bg-accent text-black border-accent' : 'bg-black/60 border-white/10 text-white/40'}`}
              >
                <Bookmark size={14} fill={user?.bookmarks?.includes(doc.id) ? "currentColor" : "none"} />
              </button>
              {/* Clickable Thumbnail to Public View */}
              <div 
                onClick={() => navigate(generateDocumentUrl(doc))}
                className="relative aspect-video overflow-hidden border-b border-white/5 bg-zinc-950 cursor-pointer"
              >
                 <img src={doc.thumbnail || undefined} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" alt="Asset" />
                 <div className="absolute top-4 left-4 bg-black/80 border border-accent/20 px-3 py-1 text-[8px] font-heading text-accent uppercase font-black tracking-widest">
                   {doc.serialNumber || `SN: DOC-${doc.id.toUpperCase().slice(0, 6)}`}
                 </div>
                 <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-500">
                    <div className="p-3 bg-black border border-accent text-accent animate-in zoom-in duration-300">
                       <ExternalLink size={20} />
                    </div>
                 </div>
              </div>
              
              <div className="p-8 space-y-6 flex-1 flex flex-col">
                <div className="space-y-1">
                   <h4 className="font-heading text-lg font-black uppercase text-white tracking-tighter truncate group-hover:text-accent duration-500">{doc.title}</h4>
                   <p className="text-[9px] font-heading text-muted uppercase tracking-[0.2em] font-black opacity-40">{getDocCategoryName(doc)}</p>
                </div>
                <div className="flex justify-between pt-4 border-t border-white/5 mt-auto">
                   <div className="flex items-center gap-2 text-[9px] font-heading text-muted/40 uppercase"><Eye size={12} /> {doc.viewCount}</div>
                   <div className="flex items-center gap-2 text-[9px] font-heading text-muted/40 uppercase"><Download size={12} /> {doc.downloadCount}</div>
                </div>
              </div>
                            {/* Actions Flex Updated to match SubscriptionManagement style and prevent overflow */}
              <div className="flex items-center gap-1.5 p-3 bg-black/40 justify-start">
                 <Link 
                   to={generateDocumentUrl(doc)} 
                   title="Public View" 
                   className="w-9 h-9 bg-white/5 border border-white/10 text-muted/40 hover:text-accent hover:border-accent/40 flex items-center justify-center transition-all square-button"
                 >
                   <Eye size={14} />
                 </Link>
                 <Link 
                   to={`/documents/edit/${doc.id}`} 
                   title="Edit Protocol" 
                   className="w-9 h-9 bg-white/5 border border-white/10 text-muted/40 hover:text-accent hover:border-accent/40 flex items-center justify-center transition-all square-button"
                 >
                   <Edit3 size={14} />
                 </Link>
                 <button 
                   onClick={() => toggleStatus(doc.id, doc.status)} 
                   title="Toggle Status" 
                   className={`w-9 h-9 border transition-all flex items-center justify-center square-button ${
                     doc.status === 'PUBLISHED' 
                       ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500/60 hover:bg-emerald-500 hover:text-white hover:border-emerald-500' 
                       : 'bg-yellow-500/5 border-yellow-500/10 text-yellow-500/60 hover:bg-yellow-500 hover:text-black hover:border-yellow-500'
                   }`}
                 >
                   {doc.status === 'PUBLISHED' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                 </button>
                 <button 
                   onClick={() => setDeleteTarget(doc.id)} 
                   title="Purge Data" 
                   className="w-9 h-9 bg-error/5 border border-error/20 text-error/60 hover:bg-error hover:text-white hover:border-error flex items-center justify-center transition-all square-button"
                 >
                   <Trash2 size={14} />
                 </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      <ConfirmDialog 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="PURGE_WARNING"
        message="Are you certain you want to purge this knowledge asset permanently? This action cannot be reversed."
        confirmLabel="DELETE"
      />

      <style>{` @keyframes v-scan { 0% { top: -10%; opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.8; } 100% { top: 110%; opacity: 0; } } `}</style>
    </div>
  );
};

export default DocumentManager;
