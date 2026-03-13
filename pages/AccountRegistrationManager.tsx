
import React, { useState, useEffect } from 'react';
import { useDataStore } from '../store/dataStore';
import { useUIStore } from '../store/uiStore';
import { TradingPlatform } from '../types';
import { 
  Plus, 
  Trash2, 
  ExternalLink, 
  Globe, 
  Link as LinkIcon, 
  Activity, 
  TrendingUp, 
  MousePointer2, 
  Clock, 
  Shield, 
  Cpu, 
  Database,
  Save,
  X,
  Edit3,
  PenLine,
  CheckCircle,
  AlertCircle,
  GripVertical,
  GripHorizontal,
  ArrowRight
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortablePlatformItem = ({ 
  p, 
  index,
  startEdit, 
  setDeleteTarget,
  getLogoUrl
}: { 
  p: TradingPlatform, 
  index: number,
  startEdit: (p: TradingPlatform) => void, 
  setDeleteTarget: (id: string) => void,
  getLogoUrl: (url: string) => string
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: p.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative flex flex-col">
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-2 left-1/2 -translate-x-1/2 z-20 px-6 sm:px-10 py-1.5 bg-black/60 border border-white/10 text-white/20 hover:text-accent hover:border-accent/50 hover:bg-black/80 active:border-accent cursor-grab active:cursor-grabbing transition-all flex items-center justify-center"
        style={{ clipPath: 'polygon(12px 0, 100% 0, 100% 60%, calc(100% - 12px) 100%, 0 100%, 0 40%)' }}
      >
        <GripHorizontal size={14} />
      </div>

      <div className="relative bg-surface group transition-all duration-500 flex flex-col h-full overflow-hidden" 
           style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>
         
         {/* Straight Edge Borders - Positioned to stop before the diagonal cuts */}
         <div className="absolute top-0 left-[20px] right-0 h-[1px] bg-white/10 group-hover:bg-accent/40 transition-colors z-20"></div>
         <div className="absolute top-0 right-0 bottom-[20px] w-[1px] bg-white/10 group-hover:bg-accent/40 transition-colors z-20"></div>
         <div className="absolute bottom-0 right-[20px] left-0 h-[1px] bg-white/10 group-hover:bg-accent/40 transition-colors z-20"></div>
         <div className="absolute bottom-0 left-0 top-[20px] w-[1px] bg-white/10 group-hover:bg-accent/40 transition-colors z-20"></div>

         <div className="p-5 sm:p-8 relative z-10 flex flex-col h-full">
            {/* Index Number */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-8 font-heading text-[40px] sm:text-[60px] font-black text-white/[0.02] group-hover:text-accent/[0.05] transition-colors leading-none select-none">
              {(index + 1).toString().padStart(2, '0')}
            </div>

            <div className="flex items-start justify-between mb-6 sm:mb-8">
               <div className="flex items-center gap-3 sm:gap-5">
                  <div className="relative">
                     <div className="absolute -inset-2 bg-accent/5 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div className="w-10 h-10 sm:w-14 sm:h-14 bg-black border border-white/10 flex items-center justify-center relative z-10 group-hover:border-accent/30 transition-colors">
                        <img 
                          src={getLogoUrl(p.url)} 
                          className="w-5 h-5 sm:w-8 sm:h-8 object-contain transition-all duration-500" 
                          alt={p.name} 
                          referrerPolicy="no-referrer"
                        />
                     </div>
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                     <h4 className="font-heading text-base sm:text-xl font-black uppercase tracking-tight text-white group-hover:text-accent transition-colors">{p.name}</h4>
                     <div className="flex items-center gap-2">
                        <div className={`w-1 h-1 rounded-full animate-pulse ${p.status === 'ACTIVE' ? 'bg-accent' : 'bg-error'}`}></div>
                        <span className={`text-[6px] sm:text-[7px] font-heading tracking-[0.3em] uppercase font-bold ${p.status === 'ACTIVE' ? 'text-accent/50' : 'text-error/50'}`}>
                          {p.status === 'ACTIVE' ? 'UPLINK_ESTABLISHED' : 'NODE_OFFLINE'}
                        </span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-10 flex-grow group/desc">
               <div className="flex items-center gap-2">
                  <div className="h-px w-3 sm:w-4 bg-accent/30"></div>
                  <span className="text-[7px] sm:text-[8px] font-heading text-muted tracking-widest uppercase">Description</span>
               </div>
               <p className="text-[9px] sm:text-[10px] text-muted/80 group-hover/desc:text-white transition-colors uppercase tracking-[0.12em] leading-relaxed font-medium line-clamp-3 sm:line-clamp-none">
                  {p.description || 'ESTABLISHING_SECURE_CONNECTION_TO_TRADING_INFRASTRUCTURE_MODULE.'}
               </p>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
               <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div className="p-2 sm:p-3 border border-white/5 bg-white/[0.02] space-y-0.5 sm:space-y-1">
                     <p className="text-[6px] sm:text-[7px] font-heading text-muted/40 uppercase tracking-widest">TOTAL_CLICKS</p>
                     <p className="text-[9px] sm:text-[10px] font-heading text-white font-bold">{p.clickCount || 0}</p>
                  </div>
                  <div className="p-2 sm:p-3 border border-white/5 bg-white/[0.02] space-y-0.5 sm:space-y-1">
                     <p className="text-[6px] sm:text-[7px] font-heading text-muted/40 uppercase tracking-widest">TODAY</p>
                     <p className="text-[9px] sm:text-[10px] font-heading text-accent font-bold">{p.clicksToday || 0}</p>
                  </div>
               </div>

               <a 
                 href={p.registrationUrl} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="group/btn relative w-full py-3 sm:py-4 bg-accent/5 border border-accent/20 text-accent font-heading text-[8px] sm:text-[9px] font-black tracking-[0.4em] uppercase overflow-hidden transition-all hover:bg-accent hover:text-black active:scale-[0.98] flex items-center justify-center gap-3"
                 style={{ clipPath: 'polygon(8% 0, 100% 0, 100% 70%, 92% 100%, 0 100%, 0 30%)' }}
               >
                  <span className="relative z-10">INITIALIZE_NODE</span>
                  <ArrowRight size={12} className="relative z-10 group-hover/btn:translate-x-1 transition-transform" />
               </a>
            </div>
         </div>
      </div>

      {/* Admin Actions below the card */}
      <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-3 px-1">
        <button 
          onClick={() => startEdit(p)}
          className="group/edit relative py-3 sm:py-4 bg-zinc-900 border border-white/5 text-white font-heading text-[8px] sm:text-[9px] font-black tracking-[0.3em] uppercase overflow-hidden transition-all hover:border-accent/50 hover:text-accent active:scale-95 flex items-center justify-center gap-2"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 85% 100%, 0 100%)' }}
        >
           <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover/edit:opacity-100 transition-opacity"></div>
           <PenLine size={12} className="group-hover/edit:rotate-12 transition-transform" />
           <span>EDIT</span>
        </button>
        <button 
          onClick={() => setDeleteTarget(p.id)}
          className="group/del relative py-3 sm:py-4 bg-zinc-900 border border-white/5 text-white font-heading text-[8px] sm:text-[9px] font-black tracking-[0.3em] uppercase overflow-hidden transition-all hover:border-error/50 hover:text-error active:scale-95 flex items-center justify-center gap-2"
          style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}
        >
           <div className="absolute inset-0 bg-error/5 opacity-0 group-hover/del:opacity-100 transition-opacity"></div>
           <Trash2 size={12} className="group-hover/del:scale-110 transition-transform" />
           <span>DELETE</span>
        </button>
      </div>
    </div>
  );
};

