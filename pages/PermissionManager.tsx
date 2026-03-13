
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDataStore } from '../store/dataStore';
import ConfirmDialog from '../components/ConfirmDialog';
import { 
  FolderTree, 
  Plus, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  Hash, 
  Layers, 
  X, 
  ShieldAlert, 
  Terminal, 
  Target, 
  Cpu,
  Database,
  Activity,
  Wifi,
  Search,
  Binary,
  Globe,
  Zap,
  Cloud,
  Code,
  FileText,
  TrendingUp,
  Users,
  Settings,
  History,
  AlertTriangle,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';

const PermissionManager: React.FC = () => {
  const { categories, addCategory, deleteCategory, updateCategory } = useDataStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Layers');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

  React.useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) mainContent.scrollTo(0, 0);
  }, [showForm]);

  const resetForm = () => { setName(''); setDescription(''); setIcon('Layers'); setEditingId(null); setShowForm(false); };
  const handleEdit = (cat: any) => { setName(cat.name); setDescription(cat.description); setIcon(cat.icon || 'Layers'); setEditingId(cat.id); setShowForm(true); };
  
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;
    if (editingId) { updateCategory(editingId, { name, description, icon }); } else { addCategory({ name, description, icon, status: 'ACTIVE' }); }
    resetForm();
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteCategory(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const filteredCategories = categories
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortOrder === 'NEWEST' ? dateB - dateA : dateA - dateB;
    });
  const stats = { total: categories.length, active: categories.filter(c => c.status === 'ACTIVE').length, nodes: 42 };

  const statItems = [
    { label: 'PERMISSIONS', val: stats.total, color: 'text-white', icon: <Layers size={16}/>, desc: 'NODES' },
    { label: 'ACTIVE', val: stats.active, color: 'text-accent', icon: <Wifi size={16}/>, desc: 'ACTIVE' },
    { label: 'CONNECTIONS', val: stats.nodes, color: 'text-yellow-500', icon: <Activity size={16}/>, desc: 'LINKS' },
    { label: 'CLEARANCE', val: 'MAX', color: 'text-error', icon: <ShieldAlert size={16}/>, desc: 'ROOT' },
  ];

  const availableIcons = [
    { name: 'Layers', icon: <Layers size={18} /> },
    { name: 'Cpu', icon: <Cpu size={18} /> },
    { name: 'Database', icon: <Database size={18} /> },
    { name: 'Activity', icon: <Activity size={18} /> },
    { name: 'Wifi', icon: <Wifi size={18} /> },
    { name: 'Binary', icon: <Binary size={18} /> },
    { name: 'Globe', icon: <Globe size={18} /> },
    { name: 'Terminal', icon: <Terminal size={18} /> },
    { name: 'Target', icon: <Target size={18} /> },
    { name: 'ShieldAlert', icon: <ShieldAlert size={18} /> },
    { name: 'FolderTree', icon: <FolderTree size={18} /> },
    { name: 'FileText', icon: <FileText size={18} /> },
    { name: 'TrendingUp', icon: <TrendingUp size={18} /> },
    { name: 'Zap', icon: <Zap size={18} /> },
    { name: 'Cloud', icon: <Cloud size={18} /> },
    { name: 'Code', icon: <Code size={18} /> },
    { name: 'Search', icon: <Search size={18} /> },
    { name: 'Users', icon: <Users size={18} /> },
    { name: 'Settings', icon: <Settings size={18} /> },
    { name: 'History', icon: <History size={18} /> },
  ];

  const getIconComponent = (iconName: string) => {
    const found = availableIcons.find(i => i.name === iconName);
    return found ? found.icon : <Layers size={18} />;
  };

  return (
    <div className="max-w-[1700px] mx-auto space-y-10 animate-in fade-in duration-1000 pb-20 relative px-0.5 sm:px-4 select-none">
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-accent">
            <FolderTree size={16} className="animate-pulse" />
            <p className="text-[10px] font-heading tracking-[0.5em] uppercase font-black">PERMISSIONS</p>
          </div>
          <h2 className="text-2xl sm:text-5xl font-heading font-black tracking-tighter text-white uppercase leading-none">PERMISSIONS</h2>
        </div>

        <button 
          onClick={() => setShowForm(true)} 
          className="hidden md:flex w-full md:w-auto bg-white text-black px-8 py-4 text-[10px] font-heading font-black tracking-[0.2em] uppercase hover:bg-accent transition-all items-center justify-center gap-3 active:scale-95 shadow-glow-sm" 
          style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
        >
          <Plus size={18} /> NEW_PERMISSION
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

      <div className="md:hidden relative z-10">
        <button 
          onClick={() => setShowForm(true)} 
          className="w-full bg-white text-black py-4 text-[10px] font-heading font-black tracking-[0.2em] uppercase hover:bg-accent transition-all flex items-center justify-center gap-3 active:scale-95 shadow-glow-sm" 
          style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
        >
          <Plus size={18} /> NEW_PERMISSION
        </button>
      </div>

      {/* OPTIMIZED FILTER CONTROLS FOR MOBILE & DESKTOP */}
      <div className="relative z-10 flex flex-col md:flex-row gap-2 sm:gap-4 md:items-stretch">
        {/* Search Bar */}
        <div className="relative group bg-black/60 border border-white/5 p-1.5 sm:p-2 backdrop-blur-xl md:flex-[1.5]">
           <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" />
           <input 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder="SEARCH..." 
              className="w-full bg-surface/40 px-12 py-3 sm:px-16 sm:py-5 text-[10px] sm:text-[11px] font-heading tracking-[0.3em] uppercase outline-none focus:border-accent transition-colors duration-300 placeholder:text-muted/10" 
           />
        </div>
        
        {/* Filter and View Toggle */}
        <div className="flex gap-2 bg-black/60 border border-white/5 p-1.5 sm:p-2 backdrop-blur-xl md:flex-1 items-stretch">
            <div className="flex-1 flex items-center bg-surface/40 px-2 sm:px-6 gap-2 sm:gap-3 py-2.5 sm:py-0">
               <Binary size={14} className="text-accent/40 shrink-0" />
               <select value={sortOrder} onChange={e => setSortOrder(e.target.value as any)} className="w-full bg-transparent text-[8px] sm:text-[10px] font-heading tracking-[0.1em] sm:tracking-[0.2em] uppercase outline-none cursor-pointer text-white/60 focus:text-accent min-w-0">
                 <option value="NEWEST">NEWEST PERMISSION</option>
                 <option value="OLDEST">OLDEST PERMISSION</option>
               </select>
            </div>
            <div className="flex gap-1 shrink-0">
               <button onClick={() => setViewMode('GRID')} className={`w-12 sm:w-16 transition-all flex items-center justify-center bg-surface/40 ${viewMode === 'GRID' ? 'text-accent' : 'text-muted hover:text-white'}`}><LayoutGrid size={16} className={`sm:size-[18px] ${viewMode === 'GRID' ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]' : ''}`}/></button>
               <button onClick={() => setViewMode('LIST')} className={`w-12 sm:w-16 transition-all flex items-center justify-center bg-surface/40 ${viewMode === 'LIST' ? 'text-accent' : 'text-muted hover:text-white'}`}><ListIcon size={16} className={`sm:size-[18px] ${viewMode === 'LIST' ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]' : ''}`}/></button>
            </div>
        </div>
      </div>

      {viewMode === 'GRID' ? (
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredCategories.map(cat => (
            <div key={cat.id} className="relative group bg-black border border-white/5 p-px transition-all duration-500 hover:border-accent hover:-translate-y-1" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)' }}>
              <div className="bg-surface/40 p-8 flex flex-col items-center text-center space-y-8 h-full relative group-hover:bg-surface/60 transition-colors">
                <div className="relative group/avatar">
                   <div className="w-32 h-32 p-1 bg-black border border-white/10 overflow-hidden group-hover:border-accent/40 duration-700">
                      <div className="w-full h-full bg-zinc-950 flex items-center justify-center relative">
                        {React.cloneElement(getIconComponent(cat.icon || 'Layers') as React.ReactElement<any>, { size: 48, className: "text-muted/10 group-hover:text-accent/20 transition-all duration-1000 scale-[2]" })}
                      </div>
                   </div>
                </div>
                <div className="space-y-2 w-full relative z-10">
                   <h4 className="font-heading text-lg font-black uppercase text-white truncate px-2">{cat.name}</h4>
                   <p className="text-[9px] font-heading text-muted uppercase tracking-[0.2em] opacity-40">SCT_ID: {cat.id.toUpperCase()}</p>
                   {cat.serialNumber && (
                     <p className="text-[8px] font-heading text-accent/60 uppercase tracking-widest mt-1">
                       {cat.serialNumber}
                     </p>
                   )}
                </div>
                <div className="w-full grid grid-cols-2 gap-2 pt-2 relative z-10">
                   <button onClick={() => handleEdit(cat)} className="py-4 bg-white/5 border border-white/5 text-[9px] font-heading font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black square-button">EDIT</button>
                   <button onClick={() => setDeleteTarget(cat.id)} className="py-4 bg-error/5 border border-error/20 text-[9px] font-heading font-black text-error uppercase tracking-[0.3em] hover:bg-error hover:text-white square-button">DELETE</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative z-10 bg-black/40 border border-white/5 overflow-hidden flex flex-col" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 98%, 98% 100%, 0 100%)' }}>
          <div className="bg-zinc-950 p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-accent animate-ping"></div>
              <h4 className="font-heading text-xs tracking-[0.4em] uppercase text-white font-black">PERMISSION_INDEX</h4>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-4 sm:px-8 py-3 sm:py-5 font-heading text-[8px] sm:text-[10px] text-muted tracking-[0.3em] uppercase">IDENTIFIER</th>
                  <th className="px-4 sm:px-8 py-3 sm:py-5 font-heading text-[8px] sm:text-[10px] text-muted tracking-[0.3em] uppercase">NAME</th>
                  <th className="hidden md:table-cell px-8 py-5 font-heading text-[10px] text-muted tracking-[0.3em] uppercase">DESCRIPTION</th>
                  <th className="px-4 sm:px-8 py-3 sm:py-5 font-heading text-[8px] sm:text-[10px] text-muted tracking-[0.3em] uppercase text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCategories.map(cat => (
                  <tr key={cat.id} className="group hover:bg-white/[0.03] transition-colors relative">
                    <td className="px-4 sm:px-8 py-3 sm:py-6 whitespace-nowrap relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 h-0 bg-accent group-hover:h-full transition-all"></div>
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="p-1.5 sm:p-2 bg-white/5 border border-white/10 text-muted group-hover:text-accent transition-colors">
                          {React.cloneElement(getIconComponent(cat.icon || 'Layers') as React.ReactElement<any>, { size: 14, className: "sm:size-[18px]" })}
                        </div>
                        <span className="font-heading text-[9px] sm:text-[11px] text-white/60 tracking-tighter uppercase">{cat.id.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-8 py-3 sm:py-6">
                      <span className="font-heading text-[10px] sm:text-[11px] font-black uppercase text-white tracking-widest">{cat.name}</span>
                    </td>
                    <td className="hidden md:table-cell px-8 py-6">
                      <p className="font-heading text-[10px] text-muted uppercase tracking-wider truncate max-w-xs">{cat.description || 'NO_DESCRIPTION_SET'}</p>
                    </td>
                    <td className="px-4 sm:px-8 py-3 sm:py-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                        <button onClick={() => handleEdit(cat)} className="w-7 h-7 sm:w-9 sm:h-9 bg-white/5 border border-white/10 text-muted/40 hover:text-white hover:border-white/40 flex items-center justify-center transition-all square-button"><Edit3 size={12} className="sm:size-[14px]" /></button>
                        <button onClick={() => setDeleteTarget(cat.id)} className="w-7 h-7 sm:w-9 sm:h-9 bg-error/5 border border-error/20 text-error/60 hover:bg-error hover:text-white flex items-center justify-center transition-all square-button"><Trash2 size={12} className="sm:size-[14px]" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
           <div className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity" onClick={resetForm}></div>
           <div className="w-[95%] max-w-md bg-[#050505] border border-white/10 relative shadow-2xl animate-in zoom-in-95 duration-300" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
              
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 border border-accent/20 relative">
                      <Layers size={16} className="text-accent" />
                      <div className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t border-l border-accent"></div>
                      <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b border-r border-accent"></div>
                    </div>
                    <div>
                      <h3 className="text-sm font-heading font-black uppercase tracking-widest text-white">{editingId ? 'EDIT_PROTOCOL' : 'NEW_PROTOCOL'}</h3>
                      <p className="text-[8px] font-heading text-accent/40 uppercase tracking-[0.2em]">Permission Management</p>
                    </div>
                 </div>
                 <button onClick={resetForm} className="text-muted/40 hover:text-white transition-colors">
                    <X size={18} />
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                 
                 {/* Name Input */}
                 <div className="space-y-2 group">
                    <label className="flex items-center gap-2 text-[9px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                      <Terminal size={12} className="text-accent/40 group-focus-within:text-accent" />
                      Permission Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                      <input 
                        required 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="ENTER PERMISSION NAME"
                        className="w-full bg-white/[0.02] border border-white/10 p-3 text-[10px] font-heading outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-muted/10 uppercase" 
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}
                      />
                      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                    </div>
                 </div>

                 {/* Icon Selector */}
                 <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[9px] font-heading text-muted/60 uppercase tracking-widest pl-1">
                      <Target size={12} className="text-accent/40" />
                      Icon Identifier
                    </label>
                    <div className="grid grid-cols-5 gap-2 p-3 bg-white/[0.02] border border-white/10">
                      {availableIcons.map(item => (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setIcon(item.name)}
                          className={`aspect-square flex items-center justify-center transition-all border ${icon === item.name ? 'bg-accent/10 border-accent text-accent' : 'bg-transparent border-transparent text-muted/40 hover:bg-white/5 hover:text-white'}`}
                        >
                          {React.cloneElement(item.icon as React.ReactElement<any>, { size: 16 })}
                        </button>
                      ))}
                    </div>
                 </div>

                 {/* Description Input */}
                 <div className="space-y-2 group">
                    <label className="flex items-center gap-2 text-[9px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                      <FileText size={12} className="text-accent/40 group-focus-within:text-accent" />
                      Description
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                      <textarea 
                        required 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        placeholder="ENTER DESCRIPTION"
                        className="w-full bg-white/[0.02] border border-white/10 p-3 text-[10px] font-heading outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-muted/10 uppercase h-24 resize-none leading-relaxed" 
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}
                      />
                      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                    </div>
                 </div>

                 {/* Submit Button */}
                 <button 
                   type="submit"
                   className="w-full py-4 bg-white text-black font-heading text-[10px] font-black tracking-[0.4em] uppercase hover:bg-accent hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-3 group mt-2" 
                   style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                 >
                   {editingId ? 'UPDATE_PROTOCOL' : 'INITIATE_PROTOCOL'}
                   <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                 </button>

              </form>
           </div>
        </div>,
        document.body
      )}

      <ConfirmDialog 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="SECTOR_DISSOLUTION"
        message="Confirm sector dissolution. This action will sever all knowledge node mappings within this namespace."
        confirmLabel="DELETE"
      />

      <style>{` @keyframes v-scan { 0% { top: -10%; opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.8; } 100% { top: 110%; opacity: 0; } } `}</style>
    </div>
  );
};

export default PermissionManager;
