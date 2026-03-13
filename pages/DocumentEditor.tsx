
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import { useUIStore } from '../store/uiStore';
import { 
  Save, 
  Eye, 
  ChevronLeft,
  ChevronRight,
  Plus, 
  Trash2, 
  FileText,
  Cpu,
  Terminal,
  Layers,
  Target,
  Database,
  Binary,
  Loader2,
  CheckSquare,
  Square,
  Bookmark,
  Wifi,
  Maximize2,
  Eye as EyeIcon,
  Zap,
  Share2,
  Download,
  X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const DocumentEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { categories, documents, addDocument, updateDocument, currentAdminId } = useDataStore();
  const { addNotification } = useUIStore();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!id;
  const existingDoc = isEditing ? documents.find(d => d.id === id) : null;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [images, setImages] = useState<string[]>([]);
  const [files, setFiles] = useState<{ name: string; url: string; type: string }[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [activePreviewImage, setActivePreviewImage] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing && existingDoc) {
      setTitle(existingDoc.title);
      setContent(existingDoc.content);
      setSelectedCategoryIds(existingDoc.categoryIds || (existingDoc.categoryId ? [existingDoc.categoryId] : []));
      setStatus(existingDoc.status);
      setImages(existingDoc.images || []);
      setFiles(existingDoc.files || []);
    }
  }, [id, existingDoc]);

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width; let height = img.height;
        const maxDimension = 1600;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) { height = (height / width) * maxDimension; width = maxDimension; }
          else { width = (width / height) * maxDimension; height = maxDimension; }
        }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    for (const file of Array.from(selectedFiles) as File[]) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        if (type === 'image') {
          const compressed = await compressImage(base64);
          setImages(prev => [...prev, compressed]);
        } else {
          setFiles(prev => [...prev, { name: file.name, url: base64, type: file.type }]);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ''; 
  };

  const handleToggleCategory = (catId: string) => {
    setSelectedCategoryIds(prev => prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedCategoryIds.length === 0 || isSaving) return;
    setIsSaving(true);
    const docData = { title, content, categoryIds: selectedCategoryIds, categoryId: selectedCategoryIds[0], status, thumbnail: images[0] || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800', images, files, adminId: currentAdminId || 'admin-123' };
    try {
      if (isEditing) { await updateDocument(id!, docData); } else { await addDocument({ ...docData, viewCount: 0, downloadCount: 0 }); }
      addNotification('SUCCESS', 'COMPLETE', 'Node synced.');
      navigate('/documents');
    } catch (error: any) { addNotification('ERROR', 'FAILED', 'Sync error.'); setIsSaving(false); }
  };

  const getActiveCategoryName = () => {
    if (selectedCategoryIds.length === 0) return 'NAMESPACE_NULL';
    const cat = categories.find(c => c.id === selectedCategoryIds[0]);
    return cat ? cat.name : 'NAMESPACE_NULL';
  };

  const nextImage = () => {
    if (images.length > 0) setActivePreviewImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length > 0) setActivePreviewImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const PreviewSidebar = () => (
    <div className="space-y-4 lg:space-y-5 lg:sticky lg:top-12 animate-in slide-in-from-left-12 duration-700 w-full self-start">
      <div 
        className="w-full py-3 lg:py-4 px-6 bg-black/40 border border-white/10 flex items-center gap-4 group"
        style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
      >
         <ChevronLeft size={18} className="text-accent group-hover:-translate-x-1 transition-transform" />
         <span className="text-[9px] lg:text-[10px] font-heading font-black tracking-[0.3em] uppercase text-white">BACK</span>
      </div>

      <div 
        className="bg-black/60 border border-white/10 p-6 lg:p-7 relative overflow-hidden flex flex-col gap-5 lg:gap-6"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)' }}
      >
         <div className="flex items-center justify-between border-b border-white/5 pb-4 lg:pb-5">
            <h3 className="text-xs font-heading font-black tracking-[0.4em] uppercase flex items-center gap-3 text-white">
              <Database size={16} className="text-accent" /> COMMANDS
            </h3>
            <div className="bg-accent/10 border border-accent/20 px-2 py-0.5 text-[7px] font-heading text-accent uppercase font-black tracking-widest">
              PREVIEW
            </div>
         </div>
         
         <div className="flex flex-col gap-3">
            <div 
              className="w-full py-4 lg:py-5 px-6 border-2 font-heading text-[10px] lg:text-[11px] font-black tracking-[0.3em] uppercase transition-all flex items-center justify-between group bg-surface/40 border-white/10 text-white"
              style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
            >
              <span className="flex items-center gap-3">
                <Bookmark size={16} /> SAVE
              </span>
            </div>

             <div className="w-full py-4 lg:py-5 px-6 bg-white text-black font-heading text-[10px] lg:text-[11px] font-black tracking-[0.4em] uppercase flex items-center justify-between group"
                     style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}>
               <span className="flex items-center gap-3">
                 <Download size={16} /> DOWNLOAD
               </span>
             </div>

            <div 
              className="w-full py-4 lg:py-5 px-6 bg-surface/40 border border-white/10 text-white font-heading text-[10px] lg:text-[11px] font-black tracking-[0.4em] uppercase flex items-center justify-between group"
              style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
            >
              <span className="flex items-center gap-3">
                <Share2 size={16} /> SHARE
              </span>
            </div>
         </div>

         <div className="pt-4 lg:pt-6 space-y-3 lg:space-y-4">
            {[
              { l: 'SECTOR', v: getActiveCategoryName(), i: <Layers size={13}/> },
              { l: 'LINK', v: 'SECURE', i: <Wifi size={13}/> },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center group">
                 <span className="text-[8px] lg:text-[9px] font-heading text-muted uppercase tracking-[0.2em] font-black flex items-center gap-2">
                   <span className="text-accent/30">{item.i}</span> {item.l}
                 </span>
                 <span className="text-[9px] font-heading text-white uppercase tracking-tighter font-black truncate max-w-[100px] text-right">{item.v}</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1700px] mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-1000 pb-20 relative px-0.5 sm:px-4 select-none">
      <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 sm:gap-6 border-b border-white/5 pb-6 sm:pb-8">
        <div className="flex items-center gap-3 sm:gap-6 w-full">
          <button onClick={() => navigate('/documents')} className="p-3 sm:p-5 border border-white/10 bg-surface/40 hover:bg-white hover:text-black transition-all shrink-0" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)' }}><ChevronLeft size={20} /></button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-accent mb-1 sm:mb-2">
              <Cpu size={14} className="animate-pulse" />
              <p className="text-[8px] sm:text-[10px] font-heading tracking-[0.5em] uppercase font-black">INITIALIZATION</p>
            </div>
            <h2 className="text-2xl sm:text-5xl font-heading font-black tracking-tighter text-white uppercase leading-none">{isEditing ? 'EDIT_DOCUMENT' : 'NEW_DOCUMENT'}</h2>
          </div>
        </div>
        
        {/* BUTTON CONTAINER - UPDATED TO FLEX-ROW SIDE-BY-SIDE */}
        <div className="flex flex-row items-center gap-2 w-full xl:w-auto shrink-0">
          <button 
            onClick={() => setIsPreviewMode(!isPreviewMode)} 
            disabled={isSaving} 
            className={`flex-1 xl:flex-none flex items-center justify-center gap-2 sm:gap-4 px-3 sm:px-8 py-3 sm:py-5 border-2 font-heading text-[8px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] uppercase font-black transition-all ${isPreviewMode ? 'bg-accent text-black border-accent shadow-glow' : 'border-white/10 text-muted'}`} 
            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
          >
            <Eye size={14} className="shrink-0" /> <span className="truncate">{isPreviewMode ? 'EXIT' : 'PREVIEW'}</span>
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="flex-1 xl:flex-none xl:min-w-[140px] flex items-center justify-center gap-2 sm:gap-4 px-3 sm:px-12 py-3 sm:py-5 font-heading text-[8px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.6em] uppercase font-black bg-white text-black active:scale-95 shadow-glow-sm" 
            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
          >
            {isSaving ? <Loader2 size={14} className="animate-spin shrink-0" /> : <Save size={14} className="shrink-0" />} <span className="truncate">{isSaving ? 'SAVING' : 'SAVE'}</span>
          </button>
        </div>
      </div>

      <div className="relative z-10">
        {!isPreviewMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 min-h-[500px]">
            <div className="lg:col-span-8 flex flex-col space-y-6 bg-[#050505] border border-white/10 p-6 relative overflow-hidden shadow-2xl" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
              
              {/* Title Input */}
              <div className="space-y-2 group">
                <label className="flex items-center gap-2 text-[9px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                  <Target size={12} className="text-accent/40 group-focus-within:text-accent" />
                  Document Title
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="ENTER DOCUMENT TITLE" 
                    className="w-full bg-white/[0.02] border border-white/10 p-4 text-lg sm:text-xl font-heading font-bold tracking-tight text-white outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-muted/10 uppercase" 
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                  />
                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                </div>
              </div>

              {/* Content Input */}
              <div className="flex-1 flex flex-col space-y-2 group h-full">
                <label className="flex items-center gap-2 text-[9px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                  <Terminal size={12} className="text-accent/40 group-focus-within:text-accent" />
                  Content Body
                </label>
                <div className="relative flex-1 flex flex-col">
                  <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500 pointer-events-none"></div>
                  <textarea 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)} 
                    placeholder="ENTER MARKDOWN CONTENT..." 
                    className="w-full flex-1 bg-white/[0.02] border border-white/10 p-4 sm:p-6 font-mono text-[11px] sm:text-[13px] leading-loose text-zinc-400 outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-muted/10 resize-none min-h-[400px]" 
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                  />
                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#050505] border border-white/10 p-6 space-y-8 relative overflow-hidden shadow-2xl" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
                
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <div className="p-1.5 bg-accent/10 border border-accent/20">
                    <Layers size={14} className="text-accent" />
                  </div>
                  <h3 className="font-heading text-[10px] tracking-[0.3em] uppercase font-black text-white">CONFIGURATION</h3>
                </div>

                <div className="space-y-6">
                  {/* Permissions */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[9px] font-heading text-muted/60 uppercase tracking-widest pl-1">
                      <Database size={12} className="text-accent/40" />
                      Permissions
                    </label>
                    <div className="bg-white/[0.02] border border-white/10 max-h-[200px] overflow-y-auto custom-scrollbar">
                      {categories.map(cat => {
                        const isSelected = selectedCategoryIds.includes(cat.id);
                        return (
                          <button 
                            key={cat.id} 
                            onClick={() => handleToggleCategory(cat.id)} 
                            className={`w-full flex items-center justify-between p-3 border-b border-white/5 last:border-0 transition-all hover:bg-white/5 text-left group ${isSelected ? 'bg-accent/5' : ''}`}
                          >
                            <span className={`text-[9px] font-heading tracking-widest uppercase truncate transition-colors ${isSelected ? 'text-accent' : 'text-muted group-hover:text-white'}`}>
                              {cat.name}
                            </span>
                            {isSelected ? <CheckSquare size={12} className="text-accent" /> : <Square size={12} className="text-white/10 group-hover:text-white/30" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[9px] font-heading text-muted/60 uppercase tracking-widest pl-1">
                      <Zap size={12} className="text-accent/40" />
                      Status
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['DRAFT', 'PUBLISHED'].map(s => (
                        <button 
                          key={s} 
                          onClick={() => setStatus(s as any)} 
                          className={`py-3 font-heading text-[9px] tracking-[0.2em] font-black uppercase transition-all ${
                            status === s 
                              ? 'bg-accent text-black' 
                              : 'bg-white/5 text-muted/40 hover:bg-white/10 hover:text-white'
                          }`}
                          style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Images */}
                  <div className="space-y-3 pt-2 border-t border-white/5">
                    <label className="flex items-center gap-2 text-[9px] font-heading text-muted/60 uppercase tracking-widest pl-1">
                      <EyeIcon size={12} className="text-accent/40" />
                      Visual Assets
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {images.map((img, i) => (
                        <div key={i} className="relative aspect-square border border-white/10 group overflow-hidden bg-black/40">
                          <img src={img || undefined} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" alt="Asset" />
                          <button 
                            onClick={() => setImages(images.filter((_, idx) => idx !== i))} 
                            className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-error transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => imageInputRef.current?.click()} 
                        className="aspect-square border border-dashed border-white/10 flex flex-col items-center justify-center text-muted/20 hover:text-accent hover:border-accent/40 hover:bg-accent/5 transition-all group"
                      >
                        <Plus size={18} className="group-hover:scale-110 transition-transform" />
                      </button>
                      <input type="file" ref={imageInputRef} className="hidden" accept="image/*" multiple onChange={(e) => onFileSelect(e, 'image')} />
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PREVIEW MODE - REPLICATING DOCUMENT VIEWER EXACTLY */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-700">
            
            {/* Command Sidebar for Desktop (Mocked) */}
            <div className="order-last lg:order-none lg:col-span-4 xl:col-span-3">
              <PreviewSidebar />
            </div>

            {/* Main Content Area */}
            <div className="order-first lg:order-none lg:col-span-8 xl:col-span-9 animate-in slide-in-from-right-12 duration-700">
              <div 
                className="bg-black/60 border border-white/10 relative overflow-hidden shadow-2xl"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }}
              >
                <div className="bg-zinc-950 p-5 lg:pt-10 lg:px-14 lg:pb-14 flex flex-col space-y-4 lg:space-y-8 relative z-10">
                   {/* HEADER SECTOR */}
                   <div className="flex items-start sm:items-center justify-between border-b border-white/5 pb-4 lg:pb-6 relative">
                      <div className="flex items-start sm:items-center gap-4 lg:gap-8 mt-2">
                      <div className="min-w-0">
                           <div className="flex items-center gap-2 sm:gap-3">
                             <div className="w-1.5 h-1.5 bg-accent animate-pulse shrink-0"></div>
                             <span className="text-[8px] sm:text-[9px] lg:text-[11px] font-heading text-accent tracking-[0.4em] sm:tracking-[0.5em] uppercase font-black truncate">{getActiveCategoryName()}</span>
                           </div>
                           <h2 className="text-lg lg:text-3xl font-heading font-black tracking-tighter text-white uppercase mt-1 break-words">{title || 'UNTITLED'}</h2>
                        </div>
                      </div>
                   </div>

                   {/* ASSET VIEWER (IMAGES) */}
                   {images && images.length > 0 && (
                     <div className="space-y-4">
                        <div className="relative aspect-video bg-black border border-white/10 overflow-hidden group cursor-pointer" onClick={() => {
                          const modal = document.getElementById('preview-modal');
                          if (modal) modal.style.display = 'flex';
                        }}>
                           <img 
                            src={images[activePreviewImage] || undefined} 
                            className="w-full h-full object-cover grayscale lg:group-hover:grayscale-0 transition-all duration-1000 lg:group-hover:scale-105" 
                            alt="Projected Asset"
                           />
                           
                           <div className="hidden lg:flex absolute inset-0 items-center justify-between px-6 pointer-events-none">
                              {images.length > 1 && (
                                <>
                                  <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="p-4 bg-black/60 border border-white/10 text-white hover:bg-accent hover:text-black transition-all pointer-events-auto">
                                    <ChevronLeft size={24} />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="p-4 bg-black/60 border border-white/10 text-white hover:bg-accent hover:text-black transition-all pointer-events-auto">
                                    <ChevronRight size={24} />
                                  </button>
                                </>
                              )}
                           </div>

                           <div className="absolute top-4 left-4 bg-black/80 border border-accent/40 px-3 py-1 text-[8px] lg:text-[10px] font-heading text-accent uppercase font-black tracking-widest flex items-center gap-2">
                              <Maximize2 size={10} /> {activePreviewImage + 1}/{images.length}
                           </div>
                        </div>

                        {images.length > 1 && (
                          <div className="lg:hidden flex items-center justify-between bg-black/40 border border-white/5 p-1">
                             <button onClick={() => prevImage()} className="flex-1 py-2.5 flex items-center justify-center border-r border-white/5 text-muted active:text-accent active:bg-accent/10 transition-colors">
                               <ChevronLeft size={16} />
                             </button>
                             <div className="px-5 text-[9px] font-heading font-black text-white/40 tracking-widest">
                               {activePreviewImage + 1} / {images.length}
                             </div>
                             <button onClick={() => nextImage()} className="flex-1 py-2.5 flex items-center justify-center border-l border-white/5 text-muted active:text-accent active:bg-accent/10 transition-colors">
                               <ChevronRight size={16} />
                             </button>
                          </div>
                        )}
                     </div>
                   )}

                   {/* TEXT CONTENT */}
                   <div className="prose prose-invert max-w-none font-body text-zinc-400 leading-relaxed">
                     <div className="bg-white/[0.01] p-4 lg:pt-8 lg:px-12 lg:pb-12 border border-white/5 shadow-inner text-[10.5px] sm:text-[11.5px] lg:text-[16px] markdown-body">
                       <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "--- EMPTY ---"}</ReactMarkdown>
                     </div>
                   </div>

                   <div className="pt-4 lg:pt-8 border-t border-white/5 flex flex-wrap justify-between items-center gap-4 opacity-40">
                      <div className="flex items-center gap-4 text-[8px] lg:text-[11px] font-heading text-muted uppercase tracking-[0.2em] font-black">
                         <span className="flex items-center gap-2"><EyeIcon size={12} /> 0 VIEWS</span>
                         <span className="flex items-center gap-2 truncate"><Zap size={12} /> {new Date().toLocaleDateString()}</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
            
            {/* PREVIEW MODAL */}
            {createPortal(
              <div 
                id="preview-modal"
                className="fixed inset-0 z-[9999] bg-black/70 hidden items-center justify-center p-4 lg:p-12 animate-in fade-in duration-700 backdrop-blur-[20px]"
                onClick={() => {
                  const modal = document.getElementById('preview-modal');
                  if (modal) modal.style.display = 'none';
                }}
              >
                 <div className="relative flex flex-col items-center justify-center max-w-7xl w-full h-full pointer-events-none">
                   
                   <div 
                     className="relative w-fit h-fit border border-accent/40 p-1 bg-zinc-950 shadow-2xl animate-in zoom-in duration-300 pointer-events-auto"
                     style={{ clipPath: 'polygon(0 30px, 30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)' }}
                     onClick={e => e.stopPropagation()}
                   >
                      <button 
                        onClick={() => {
                          const modal = document.getElementById('preview-modal');
                          if (modal) modal.style.display = 'none';
                        }} 
                        className="absolute sm:top-10 sm:right-10 top-4 right-4 text-muted hover:text-white transition-all hover:scale-125 z-[110]"
                      >
                        <X size={32} className="sm:size-[44px] shrink-0" />
                      </button>

                      <div className="relative border border-white/5 bg-black overflow-hidden flex items-center justify-center">
                        <img src={images[activePreviewImage] || undefined} className="max-w-full max-h-[70vh] lg:max-h-[85vh] object-contain transition-all duration-700" alt="Identity Scan" />
                        
                        {images.length > 1 && (
                          <>
                            <button 
                              onClick={(e) => { e.stopPropagation(); prevImage(); }}
                              className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 p-6 bg-black/80 border border-white/10 text-white hover:bg-white hover:text-black transition-all z-20"
                            >
                              <ChevronLeft size={32} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); nextImage(); }}
                              className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 p-6 bg-black/80 border border-white/10 text-white hover:bg-white hover:text-black transition-all z-20"
                            >
                              <ChevronRight size={32} />
                            </button>
                          </>
                        )}

                        <div className="absolute top-4 left-4 sm:top-10 sm:left-10 space-y-1 sm:space-y-2 pointer-events-none">
                           <p className="text-accent font-heading text-[8px] sm:text-[12px] tracking-[0.2em] sm:tracking-[0.6em] uppercase font-black">ANALYSIS</p>
                           <div className="flex gap-0.5 sm:gap-1 h-0.5 sm:h-1">
                              {[...Array(12)].map((_, i) => <div key={i} className="w-1 sm:w-2 bg-accent animate-pulse" style={{ animationDelay: `${i*100}ms` }}></div>)}
                           </div>
                        </div>

                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent/60 shadow-glow animate-[v-scan_4s_linear_infinite]"></div>
                      </div>
                   </div>
                 </div>
              </div>,
              document.body
            )}

          </div>
        )}
      </div>
      <style>{` @keyframes v-scan { 0% { top: -10%; opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.8; } 100% { top: 110%; opacity: 0; } } `}</style>
    </div>
  );
};

export default DocumentEditor;