const AccountRegistrationManager: React.FC = () => {
  const { tradingPlatforms, addTradingPlatform, updateTradingPlatform, deleteTradingPlatform, updateTradingPlatformsOrder } = useDataStore();
  const { addNotification, setGlobalLoading } = useUIStore();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [localPlatforms, setLocalPlatforms] = useState<TradingPlatform[]>([]);
  const [hasOrderChanged, setHasOrderChanged] = useState(false);

  useEffect(() => {
    if (tradingPlatforms.length > 0 && !hasOrderChanged) {
      setLocalPlatforms(tradingPlatforms);
    }
  }, [tradingPlatforms, hasOrderChanged]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalPlatforms((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        setHasOrderChanged(true);
        return newOrder;
      });
    }
  };

  const saveOrder = async () => {
    setGlobalLoading(true);
    try {
      await updateTradingPlatformsOrder(localPlatforms);
      setHasOrderChanged(false);
      addNotification('SUCCESS', 'ORDER_SYNC', 'Platform hierarchy synchronized.');
    } catch (e) {
      addNotification('ERROR', 'SYNC_FAILED', 'Failed to update order.');
    } finally {
      setGlobalLoading(false);
    }
  };
  
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    registrationUrl: '',
    description: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  const handleSave = async () => {
    if (!formData.name || !formData.url || !formData.registrationUrl) {
      addNotification('ERROR', 'MISSING_DATA', 'Please fill all required fields.');
      return;
    }

    setGlobalLoading(true);
    try {
      if (editingId) {
        await updateTradingPlatform(editingId, formData);
        addNotification('SUCCESS', 'UPDATED', 'Platform protocol synchronized.');
      } else {
        await addTradingPlatform(formData);
        addNotification('SUCCESS', 'CREATED', 'New platform node initialized.');
      }
      resetForm();
    } catch (e) {
      addNotification('ERROR', 'SYNC_FAILED', 'Failed to update database.');
    } finally {
      setGlobalLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      registrationUrl: '',
      description: '',
      status: 'ACTIVE'
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (p: TradingPlatform) => {
    setFormData({
      name: p.name,
      url: p.url,
      registrationUrl: p.registrationUrl,
      description: p.description,
      status: p.status
    });
    setEditingId(p.id);
    setIsAdding(true);
  };

  const getLogoUrl = (url: string) => {
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch (e) {
      return null;
    }
  };

  const totalClicks = tradingPlatforms.reduce((acc, p) => acc + (p.clickCount || 0), 0);
  const totalClicksToday = tradingPlatforms.reduce((acc, p) => acc + (p.clicksToday || 0), 0);

  return (
    <div className="max-w-[1700px] mx-auto space-y-6 sm:space-y-10 animate-in fade-in duration-1000 pb-20 relative px-0.5 sm:px-4 select-none">
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-accent">
            <Globe size={16} className="animate-pulse" />
            <p className="text-[10px] font-heading tracking-[0.5em] uppercase font-black">EXTERNAL_LINKS</p>
          </div>
          <h2 className="text-2xl sm:text-5xl font-heading font-black tracking-tighter text-white uppercase leading-none">ACCOUNT_REGISTRATION</h2>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {hasOrderChanged && (
            <button 
              onClick={saveOrder}
              className="px-4 sm:px-8 py-3 sm:py-4 bg-accent/10 border border-accent/40 text-accent font-heading text-[9px] sm:text-[10px] font-black tracking-[0.2em] sm:tracking-[0.4em] uppercase hover:bg-accent hover:text-black transition-all flex items-center gap-2 sm:gap-3"
              style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
            >
              <Save size={14} /> <span className="hidden sm:inline">SAVE_ORDER</span><span className="sm:hidden">SAVE</span>
            </button>
          )}
          <button 
            onClick={() => setIsAdding(true)}
            className="hidden md:flex bg-white text-black px-6 sm:px-10 py-3 sm:py-4 text-[9px] sm:text-[10px] font-heading font-black tracking-[0.2em] sm:tracking-[0.4em] uppercase hover:bg-accent transition-all items-center justify-center gap-2 sm:gap-4 active:scale-95 shadow-glow-sm"
            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
          >
             <Plus size={16} className="sm:size-[18px]" /> <span className="hidden sm:inline">NEW_LINK</span><span className="sm:hidden">NEW_LINK</span>
          </button>
        </div>
      </div>

      {/* HUD DATA MODULES */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'TOTAL_CLICKS', val: totalClicks, icon: <MousePointer2 size={16}/>, color: 'text-accent', desc: 'TELEMETRY' },
          { label: 'CLICKS_TODAY', val: totalClicksToday, icon: <TrendingUp size={16}/>, color: 'text-emerald-500', desc: 'REALTIME' },
          { label: 'ACTIVE_NODES', val: tradingPlatforms.filter(p => p.status === 'ACTIVE').length, icon: <Activity size={16}/>, color: 'text-white', desc: 'ONLINE' },
          { label: 'SYSTEM_SYNC', val: '100%', icon: <Cpu size={16}/>, color: 'text-error', desc: 'STABLE' }
        ].map((s, i) => (
          <div key={i} className={`bg-surface/80 border border-white/5 p-2 sm:p-5 relative overflow-hidden group transition-all duration-500 flex flex-col justify-between min-h-[140px] sm:min-h-[180px] ${
            s.color === 'text-white' ? 'hover:border-white/40' : 
            s.color === 'text-accent' ? 'hover:border-accent/40' : 
            s.color === 'text-emerald-500' ? 'hover:border-emerald-500/40' : 
            'hover:border-error/40'
          }`}>
             <div className={`absolute top-0 right-0 w-12 sm:w-16 h-1 opacity-20 ${s.color.replace('text-', 'bg-')}`}></div>
             <div className={`absolute bottom-0 left-0 w-1 h-8 sm:h-12 opacity-20 ${s.color.replace('text-', 'bg-')}`}></div>
             
             <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className={`p-2 sm:p-3 bg-black border border-white/10 ${s.color} transition-all duration-300
                    ${s.color === 'text-white' ? 'group-hover:bg-white group-hover:text-black' : 
                      s.color === 'text-accent' ? 'group-hover:bg-accent group-hover:text-black' : 
                      s.color === 'text-emerald-500' ? 'group-hover:bg-emerald-500 group-hover:text-black' : 
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

      <div className="md:hidden relative z-10 mt-4">
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full bg-white text-black py-4 text-[10px] font-heading font-black tracking-[0.2em] uppercase hover:bg-accent transition-all flex items-center justify-center gap-3 active:scale-95 shadow-glow-sm" 
          style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
        >
          <Plus size={18} /> NEW_LINK
        </button>
      </div>

      {isAdding && (
        <div className="relative z-10 bg-black/60 border border-accent/20 p-4 sm:p-8 animate-in slide-in-from-top-4 duration-500" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
          <div className="flex items-center justify-between mb-6 sm:mb-8 border-b border-white/5 pb-4">
            <h3 className="font-heading text-xs sm:text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <Cpu size={18} className="text-accent" /> {editingId ? 'EDIT_PLATFORM_NODE' : 'INITIALIZE_NEW_PLATFORM'}
            </h3>
            <button onClick={resetForm} className="text-muted hover:text-white transition-colors"><X size={20}/></button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2.5 group">
                <label className="flex items-center gap-2 text-[9px] sm:text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                  <Database size={14} className="text-accent/40 group-focus-within:text-accent" /> PLATFORM_NAME
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                  <input 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-muted/10 uppercase text-white" 
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                    placeholder="e.g. BINANCE, POCKET OPTION"
                  />
                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                </div>
              </div>

              <div className="space-y-2.5 group">
                <label className="flex items-center gap-2 text-[9px] sm:text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                  <Globe size={14} className="text-accent/40 group-focus-within:text-accent" /> MAIN_WEBSITE_URL_(FOR_LOGO)
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                  <input 
                    value={formData.url}
                    onChange={e => setFormData({...formData, url: e.target.value})}
                    className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-muted/10 text-white" 
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                    placeholder="e.g. binance.com"
                  />
                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                </div>
                {formData.url && (
                  <div className="flex items-center gap-3 p-3 bg-black/40 border border-white/5 mt-2">
                    <img src={getLogoUrl(formData.url) || undefined} className="w-8 h-8 object-contain" alt="Logo Preview" />
                    <p className="text-[8px] font-heading text-accent uppercase tracking-widest">Logo Preview Synchronized</p>
                  </div>
                )}
              </div>

              <div className="space-y-2.5 group">
                <label className="flex items-center gap-2 text-[9px] sm:text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                  <LinkIcon size={14} className="text-accent/40 group-focus-within:text-accent" /> REGISTRATION_/_REFERRAL_LINK
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                  <input 
                    value={formData.registrationUrl}
                    onChange={e => setFormData({...formData, registrationUrl: e.target.value})}
                    className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-muted/10 text-white" 
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                    placeholder="https://platform.com/register?ref=123"
                  />
                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2.5 group">
                <label className="flex items-center gap-2 text-[9px] sm:text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                  <Edit3 size={14} className="text-accent/40 group-focus-within:text-accent" /> BRIEF_DESCRIPTION
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-muted/10 uppercase h-[120px] resize-none text-white custom-scrollbar" 
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                    placeholder="ENTER PLATFORM DETAILS..."
                  />
                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[8px] sm:text-[9px] font-heading text-muted uppercase tracking-widest flex items-center gap-2">
                  <Activity size={12} className="text-accent" /> STATUS
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['ACTIVE', 'INACTIVE'].map(s => (
                    <button 
                      key={s}
                      onClick={() => setFormData({...formData, status: s as any})}
                      className={`py-3 font-heading text-[8px] sm:text-[9px] tracking-widest font-black uppercase transition-all ${formData.status === s ? 'bg-accent text-black' : 'bg-white/5 text-muted hover:bg-white/10'}`}
                      style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleSave}
                  className="w-full bg-white text-black py-4 sm:py-5 font-heading text-[9px] sm:text-[10px] font-black tracking-[0.5em] uppercase hover:bg-accent transition-all flex items-center justify-center gap-4 shadow-glow"
                  style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
                >
                  <Save size={18} /> {editingId ? 'SYNCHRONIZE_CHANGES' : 'INITIALIZE_NODE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={localPlatforms.map(p => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {localPlatforms.map((p, i) => (
              <SortablePlatformItem 
                key={p.id} 
                p={p} 
                index={i}
                startEdit={startEdit} 
                setDeleteTarget={setDeleteTarget} 
                getLogoUrl={getLogoUrl}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <ConfirmDialog 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            setGlobalLoading(true);
            try {
              await deleteTradingPlatform(deleteTarget);
              setDeleteTarget(null);
              addNotification('SUCCESS', 'PURGED', 'Platform node erased from registry.');
            } finally {
              setGlobalLoading(false);
            }
          }
        }}
        title="PURGE_WARNING"
        message="Are you certain you want to erase this platform node? All click telemetry will be lost."
        confirmLabel="PURGE"
      />
    </div>
  );
};

export default AccountRegistrationManager;
