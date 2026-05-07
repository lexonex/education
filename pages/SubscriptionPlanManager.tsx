
import React, { useState, useEffect } from 'react';
import { useDataStore } from '../store/dataStore';
import { useUIStore } from '../store/uiStore';
import { SubscriptionPlan, SubscriptionFeature } from '../types';
import { 
  Plus, 
  Trash2, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  Star, 
  Clock, 
  Shield, 
  Cpu, 
  Database,
  Save,
  X,
  Edit3,
  Layers,
  Activity,
  Zap,
  Target,
  Check,
  Minus,
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

const SortablePlanItem = ({ 
  p, 
  startEdit, 
  setDeleteTarget 
}: { 
  p: SubscriptionPlan, 
  startEdit: (p: SubscriptionPlan) => void, 
  setDeleteTarget: (id: string) => void 
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

      <div className={`relative flex-1 p-5 sm:p-8 bg-[#050505] border transition-all duration-500 flex flex-col ${p.isPopular ? 'border-yellow-500/30 group-hover:border-yellow-500' : 'border-white/10 group-hover:border-white/30'}`} 
           style={{ clipPath: 'polygon(0 20px, 20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
        
        {/* Corner Accents */}
        
        <div className="relative z-10 flex flex-col mb-2 min-h-[50px] sm:min-h-[60px]">
          {p.isPopular && (
            <div className="absolute -top-5 -right-5 sm:-top-6 sm:-right-6 bg-yellow-500 text-black px-6 sm:px-8 py-1 sm:py-1.5 text-[8px] sm:text-[9px] font-heading font-black uppercase tracking-[0.2em]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 15% 100%)' }}>RECOMMENDED</div>
          )}
          <h4 className={`font-heading text-xl sm:text-2xl font-black uppercase tracking-tighter mb-1 ${p.isPopular ? 'text-yellow-500' : 'text-white'}`}>{p.name}</h4>
          {p.subtitle && (
            <p className="text-[10px] text-accent/80 font-heading uppercase tracking-widest mb-1 italic">{p.subtitle}</p>
          )}
          <div className="flex items-center gap-2">
            <Clock size={10} className="text-muted/40" />
            <p className="text-[8px] sm:text-[9px] text-muted uppercase tracking-[0.2em] font-bold">{p.durationDays} DAYS DURATION</p>
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-6xl font-heading font-black text-white tracking-tighter">${p.price.toLocaleString('en-US')}</span>
            <span className="text-[9px] sm:text-[11px] font-heading text-muted uppercase tracking-[0.3em] font-bold">/ {p.currency}</span>
          </div>
          <div className={`h-1 w-8 sm:w-12 mt-3 sm:mt-4 ${p.isPopular ? 'bg-yellow-500/40' : 'bg-white/10'}`}></div>
        </div>

        <p className="text-[9px] sm:text-[10px] text-muted/60 uppercase tracking-[0.12em] leading-relaxed min-h-[30px] sm:min-h-[40px] mb-6 sm:mb-8 line-clamp-3 sm:line-clamp-none">
          {p.description || 'NO_DESCRIPTION_PROVIDED'}
        </p>

        <div className="space-y-3 sm:space-y-5 mb-10 sm:mb-16 flex-grow">
          {(p.features || []).map((feat, i) => {
            const f = typeof feat === 'string' ? { text: feat, isAvailable: true } : feat;
            return (
              <div key={i} className={`flex items-center gap-3 sm:gap-4 group/item ${!f.isAvailable ? 'opacity-60' : ''}`}>
                <div className={`shrink-0 transition-transform group-hover/item:scale-125 ${!f.isAvailable ? 'text-red-500' : (p.isPopular ? 'text-yellow-500' : 'text-accent')}`}>
                  {f.isAvailable ? <CheckCircle size={12} className="sm:size-[14px]" /> : <XCircle size={12} className="sm:size-[14px]" />}
                </div>
                <span className={`text-[9px] sm:text-[11px] uppercase tracking-widest leading-none transition-colors translate-y-[1px] ${f.isAvailable ? 'text-white/60 group-hover/item:text-white' : 'text-red-500/80 line-through'}`}>
                  {f.text}
                </span>
              </div>
            );
          })}

          {(p.keyFeatures && p.keyFeatures.length > 0) && (
            <div className="pt-6 mt-6 border-t border-white/5 space-y-3">
               <p className="text-[8px] font-heading text-muted uppercase tracking-[0.3em] font-bold mb-4 opacity-40">KEY_METADATA</p>
               {p.keyFeatures.map((f, i) => {
                 const statusColor = f.status === 'UNAVAILABLE' ? 'text-red-500' : 
                                   f.status === 'POPULAR' ? 'text-yellow-500' : 
                                   f.status === 'SPECIAL' ? 'text-green-500' : 'text-accent';
                 return (
                    <div key={i} className="flex items-center justify-between text-[9px] uppercase tracking-widest">
                       <span className="text-white/40">{f.text.split(':')[0]}:</span>
                       <span className={`font-bold ${statusColor}`}>{f.text.split(':')[1] || (f.isAvailable ? 'YES' : 'NO')}</span>
                    </div>
                 )
               })}
            </div>
          )}
        </div>

        <button 
          className={`w-full py-4 sm:py-5 font-heading text-[9px] sm:text-[10px] font-black tracking-[0.5em] uppercase transition-all flex items-center justify-center gap-3 active:scale-95 ${p.isPopular ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-accent text-black hover:bg-accent/80'}`} 
          style={{ clipPath: 'polygon(12% 0, 100% 0, 100% 65%, 88% 100%, 0 100%, 0 35%)' }}
        >
          PURCHASE_PLAN <ArrowRight size={14} />
        </button>
      </div>

      <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-4 px-1">
        <button 
          onClick={() => startEdit(p)}
          className="group/edit relative py-4 sm:py-5 bg-zinc-900 border border-white/5 text-white font-heading text-[9px] sm:text-[10px] font-black tracking-[0.3em] uppercase overflow-hidden transition-all hover:border-accent/50 hover:text-accent active:scale-95 flex items-center justify-center gap-3"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 85% 100%, 0 100%)' }}
        >
           <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover/edit:opacity-100 transition-opacity"></div>
           <Edit3 size={14} className="group-hover/edit:rotate-12 transition-transform" />
           <span>EDIT</span>
        </button>
        <button 
          onClick={() => setDeleteTarget(p.id)}
          className="group/del relative py-4 sm:py-5 bg-zinc-900 border border-white/5 text-white font-heading text-[9px] sm:text-[10px] font-black tracking-[0.3em] uppercase overflow-hidden transition-all hover:border-error/50 hover:text-error active:scale-95 flex items-center justify-center gap-3"
          style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0 100%, 0 30%)' }}
        >
           <div className="absolute inset-0 bg-error/5 opacity-0 group-hover/del:opacity-100 transition-opacity"></div>
           <Trash2 size={14} className="group-hover/del:scale-110 transition-transform" />
           <span>DELETE</span>
        </button>
      </div>
    </div>
  );
};

const SubscriptionPlanManager: React.FC = () => {
  const { subscriptionPlans, addSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan, updateSubscriptionPlansOrder } = useDataStore();
  const { addNotification, setGlobalLoading } = useUIStore();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  
  const [localPlans, setLocalPlans] = useState<SubscriptionPlan[]>([]);
  const [hasOrderChanged, setHasOrderChanged] = useState(false);

  useEffect(() => {
    if (subscriptionPlans.length > 0 && !hasOrderChanged) {
      setLocalPlans(subscriptionPlans);
    }
  }, [subscriptionPlans, hasOrderChanged]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalPlans((items) => {
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
      await updateSubscriptionPlansOrder(localPlans);
      setHasOrderChanged(false);
      addNotification('SUCCESS', 'ORDER_SYNC', 'Plan hierarchy synchronized.');
    } catch (e) {
      addNotification('ERROR', 'SYNC_FAILED', 'Failed to update order.');
    } finally {
      setGlobalLoading(false);
    }
  };
  
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    price: '' as string | number,
    currency: 'USD',
    durationDays: '' as string | number,
    features: [] as SubscriptionFeature[],
    keyFeatures: [] as SubscriptionFeature[],
    description: '',
    isPopular: false,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  const [featureInput, setFeatureInput] = useState('');
  const [keyFeatureInput, setKeyFeatureInput] = useState('');
  const [keyFeatureStatus, setKeyFeatureStatus] = useState<'STANDARD' | 'POPULAR' | 'UNAVAILABLE' | 'SPECIAL'>('STANDARD');

  const formatWithCommas = (val: string | number) => {
    if (val === '' || val === undefined || val === null) return '';
    const num = val.toString().replace(/,/g, '');
    if (isNaN(Number(num))) return val.toString();
    return Number(num).toLocaleString('en-US');
  };

  const parseFormattedNumber = (val: string) => {
    return val.replace(/,/g, '');
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = parseFormattedNumber(e.target.value);
    // Allow only numbers and empty string
    if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
      setFormData({ ...formData, price: rawValue });
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (rawValue === '' || /^\d*$/.test(rawValue)) {
      setFormData({ ...formData, durationDays: rawValue });
    }
  };

  const handleSave = async () => {
    if (!formData.name || formData.price === '') {
      addNotification('ERROR', 'MISSING_DATA', 'Please fill all required fields.');
      return;
    }

    const planData = {
      ...formData,
      price: Number(formData.price) || 0,
      durationDays: Number(formData.durationDays) || 0
    };

    setGlobalLoading(true);
    try {
      if (editingId) {
        await updateSubscriptionPlan(editingId, planData);
        addNotification('SUCCESS', 'UPDATED', 'Plan protocol synchronized.');
      } else {
        await addSubscriptionPlan(planData);
        addNotification('SUCCESS', 'CREATED', 'New plan node initialized.');
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
      subtitle: '',
      price: '',
      currency: 'USD',
      durationDays: '',
      features: [],
      keyFeatures: [],
      description: '',
      isPopular: false,
      status: 'ACTIVE'
    });
    setFeatureInput('');
    setKeyFeatureInput('');
    setKeyFeatureStatus('STANDARD');
    setIsAdding(false);
    setEditingId(null);
  };

  const loadStarterTemplate = () => {
    setFormData({
      name: 'Starter Plan',
      subtitle: 'Best for beginners',
      price: '25', // Default placeholder price
      currency: 'USD',
      durationDays: '120', // User example duration
      description: 'Best for beginners starting their trading journey.',
      isPopular: false,
      status: 'ACTIVE',
      features: [
        { text: 'Basic to advanced binary trading course', isAvailable: true },
        { text: 'Text + image based lessons', isAvailable: true },
        { text: 'Video content', isAvailable: false },
        { text: 'Step by step class structure', isAvailable: true },
        { text: 'Market basics', isAvailable: true },
        { text: 'Candlestick patterns', isAvailable: true },
        { text: 'Support and resistance', isAvailable: true },
        { text: 'Entry and exit strategy', isAvailable: true },
        { text: 'Risk management', isAvailable: true },
        { text: 'Psychology training', isAvailable: true },
        { text: 'Practice setup guide', isAvailable: true },
        { text: 'Weekly market update', isAvailable: true },
        { text: 'Private community access', isAvailable: true },
        { text: 'Beginner signal support', isAvailable: true }
      ],
      keyFeatures: [
        { text: 'Live Trading: No', isAvailable: false, status: 'UNAVAILABLE' },
        { text: 'Signals: Limited', isAvailable: true, status: 'POPULAR' },
        { text: 'Support: Basic Support', isAvailable: true, status: 'STANDARD' }
      ]
    });
    setIsAdding(true);
    addNotification('SUCCESS', 'TEMPLATE_LOADED', 'Starter Plan template applied.');
  };

  const startEdit = (p: SubscriptionPlan) => {
    // Handle legacy string array features
    const normalizedFeatures = (p.features || []).map(f => 
      typeof f === 'string' ? { text: f, isAvailable: true } : f
    );
    
    // Handle optional fields
    const normalizedKeyFeatures = (p.keyFeatures || []).map(f => 
      typeof f === 'string' ? { text: f, isAvailable: true, status: 'STANDARD' as const } : f
    );

    setFormData({
      name: p.name,
      subtitle: p.subtitle || '',
      price: p.price.toString(),
      currency: p.currency,
      durationDays: p.durationDays.toString(),
      features: normalizedFeatures,
      keyFeatures: normalizedKeyFeatures,
      description: p.description,
      isPopular: p.isPopular,
      status: p.status
    });
    setEditingId(p.id);
    setIsAdding(true);
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({ 
        ...formData, 
        features: [...formData.features, { text: featureInput.trim(), isAvailable: true, status: 'STANDARD' }] 
      });
      setFeatureInput('');
    }
  };

  const addKeyFeature = () => {
    if (keyFeatureInput.trim()) {
      setFormData({ 
        ...formData, 
        keyFeatures: [
          ...formData.keyFeatures, 
          { 
            text: keyFeatureInput.trim(), 
            isAvailable: keyFeatureStatus !== 'UNAVAILABLE',
            status: keyFeatureStatus 
          } 
        ] 
      });
      setKeyFeatureInput('');
    }
  };

  const toggleFeatureAvailability = (idx: number) => {
    const newFeatures = [...formData.features];
    newFeatures[idx] = { ...newFeatures[idx], isAvailable: !newFeatures[idx].isAvailable };
    setFormData({ ...formData, features: newFeatures });
  };

  const toggleKeyFeatureAvailability = (idx: number) => {
    const newKeyFeatures = [...formData.keyFeatures];
    const newIsAvailable = !newKeyFeatures[idx].isAvailable;
    newKeyFeatures[idx] = { 
      ...newKeyFeatures[idx], 
      isAvailable: newIsAvailable,
      status: newIsAvailable ? 'STANDARD' : 'UNAVAILABLE'
    };
    setFormData({ ...formData, keyFeatures: newKeyFeatures });
  };

  const removeFeature = (idx: number) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== idx) });
  };

  const removeKeyFeature = (idx: number) => {
    setFormData({ ...formData, keyFeatures: formData.keyFeatures.filter((_, i) => i !== idx) });
  };

  return (
    <div className="max-w-[1700px] mx-auto space-y-6 sm:space-y-10 animate-in fade-in duration-1000 pb-20 relative px-0.5 sm:px-4 select-none">
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-accent">
            <Zap size={16} className="animate-pulse" />
            <p className="text-[10px] font-heading tracking-[0.5em] uppercase font-black">REVENUE_PROTOCOLS</p>
          </div>
          <h2 className="text-2xl sm:text-5xl font-heading font-black tracking-tighter text-white uppercase leading-none">SUBSCRIPTION_PLANS</h2>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={loadStarterTemplate}
            className="px-4 sm:px-8 py-3 sm:py-4 bg-yellow-500/10 border border-yellow-500/40 text-yellow-500 font-heading text-[9px] sm:text-[10px] font-black tracking-[0.2em] sm:tracking-[0.4em] uppercase hover:bg-yellow-500 hover:text-black transition-all flex items-center gap-2 sm:gap-3"
            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
          >
            <Star size={14} className="animate-pulse" /> <span className="hidden sm:inline">QUICK_STARTER</span><span className="sm:hidden">STARTER</span>
          </button>
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
             <Plus size={16} className="sm:size-[18px]" /> <span className="hidden sm:inline">NEW_PLAN</span><span className="sm:hidden">NEW_PLAN</span>
          </button>
        </div>
      </div>

      {/* HUD DATA MODULES */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'TOTAL_PLANS', val: subscriptionPlans.length, icon: <Layers size={16}/>, color: 'text-white', desc: 'REGISTRY' },
          { label: 'ACTIVE_PLANS', val: subscriptionPlans.filter(p => p.status === 'ACTIVE').length, icon: <Activity size={16}/>, color: 'text-accent', desc: 'ONLINE' },
          { label: 'POPULAR_NODES', val: subscriptionPlans.filter(p => p.isPopular).length, icon: <Star size={16}/>, color: 'text-yellow-500', desc: 'TRENDING' },
          { label: 'SYSTEM_SYNC', val: '100%', icon: <Cpu size={16}/>, color: 'text-error', desc: 'STABLE' }
        ].map((s, i) => (
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

      <div className="md:hidden relative z-10 mt-4">
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full bg-white text-black py-4 text-[10px] font-heading font-black tracking-[0.2em] uppercase hover:bg-accent transition-all flex items-center justify-center gap-3 active:scale-95 shadow-glow-sm" 
          style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
        >
          <Plus size={18} /> NEW_PLAN
        </button>
      </div>

      {isAdding && (
        <div className="relative z-10 bg-black/60 border border-accent/20 p-4 sm:p-8 animate-in slide-in-from-top-4 duration-500" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
          <div className="flex items-center justify-between mb-6 sm:mb-8 border-b border-white/5 pb-4">
            <h3 className="font-heading text-xs sm:text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <Cpu size={18} className="text-accent" /> {editingId ? 'EDIT_PLAN_NODE' : 'INITIALIZE_NEW_PLAN'}
            </h3>
            <button onClick={resetForm} className="text-muted hover:text-white transition-colors"><X size={20}/></button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2.5 group">
                <label className="flex items-center gap-2 text-[9px] sm:text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                  <Database size={14} className="text-accent/40 group-focus-within:text-accent" /> PLAN_NAME
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                  <input 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-muted/10 uppercase text-white" 
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                    placeholder="e.g. PRO_TRADER, ENTERPRISE_GRID"
                  />
                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                </div>
              </div>

              <div className="space-y-2.5 group">
                <label className="flex items-center gap-2 text-[9px] sm:text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                  <Target size={14} className="text-accent/40 group-focus-within:text-accent" /> SUBTITLE
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                  <input 
                    value={formData.subtitle}
                    onChange={e => setFormData({...formData, subtitle: e.target.value})}
                    className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-muted/10 uppercase text-white" 
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                    placeholder="e.g. Best for beginners"
                  />
                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2.5 group">
                  <label className="flex items-center gap-2 text-[9px] sm:text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                    <DollarSign size={14} className="text-accent/40 group-focus-within:text-accent" /> PRICE
                  </label>
                  <div className="relative">
                    <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                    <input 
                      type="text"
                      value={formatWithCommas(formData.price)}
                      onChange={handlePriceChange}
                      className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-muted/10 text-white" 
                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                    />
                    <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                  </div>
                </div>
                <div className="space-y-2.5 group">
                  <label className="flex items-center gap-2 text-[9px] sm:text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                    <Clock size={14} className="text-accent/40 group-focus-within:text-accent" /> DURATION_(DAYS)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                    <input 
                      type="text"
                      value={formData.durationDays}
                      onChange={handleDurationChange}
                      className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-muted/10 text-white" 
                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                    />
                    <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 group">
                <label className="flex items-center gap-2 text-[9px] sm:text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                  <Edit3 size={14} className="text-accent/40 group-focus-within:text-accent" /> DESCRIPTION
                </label>
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-muted/10 uppercase h-[100px] resize-none text-white custom-scrollbar" 
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                    placeholder="ENTER PLAN DETAILS..."
                  />
                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2.5 group">
                <label className="flex items-center gap-2 text-[9px] sm:text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1 group-focus-within:text-accent transition-colors">
                  <Layers size={14} className="text-accent/40 group-focus-within:text-accent" /> FEATURES
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                    <input 
                      value={featureInput}
                      onChange={e => setFeatureInput(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && addFeature()}
                      className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-muted/10 uppercase text-white" 
                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                      placeholder="ADD FEATURE..."
                    />
                    <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                  </div>
                  <button onClick={addFeature} className="px-4 sm:px-6 bg-white text-black font-heading text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-all" style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}>ADD</button>
                </div>
                <div className="space-y-2 mt-4 max-h-[250px] overflow-y-auto custom-scrollbar">
                  {formData.features.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2 sm:p-3 bg-white/5 border border-white/5 group/feat">
                      <div className="flex items-center gap-3 flex-1">
                        <button 
                          onClick={() => toggleFeatureAvailability(i)}
                          className={`p-1.5 transition-all ${f.isAvailable ? 'text-accent bg-accent/10' : 'text-red-500 bg-red-500/10'}`}
                          title={f.isAvailable ? 'Available' : 'Unavailable'}
                        >
                          {f.isAvailable ? <Check size={14} /> : <X size={14} />}
                        </button>
                        <span className={`text-[9px] font-heading uppercase tracking-widest leading-none translate-y-[1px] ${f.isAvailable ? 'text-white' : 'text-red-500/60 line-through'}`}>{f.text}</span>
                      </div>
                      <button 
                        onClick={() => removeFeature(i)} 
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-error/5 border border-error/20 text-error/60 hover:bg-error hover:text-white hover:border-error transition-all flex items-center justify-center relative group" 
                        title="Delete Feature" 
                        style={{ clipPath: 'polygon(20% 0px, 100% 0px, 100% 80%, 80% 100%, 0px 100%, 0px 20%)' }}
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="flex items-center gap-2 text-[9px] sm:text-[10px] font-heading text-muted/60 uppercase tracking-widest pl-1">
                  <Zap size={14} className="text-yellow-500" /> KEY_FEATURES
                </label>
                <div className="space-y-4">
                  <div className="flex flex-col gap-3">
                    <input 
                      value={keyFeatureInput}
                      onChange={e => setKeyFeatureInput(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-muted/10 uppercase text-white" 
                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 10px, 100% 100%, 0 100%)' }}
                      placeholder="e.g. Live Trading: No"
                    />
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'STANDARD', label: 'BLUE', color: 'bg-accent' },
                        { id: 'UNAVAILABLE', label: 'RED', color: 'bg-red-500' },
                        { id: 'POPULAR', label: 'YELLOW', color: 'bg-yellow-500' },
                        { id: 'SPECIAL', label: 'GREEN', color: 'bg-green-500' }
                      ].map(s => (
                        <button 
                          key={s.id}
                          type="button"
                          onClick={() => setKeyFeatureStatus(s.id as any)}
                          className={`py-2 text-[7px] font-heading font-black tracking-widest uppercase transition-all flex flex-col items-center gap-1 border ${keyFeatureStatus === s.id ? 'border-white/40 bg-white/10 text-white' : 'border-transparent text-muted/40 hover:text-muted'}`}
                        >
                          <div className={`w-2 h-2 rounded-full ${s.color}`}></div>
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={addKeyFeature} className="w-full py-4 bg-white text-black font-heading text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] hover:bg-accent transition-all" style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}>ADD_KEY_FEATURE</button>
                  </div>
                  
                  <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                    {(formData.keyFeatures || []).map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-2 sm:p-3 bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                           <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                             f.status === 'UNAVAILABLE' ? 'bg-red-500' : 
                             f.status === 'POPULAR' ? 'bg-yellow-500' : 
                             f.status === 'SPECIAL' ? 'bg-green-500' : 'bg-accent'
                           }`}></div>
                           <span className="text-[9px] font-heading text-white uppercase tracking-widest truncate">{f.text}</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeKeyFeature(i)} 
                          className="p-2 text-error/40 hover:text-error transition-colors"
                        >
                          <Trash2 size={12}/>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] sm:text-[9px] font-heading text-muted uppercase tracking-widest flex items-center gap-2">
                    <Star size={12} className="text-accent" /> POPULAR_TAG
                  </label>
                  <button 
                    onClick={() => setFormData({...formData, isPopular: !formData.isPopular})}
                    className={`w-full py-3 font-heading text-[8px] sm:text-[9px] tracking-widest font-black uppercase transition-all ${formData.isPopular ? 'bg-yellow-500 text-black' : 'bg-white/5 text-muted hover:bg-white/10'}`}
                    style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                  >
                    {formData.isPopular ? 'POPULAR' : 'STANDARD'}
                  </button>
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
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleSave}
                  className="w-full bg-white text-black py-4 sm:py-5 font-heading text-[9px] sm:text-[10px] font-black tracking-[0.5em] uppercase hover:bg-accent transition-all flex items-center justify-center gap-4 shadow-glow"
                  style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 70%, 95% 100%, 0 100%, 0 30%)' }}
                >
                  <Save size={18} /> {editingId ? 'SYNCHRONIZE_CHANGES' : 'INITIALIZE_PLAN'}
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
          items={localPlans.map(p => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {localPlans.map(p => (
              <SortablePlanItem 
                key={p.id} 
                p={p} 
                startEdit={startEdit} 
                setDeleteTarget={setDeleteTarget} 
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
              await deleteSubscriptionPlan(deleteTarget);
              setDeleteTarget(null);
              addNotification('SUCCESS', 'PURGED', 'Plan node erased from registry.');
            } finally {
              setGlobalLoading(false);
            }
          }
        }}
        title="PURGE_WARNING"
        message="Are you certain you want to erase this subscription plan permanently?"
        confirmLabel="PURGE"
      />
    </div>
  );
};

export default SubscriptionPlanManager;
