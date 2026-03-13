
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { extractIdFromUrl, isPermissionActive } from '../lib/utils';
import { UserRole } from '../types';
import { 
  ChevronLeft, 
  ChevronRight,
  Download, 
  Bookmark, 
  X,
  Cpu,
  Terminal,
  Fingerprint,
  Layers,
  Database,
  Binary,
  Maximize2,
  Eye,
  Zap,
  Wifi,
  FileText,
  Share2,
  Hash,
  ShieldAlert
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const DocumentViewer: React.FC = () => {
  const { id: slug } = useParams();
  const id = extractIdFromUrl(slug || '');
  const navigate = useNavigate();
  const { documents, categories, incrementView } = useDataStore();
  const { user, toggleBookmark } = useAuthStore();
  const { addNotification } = useUIStore();
  const [activeImage, setActiveImage] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);

  const handleShare = () => {
    const shareLink = window.location.href;
    navigator.clipboard.writeText(shareLink);
    addNotification('SUCCESS', 'COPIED', 'Node address mirrored to clipboard.');
  };

  useEffect(() => {
    if (showModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
  }, [showModal]);

  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) mainContent.scrollTo(0, 0);
    if (id) incrementView(id);
  }, [id]);

  const doc = documents.find(d => d.id === id);
  if (!doc) return <div className="p-20 text-center font-heading text-accent text-xs">ERR: NODE_NOT_FOUND_404</div>;

  // Check permissions
  const docCategoryIds = doc.categoryIds || (doc.categoryId ? [doc.categoryId] : []);
  const isPermitted = user?.role === UserRole.ADMIN || 
                      user?.permissions?.allAccess || 
                      docCategoryIds.some(cid => 
                        user?.permissions?.categories.includes(cid) && 
                        isPermissionActive(user?.permissions?.categoryPermissions?.[cid])
                      );

  if (!isPermitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <ShieldAlert size={64} className="text-error animate-pulse" />
        <h2 className="text-2xl font-heading font-black uppercase tracking-widest text-error">ACCESS_DENIED</h2>
        <p className="text-muted text-xs font-heading uppercase tracking-widest">SUBSCRIPTION_EXPIRED_OR_UNAUTHORIZED</p>
        <button onClick={() => navigate('/dashboard')} className="px-8 py-3 bg-white text-black font-heading text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-all">RETURN_TO_BASE</button>
      </div>
    );
  }

  const categoryName = categories.find(c => c.id === (doc.categoryIds?.[0] || doc.categoryId))?.name || 'NAMESPACE_NULL';
  const isBookmarked = id ? user?.bookmarks?.includes(id) : false;

  const nextImage = () => {
    if (doc.images && doc.images.length > 0) {
      setActiveImage((prev) => (prev + 1) % doc.images.length);
    }
  };

  const prevImage = () => {
    if (doc.images && doc.images.length > 0) {
      setActiveImage((prev) => (prev - 1 + doc.images.length) % doc.images.length);
    }
  };

  const CommandSidebar = () => (
    <div className="space-y-4 lg:space-y-5 lg:sticky lg:top-12 animate-in slide-in-from-left-12 duration-700 w-full self-start">
      <button 
        onClick={() => navigate(-1)}
        className="w-full py-3 lg:py-4 px-6 bg-black/40 border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all flex items-center gap-4 group"
        style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)' }}
      >
         <ChevronLeft size={18} className="text-accent group-hover:-translate-x-1 transition-transform" />
         <span className="text-[9px] lg:text-[10px] font-heading font-black tracking-[0.3em] uppercase text-white">BACK</span>
      </button>

      <div 
        className="bg-black/60 border border-white/10 p-6 lg:p-7 relative overflow-hidden flex flex-col gap-5 lg:gap-6"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)' }}
      >
         <div className="flex items-center justify-between border-b border-white/5 pb-4 lg:pb-5">
            <h3 className="text-xs font-heading font-black tracking-[0.4em] uppercase flex items-center gap-3 text-white">
              <Database size={16} className="text-accent" /> COMMANDS
            </h3>
            <div className="bg-accent/10 border border-accent/20 px-2 py-0.5 text-[7px] font-heading text-accent uppercase font-black tracking-widest">
              {doc.serialNumber || `SN: DOC-${doc.id.toUpperCase().slice(0, 6)}`}
            </div>
         </div>
         
         <div className="flex flex-col gap-3">
            <button 
              onClick={() => id && toggleBookmark(id)} 
              className={`w-full py-4 lg:py-5 px-6 border-2 font-heading text-[10px] lg:text-[11px] font-black tracking-[0.3em] uppercase transition-all flex items-center justify-between group ${isBookmarked ? 'bg-accent text-black border-accent shadow-glow' : 'bg-surface/40 border-white/10 text-white hover:bg-white hover:text-black'}`}
              style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
            >
              <span className="flex items-center gap-3">
                <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
                {isBookmarked ? 'SAVED' : 'SAVE'}
              </span>
            </button>

            {user?.role === UserRole.ADMIN && (
               <button className="w-full py-4 lg:py-5 px-6 bg-white text-black font-heading text-[10px] lg:text-[11px] font-black tracking-[0.4em] uppercase hover:bg-accent transition-all flex items-center justify-between group"
                       style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}>
                 <span className="flex items-center gap-3">
                   <Download size={16} /> DOWNLOAD
                 </span>
               </button>
            )}

            <button 
              onClick={handleShare}
              className="w-full py-4 lg:py-5 px-6 bg-surface/40 border border-white/10 text-white font-heading text-[10px] lg:text-[11px] font-black tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all flex items-center justify-between group"
              style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
            >
              <span className="flex items-center gap-3">
                <Share2 size={16} /> SHARE
              </span>
            </button>
         </div>

         <div className="pt-4 lg:pt-6 space-y-3 lg:space-y-4">
            {[
              { l: 'SECTOR', v: categoryName, i: <Layers size={13}/> },
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
    <div className="max-w-[1700px] mx-auto animate-in fade-in duration-1000 relative px-0.5 sm:px-4 select-none overscroll-behavior-none">
      
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Command Sidebar - Left Side */}
        <div className="lg:col-span-4 xl:col-span-3">
          <CommandSidebar />
        </div>

        {/* Main Content Area - Right Side */}
        <div className="lg:col-span-8 xl:col-span-9 animate-in slide-in-from-right-12 duration-700">
          <div 
            className="bg-black/60 border border-white/10 relative overflow-hidden shadow-2xl mt-12"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }}
          >
            <div className="bg-zinc-950 p-5 lg:pt-10 lg:px-14 lg:pb-14 flex flex-col space-y-4 lg:space-y-8 relative z-10">
               {/* HEADER SECTOR */}
               <div className="flex items-center justify-between border-b border-white/5 pb-4 lg:pb-6 relative">
                  <div className="flex items-start sm:items-center gap-4 lg:gap-8 mt-2">
                    <div className="min-w-0">
                       <div className="flex items-center gap-2 sm:gap-3">
                         <div className="w-1.5 h-1.5 bg-accent animate-pulse shrink-0"></div>
                         <span className="text-[8px] sm:text-[9px] lg:text-[11px] font-heading text-accent tracking-[0.4em] sm:tracking-[0.5em] uppercase font-black truncate">{categoryName}</span>
                       </div>
                       <h2 className="text-lg lg:text-3xl font-heading font-black tracking-tighter text-white uppercase mt-1 break-words">{doc.title}</h2>
                    </div>
                  </div>
               </div>

               {/* ASSET VIEWER (IMAGES) */}
               {doc.images && doc.images.length > 0 && (
                 <div className="space-y-4">
                    <div className="relative aspect-video bg-black border border-white/10 overflow-hidden group cursor-pointer" onClick={() => setShowModal(true)}>
                       <img 
                        src={doc.images[activeImage] || undefined} 
                        className="w-full h-full object-cover grayscale lg:group-hover:grayscale-0 transition-all duration-1000 lg:group-hover:scale-105" 
                        alt="Projected Asset"
                       />
                       
                       <div className="hidden lg:flex absolute inset-0 items-center justify-between px-6 pointer-events-none">
                          {doc.images.length > 1 && (
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
                          <Maximize2 size={10} /> {activeImage + 1}/{doc.images.length}
                       </div>
                    </div>

                    {doc.images.length > 1 && (
                      <div className="lg:hidden flex items-center justify-between bg-black/40 border border-white/5 p-1">
                         <button onClick={() => prevImage()} className="flex-1 py-2.5 flex items-center justify-center border-r border-white/5 text-muted active:text-accent active:bg-accent/10 transition-colors">
                           <ChevronLeft size={16} />
                         </button>
                         <div className="px-5 text-[9px] font-heading font-black text-white/40 tracking-widest">
                           {activeImage + 1} / {doc.images.length}
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
                   <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.content || "--- EMPTY ---"}</ReactMarkdown>
                 </div>
               </div>

               <div className="pt-4 lg:pt-8 border-t border-white/5 flex flex-wrap justify-between items-center gap-4 opacity-40">
                  <div className="flex items-center gap-4 text-[8px] lg:text-[11px] font-heading text-muted uppercase tracking-[0.2em] font-black">
                     <span className="flex items-center gap-2"><Eye size={12} /> {doc.viewCount} VIEWS</span>
                     <span className="flex items-center gap-2 truncate"><Zap size={12} /> {new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* PHOTO MODAL */}
      {showModal && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-700 backdrop-blur-[20px]"
          onClick={() => setShowModal(false)}
        >
           <div className="relative flex flex-col items-center justify-center max-w-7xl w-full h-full pointer-events-none">
             
             <div 
               className="relative w-fit h-fit border border-accent/40 p-1 bg-zinc-950 shadow-2xl animate-in zoom-in duration-300 pointer-events-auto"
               style={{ clipPath: 'polygon(0 30px, 30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)' }}
               onClick={e => e.stopPropagation()}
             >
                <button 
                  onClick={() => setShowModal(false)} 
                  className="absolute sm:top-10 sm:right-10 top-4 right-4 text-muted hover:text-white transition-all hover:scale-125 z-[110]"
                >
                  <X size={32} className="sm:size-[44px] shrink-0" />
                </button>

                <div className="relative border border-white/5 bg-black overflow-hidden flex items-center justify-center">
                  <img src={doc.images[activeImage] || undefined} className="max-w-full max-h-[70vh] lg:max-h-[85vh] object-contain transition-all duration-700" alt="Identity Scan" />
                  
                  {doc.images.length > 1 && (
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

      <style>{`
        @keyframes v-scan { 0% { top: -10%; opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.8; } 100% { top: 110%; opacity: 0; } }
      `}</style>
    </div>
  );
};

export default DocumentViewer;
