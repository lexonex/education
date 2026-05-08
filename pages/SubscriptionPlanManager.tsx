
import React, { useState, useEffect } from 'react';
import { useDataStore } from '../store/dataStore';
import { useUIStore } from '../store/uiStore';
import { SubscriptionPlan, SubscriptionFeature, SubscriptionVariant } from '../types';
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
  ArrowRight,
  ChevronUp,
  ChevronDown
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
  index,
  startEdit, 
  setDeleteTarget 
}: { 
  p: SubscriptionPlan, 
  index: number,
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

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    p.variants && p.variants.length > 0 ? p.variants[0].id : null
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  const currentVariant = p.variants?.find(v => v.id === selectedVariantId);
  const displayPrice = currentVariant ? currentVariant.price : p.price;
  const displayDuration = currentVariant ? currentVariant.durationDays : p.durationDays;
  const displayLabel = currentVariant ? currentVariant.label : null;

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

      <div className={`relative flex-1 bg-[#050505] border transition-all duration-500 flex flex-col overflow-hidden ${p.isPopular ? 'border-yellow-500/30 group-hover:border-yellow-500' : 'border-white/10 group-hover:border-white/30'}`} 
           style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
        
        {p.isPopular && (
          <div className="absolute top-0 right-0 bg-yellow-500 text-black px-4 py-1 text-[8px] sm:text-[9px] font-heading font-black uppercase tracking-[0.2em] z-30 shadow-lg" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 10% 100%)' }}>RECOMMENDED</div>
        )}

        <div className="px-4 py-6 sm:p-8 relative z-10 flex flex-col h-full">
          {/* Index Number */}
          <div className="absolute top-4 right-6 sm:top-6 sm:right-8 font-heading text-[40px] sm:text-[60px] font-black text-white/[0.02] group-hover:text-accent/[0.05] transition-colors leading-none select-none">
            {(index + 1).toString().padStart(2, '0')}
          </div>

          <div className="relative z-10 flex flex-col mb-4 sm:mb-6">
            <h4 className={`font-heading text-xl sm:text-2xl font-black uppercase tracking-tighter mb-1 ${p.isPopular ? 'text-yellow-500' : 'text-white'}`}>{p.name}</h4>
            {p.subtitle && (
              <p className="text-[10px] sm:text-[11px] text-accent/80 font-heading uppercase tracking-widest mb-2 italic">{p.subtitle}</p>
            )}
            
            {/* Variant Selector */}
            {p.variants && p.variants.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4 mt-2">
                {p.variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`px-3 py-1.5 text-[8px] font-heading font-black uppercase tracking-widest transition-all
                      ${selectedVariantId === v.id 
                        ? (p.isPopular ? 'bg-yellow-500 text-black' : 'bg-accent text-black')
                        : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'
                      }`}
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)' }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Clock size={10} className="text-muted/40" />
              <p className="text-[8px] sm:text-[9px] text-muted uppercase tracking-[0.2em] font-bold">
                {displayDuration === 0 ? 'LIFETIME ACCESS' : `${displayDuration} DAYS DURATION`}
              </p>
            </div>
          </div>

          <div className="mb-6 sm:mb-8 text-left">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-heading font-black text-white tracking-tighter">${(Number(displayPrice) || 0).toLocaleString('en-US')}</span>
              <span className="text-[9px] sm:text-[10px] font-heading text-muted uppercase tracking-[0.3em] font-bold">/ {p.currency}</span>
            </div>
          </div>


          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 group/desc min-h-[80px]">
             <div className="flex items-center gap-2">
                <div className="h-px w-3 sm:w-4 bg-accent/30"></div>
                <span className="text-[8px] sm:text-[9px] font-heading text-muted tracking-widest uppercase">Description</span>
             </div>
             <p className="w-full text-left text-[10px] sm:text-[11px] text-muted/90 group-hover/desc:text-white transition-colors uppercase tracking-[0.1em] sm:tracking-[0.12em] leading-relaxed font-medium line-clamp-3">
                {p.description || 'Secure subscription plan for advanced market access.'}
             </p>
          </div>

          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-grow overflow-y-auto custom-scrollbar min-h-[220px] max-h-[220px] -mx-2 px-2 scroll-smooth">
            {(p.features || []).map((feat, fidx) => {
              const feature = typeof feat === 'string' ? { text: feat, isAvailable: true } : feat;
              return (
                <div key={fidx} className={`flex items-center gap-3 sm:gap-4 group/item ${!feature.isAvailable ? 'opacity-60' : ''}`}>
                  <div className={`shrink-0 transition-transform group-hover/item:scale-125 ${!feature.isAvailable ? 'text-red-500' : (p.isPopular ? 'text-yellow-500' : 'text-accent')}`}>
                    {feature.isAvailable ? <CheckCircle size={14} className="sm:size-[16px]" /> : <XCircle size={14} className="sm:size-[16px]" />}
                  </div>
                  <span className={`text-[10px] sm:text-[11px] uppercase tracking-widest leading-none transition-colors translate-y-[1px] ${feature.isAvailable ? 'text-white/60 group-hover/item:text-white' : 'text-red-500/80 line-through'}`}>
                    {feature.text}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-auto">
            {(p.keyFeatures && p.keyFeatures.length > 0) ? (
              <div className="mb-8 p-4 bg-white/[0.02] border border-white/5 space-y-4 min-h-[140px]">
                <div className="flex items-center gap-2">
                   <Zap size={12} className="text-yellow-500" />
                   <span className="text-[8px] font-heading text-muted tracking-[0.2em] uppercase font-bold">Key Performance Indicators</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {p.keyFeatures.map((f, kfidx) => {
                    const statusColor = f.status === 'UNAVAILABLE' ? 'text-red-500' : 
                                      f.status === 'POPULAR' ? 'text-yellow-500' : 
                                      f.status === 'SPECIAL' ? 'text-green-500' : 'text-accent';
                    
                    const parts = f.text.includes(':') ? f.text.split(':') : [f.text, f.isAvailable ? 'Yes' : 'No'];
                    
                    return (
                      <div key={kfidx} className="flex items-center justify-between group/kf transition-all hover:bg-white/[0.02] -mx-1 px-1 py-0.5">
                         <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.1em] text-white/40 group-hover/kf:text-white transition-colors">{parts[0]}</span>
                         <div className="flex items-center gap-2">
                           <div className={`w-1 h-1 rounded-full animate-pulse ${statusColor.replace('text-', 'bg-')}`}></div>
                           <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest ${statusColor}`}>
                             {parts[1]}
                           </span>
                         </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mb-8 min-h-[140px]"></div>
            )}
          </div>

          <div className="">
            <button 
              disabled
              className={`w-full py-4 sm:py-5 font-heading text-[10px] sm:text-[11px] font-black tracking-[0.4em] sm:tracking-[0.5em] uppercase transition-all flex items-center justify-center gap-3 active:scale-95 opacity-50 cursor-not-allowed ${p.isPopular ? 'bg-yellow-500 text-black shadow-glow-sm' : 'bg-white text-black'}`}
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 65%, 88% 100%, 0 100%)' }}
            >
              PURCHASE_PREVIEW <ArrowRight size={14} className="sm:size-[16px]" />
            </button>
          </div>
        </div>
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
  
  const formRef = React.useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if ((isAdding || editingId) && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [isAdding, editingId]);

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
    variants: [] as SubscriptionVariant[],
    features: [] as SubscriptionFeature[],
    keyFeatures: [] as SubscriptionFeature[],
    description: '',
    isPopular: false,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  const [variantInput, setVariantInput] = useState({
    label: '',
    price: '',
    durationDays: '',
    isLifetime: false
  });

  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);

  const [featureInput, setFeatureInput] = useState('');
  const [keyFeatureInput, setKeyFeatureInput] = useState('');
  const [keyFeatureStatus, setKeyFeatureStatus] = useState<'STANDARD' | 'POPULAR' | 'UNAVAILABLE' | 'SPECIAL'>('STANDARD');
  
  const [editingFeatureIdx, setEditingFeatureIdx] = useState<number | null>(null);
  const [editingFeatureText, setEditingFeatureText] = useState('');
  
  const [editingKeyFeatureIdx, setEditingKeyFeatureIdx] = useState<number | null>(null);
  const [editingKeyFeatureText, setEditingKeyFeatureText] = useState('');
  const [editingKeyFeatureStatus, setEditingKeyFeatureStatus] = useState<'STANDARD' | 'POPULAR' | 'UNAVAILABLE' | 'SPECIAL'>('STANDARD');

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
    const hasPrice = formData.price !== '' || formData.variants.length > 0;
    if (!formData.name || !hasPrice) {
      addNotification('ERROR', 'MISSING_DATA', 'Please fill Name and Price.');
      return;
    }

    const planData = {
      ...formData,
      price: formData.variants.length > 0 ? Number(formData.variants[0].price) : (Number(formData.price) || 0),
      durationDays: formData.variants.length > 0 ? Number(formData.variants[0].durationDays) : (Number(formData.durationDays) || 0),
      variants: formData.variants
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
      variants: [],
      features: [],
      keyFeatures: [],
      description: '',
      isPopular: false,
      status: 'ACTIVE'
    });
    setFeatureInput('');
    setKeyFeatureInput('');
    setKeyFeatureStatus('STANDARD');
    setEditingFeatureIdx(null);
    setEditingFeatureText('');
    setEditingKeyFeatureIdx(null);
    setEditingKeyFeatureText('');
    setIsAdding(false);
    setEditingId(null);
  };

  const loadStarterTemplate = () => {
    setFormData({
      name: 'Starter Plan',
      subtitle: 'Best for beginners',
      price: '25', // Fallback base price
      currency: 'USD',
      durationDays: '30', // Fallback duration
      description: 'Best for beginners starting their trading journey.',
      isPopular: false,
      status: 'ACTIVE',
      variants: [
        { id: `VAR-1-${Date.now()}`, label: '1 MONTH', price: 25, durationDays: 30 },
        { id: `VAR-2-${Date.now()}`, label: '3 MONTHS', price: 65, durationDays: 90 },
        { id: `VAR-3-${Date.now()}`, label: '1 YEAR', price: 220, durationDays: 365 }
      ],
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
      variants: p.variants || [],
      features: normalizedFeatures,
      keyFeatures: normalizedKeyFeatures,
      description: p.description,
      isPopular: p.isPopular,
      status: p.status
    });
    setEditingId(p.id);
    setIsAdding(true);
  };

  const addVariant = () => {
    if (variantInput.label && variantInput.price && (variantInput.isLifetime || variantInput.durationDays)) {
      if (editingVariantId) {
        setFormData({
          ...formData,
          variants: formData.variants.map(v => v.id === editingVariantId ? {
            ...v,
            label: variantInput.label,
            price: Number(variantInput.price),
            durationDays: variantInput.isLifetime ? 0 : Number(variantInput.durationDays)
          } : v)
        });
        setEditingVariantId(null);
      } else {
        const newVariant = {
          id: `VAR-${Date.now()}`,
          label: variantInput.label,
          price: Number(variantInput.price),
          durationDays: variantInput.isLifetime ? 0 : Number(variantInput.durationDays)
        };
        setFormData({
          ...formData,
          variants: [...formData.variants, newVariant]
        });
      }
      setVariantInput({ label: '', price: '', durationDays: '', isLifetime: false });
    } else {
      addNotification('ERROR', 'INVALID_VARIANT', 'Please fill all variant fields.');
    }
  };

  const startEditVariant = (v: SubscriptionVariant) => {
    setEditingVariantId(v.id);
    setVariantInput({
      label: v.label,
      price: v.price.toString(),
      durationDays: v.durationDays === 0 ? '' : v.durationDays.toString(),
      isLifetime: v.durationDays === 0
    });
  };

  const cancelEditVariant = () => {
    setEditingVariantId(null);
    setVariantInput({ label: '', price: '', durationDays: '', isLifetime: false });
  };

  const removeVariant = (id: string) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter(v => v.id !== id)
    });
  };

  const moveVariant = (idx: number, direction: 'UP' | 'DOWN') => {
    const newIdx = direction === 'UP' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= formData.variants.length) return;
    const newVariants = [...formData.variants];
    [newVariants[idx], newVariants[newIdx]] = [newVariants[newIdx], newVariants[idx]];
    setFormData({ ...formData, variants: newVariants });
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

  const moveFeature = (idx: number, direction: 'UP' | 'DOWN') => {
    const newIdx = direction === 'UP' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= formData.features.length) return;
    const newFeatures = [...formData.features];
    [newFeatures[idx], newFeatures[newIdx]] = [newFeatures[newIdx], newFeatures[idx]];
    setFormData({ ...formData, features: newFeatures });
  };

  const moveKeyFeature = (idx: number, direction: 'UP' | 'DOWN') => {
    const newIdx = direction === 'UP' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= formData.keyFeatures.length) return;
    const newKeyFeatures = [...formData.keyFeatures];
    [newKeyFeatures[idx], newKeyFeatures[newIdx]] = [newKeyFeatures[newIdx], newKeyFeatures[idx]];
    setFormData({ ...formData, keyFeatures: newKeyFeatures });
  };

  const startEditFeature = (idx: number, text: string) => {
    setEditingFeatureIdx(idx);
    setEditingFeatureText(text);
  };

  const saveFeatureEdit = (idx: number) => {
    if (editingFeatureText.trim()) {
      const newFeatures = [...formData.features];
      newFeatures[idx] = { ...newFeatures[idx], text: editingFeatureText.trim() };
      setFormData({ ...formData, features: newFeatures });
      setEditingFeatureIdx(null);
      setEditingFeatureText('');
    }
  };

  const startEditKeyFeature = (idx: number, f: SubscriptionFeature) => {
    setEditingKeyFeatureIdx(idx);
    setEditingKeyFeatureText(f.text);
    setEditingKeyFeatureStatus(f.status || 'STANDARD');
  };

  const saveKeyFeatureEdit = (idx: number) => {
    if (editingKeyFeatureText.trim()) {
      const newKeyFeatures = [...formData.keyFeatures];
      newKeyFeatures[idx] = { 
        ...newKeyFeatures[idx], 
        text: editingKeyFeatureText.trim(),
        status: editingKeyFeatureStatus 
      };
      setFormData({ ...formData, keyFeatures: newKeyFeatures });
      setEditingKeyFeatureIdx(null);
      setEditingKeyFeatureText('');
    }
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

      {(isAdding || editingId) && (
        <div ref={formRef} className="relative z-20 bg-[#050505] border border-white/10 p-6 sm:p-10 mb-12 animate-in slide-in-from-top-4 duration-500 shadow-glow-sm scroll-mt-20"
             style={{ clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)' }}>
          
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                   <Activity size={20} className="animate-pulse" />
                </div>
                <h3 className="font-heading text-lg font-black text-white uppercase tracking-[0.2em]">
                   {editingId ? 'PLAN_RECONFIGURATION' : 'INITIALIZE_NEW_PLAN'}
                </h3>
             </div>
             <button onClick={resetForm} className="p-2 text-muted hover:text-white transition-colors" title="Close Panel">
                <X size={20} />
             </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16">
            <div className="space-y-8">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2.5 group">
                  <label className="text-[9px] font-heading text-muted/60 uppercase tracking-widest pl-1">NAME</label>
                  <input 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/10 p-4 text-[11px] font-heading outline-none focus:border-accent/50 text-white uppercase"
                    placeholder="PLAN_NAME"
                  />
                </div>
                <div className="space-y-2.5 group">
                  <label className="text-[9px] font-heading text-muted/60 uppercase tracking-widest pl-1">SUBTITLE</label>
                  <input 
                    value={formData.subtitle}
                    onChange={e => setFormData({...formData, subtitle: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/10 p-4 text-[11px] font-heading outline-none focus:border-accent/50 text-white uppercase"
                    placeholder="DESCRIPTOR"
                  />
                </div>
              </div>

              <div className="space-y-2.5 group">
                <label className="text-[9px] font-heading text-muted/60 uppercase tracking-widest pl-1">DESCRIPTION</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/[0.03] border border-white/10 p-4 text-[11px] font-heading outline-none focus:border-accent/50 text-white uppercase resize-none"
                  placeholder="EXECUTIVE_SUMMARY"
                />
              </div>

              {/* Variants Manager */}
              <div className="space-y-6 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-heading text-accent font-black uppercase tracking-widest">TIME_VARIANTS</p>
                   {editingVariantId && (
                     <button onClick={cancelEditVariant} className="text-[8px] font-heading text-error uppercase tracking-widest hover:underline">CANCEL_EDIT</button>
                   )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                   <div className="space-y-1">
                      <label className="text-[7px] font-heading text-muted uppercase tracking-[0.2em] pl-1">LABEL</label>
                      <input 
                        placeholder="e.g. 1 MO"
                        value={variantInput.label}
                        onChange={e => setVariantInput({...variantInput, label: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 p-3 text-[10px] font-heading outline-none focus:border-accent/50 text-white uppercase"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[7px] font-heading text-muted uppercase tracking-[0.2em] pl-1">PRICE</label>
                      <div className="relative">
                        <input 
                          type="number"
                          placeholder="PRICE"
                          value={variantInput.price}
                          onChange={e => setVariantInput({...variantInput, price: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 p-3 text-[10px] font-heading outline-none focus:border-accent/50 text-white"
                        />
                        <DollarSign size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/30" />
                      </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[7px] font-heading text-muted uppercase tracking-[0.2em] pl-1">DURATION (DAYS)</label>
                      <div className="relative">
                        <input 
                          type="number"
                          placeholder="DAYS"
                          disabled={variantInput.isLifetime}
                          value={variantInput.isLifetime ? '' : variantInput.durationDays}
                          onChange={e => setVariantInput({...variantInput, durationDays: e.target.value})}
                          className={`w-full bg-white/5 border border-white/10 p-3 text-[10px] font-heading outline-none focus:border-accent/50 text-white ${variantInput.isLifetime ? 'opacity-30' : ''}`}
                        />
                        <Clock size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/30" />
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                     <div className={`w-10 h-5 border border-white/10 relative transition-all ${variantInput.isLifetime ? 'bg-accent' : 'bg-black'}`}>
                        <input type="checkbox" className="hidden" checked={variantInput.isLifetime} onChange={e => setVariantInput({...variantInput, isLifetime: e.target.checked})} />
                        <div className={`absolute top-0.5 bottom-0.5 w-3.5 bg-white transition-all ${variantInput.isLifetime ? 'right-0.5' : 'left-0.5'}`}></div>
                     </div>
                     <span className="text-[8px] font-heading text-muted uppercase tracking-widest">LIFETIME_BYPASS</span>
                  </label>
                  <button onClick={addVariant} className="px-6 py-3 bg-white text-black font-heading text-[9px] font-black uppercase tracking-widest hover:bg-accent transition-all active:scale-95">
                    {editingVariantId ? 'UPDATE_VARIANT' : 'ADD_VARIANT'}
                  </button>
                </div>

                <div className="space-y-2 mt-4 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                   {formData.variants.map((v, idx) => (
                     <div key={v.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 group/v">
                        <div className="flex items-center gap-4">
                           <div className="flex flex-col gap-0.5">
                              <button onClick={() => moveVariant(idx, 'UP')} disabled={idx === 0} className="text-white/10 hover:text-accent disabled:opacity-0"><ChevronUp size={10}/></button>
                              <button onClick={() => moveVariant(idx, 'DOWN')} disabled={idx === formData.variants.length - 1} className="text-white/10 hover:text-accent disabled:opacity-0"><ChevronDown size={10}/></button>
                           </div>
                           <span className="text-[10px] font-heading text-white uppercase">{v.label}</span>
                           <span className="text-[10px] font-heading text-accent">${v.price}</span>
                           <span className="text-[8px] font-heading text-muted/60 uppercase">{v.durationDays === 0 ? 'LIFETIME' : `${v.durationDays}d`}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <button onClick={() => startEditVariant(v)} className="p-1.5 text-muted hover:text-accent transition-colors" title="Edit Variant"><Edit3 size={12}/></button>
                           <button onClick={() => removeVariant(v.id)} className="p-1.5 text-muted hover:text-error transition-colors" title="Remove Variant"><Trash2 size={12}/></button>
                        </div>
                     </div>
                   ))}
                   {formData.variants.length === 0 && (
                     <div className="py-6 border border-dashed border-white/5 flex flex-col items-center justify-center opacity-20">
                        <Clock size={20} className="mb-2" />
                        <p className="text-[8px] font-heading uppercase tracking-widest">NO_VARIANTS_DEFINED</p>
                     </div>
                   )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
               {/* Features */}
               <div className="space-y-4">
                  <label className="text-[10px] font-heading text-accent font-black uppercase tracking-widest pl-1">FEATURE_PROTOCOL</label>
                  <div className="flex gap-2">
                    <input 
                      value={featureInput}
                      onChange={e => setFeatureInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addFeature()}
                      className="flex-1 bg-white/[0.03] border border-white/10 p-4 text-[11px] font-heading outline-none focus:border-accent/50 text-white uppercase"
                      placeholder="NEW_CAPABILITY"
                    />
                    <button onClick={addFeature} className="px-6 bg-white text-black font-heading text-[9px] font-black uppercase tracking-widest hover:bg-accent transition-all">ADD</button>
                  </div>
                  <div className="max-h-[150px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
                     {formData.features.map((f, i) => (
                       <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5">
                          <div className="flex items-center gap-2 overflow-hidden mr-2">
                             <div className="flex flex-col gap-0.5">
                                <button onClick={() => moveFeature(i, 'UP')} disabled={i === 0} className="text-white/5 hover:text-accent disabled:opacity-0"><ChevronUp size={10}/></button>
                                <button onClick={() => moveFeature(i, 'DOWN')} disabled={i === formData.features.length - 1} className="text-white/5 hover:text-accent disabled:opacity-0"><ChevronDown size={10}/></button>
                             </div>
                             <button onClick={() => toggleFeatureAvailability(i)} className={f.isAvailable ? 'text-accent' : 'text-error'} title="Toggle Status">
                                {f.isAvailable ? <Check size={14}/> : <X size={14}/>}
                             </button>
                             {editingFeatureIdx === i ? (
                               <input 
                                 autoFocus
                                 value={editingFeatureText}
                                 onChange={e => setEditingFeatureText(e.target.value)}
                                 onBlur={() => saveFeatureEdit(i)}
                                 onKeyDown={e => e.key === 'Enter' && saveFeatureEdit(i)}
                                 className="flex-1 bg-white/10 border-b border-accent text-[9px] font-heading text-white uppercase outline-none px-1"
                               />
                             ) : (
                               <span 
                                 onClick={() => startEditFeature(i, f.text)}
                                 className={`text-[9px] font-heading uppercase truncate cursor-pointer hover:text-white transition-colors ${f.isAvailable ? 'text-white/70' : 'text-muted/40 line-through'}`}>
                                 {f.text}
                               </span>
                             )}
                          </div>
                          <button onClick={() => removeFeature(i)} className="text-muted/40 hover:text-error shrink-0"><Trash2 size={12}/></button>
                       </div>
                     ))}
                  </div>
               </div>

               {/* Key Metrics */}
               <div className="space-y-4">
                  <label className="text-[10px] font-heading text-yellow-500 font-black uppercase tracking-widest pl-1">KPI_CONFIGURATION</label>
                  <div className="space-y-3">
                    <input 
                      value={keyFeatureInput}
                      onChange={e => setKeyFeatureInput(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 p-4 text-[11px] font-heading outline-none focus:border-accent/50 text-white uppercase"
                      placeholder="e.g. LIVE_TRADING: NO"
                    />
                    <div className="flex items-center justify-between gap-4">
                       <div className="flex gap-1">
                          {['STANDARD', 'POPULAR', 'UNAVAILABLE', 'SPECIAL'].map(s => (
                            <button 
                              key={s} 
                              onClick={() => setKeyFeatureStatus(s as any)}
                              className={`w-8 h-8 border transition-all flex items-center justify-center ${keyFeatureStatus === s ? 'border-white/40 bg-white/10' : 'border-white/5'}`}
                              title={s}
                            >
                               <div className={`w-2 h-2 rounded-full ${
                                 s === 'STANDARD' ? 'bg-accent' : 
                                 s === 'POPULAR' ? 'bg-yellow-500' : 
                                 s === 'UNAVAILABLE' ? 'bg-red-500' : 'bg-green-500'
                               }`}></div>
                            </button>
                          ))}
                       </div>
                       <button onClick={addKeyFeature} className="px-6 py-3 bg-white text-black font-heading text-[9px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-all">ADD_KPI</button>
                    </div>
                  </div>
                  <div className="max-h-[150px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
                     {formData.keyFeatures.map((f, i) => (
                       <div key={i} className={`flex items-center justify-between p-3 bg-white/[0.02] border ${editingKeyFeatureIdx === i ? 'border-accent/40' : 'border-white/5'}`}>
                          <div className="flex items-center gap-3 overflow-hidden mr-2">
                             <div className="flex flex-col gap-0.5">
                                <button onClick={() => moveKeyFeature(i, 'UP')} disabled={i === 0} className="text-white/5 hover:text-accent disabled:opacity-0"><ChevronUp size={10}/></button>
                                <button onClick={() => moveKeyFeature(i, 'DOWN')} disabled={i === formData.keyFeatures.length - 1} className="text-white/5 hover:text-accent disabled:opacity-0"><ChevronDown size={10}/></button>
                             </div>
                             <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                               f.status === 'UNAVAILABLE' ? 'bg-red-500' : 
                               f.status === 'POPULAR' ? 'bg-yellow-500' : 
                               f.status === 'SPECIAL' ? 'bg-green-500' : 'bg-accent'
                             }`}></div>
                             
                             {editingKeyFeatureIdx === i ? (
                               <div className="flex items-center gap-2 flex-1">
                                 <input 
                                    autoFocus
                                    value={editingKeyFeatureText}
                                    onChange={e => setEditingKeyFeatureText(e.target.value)}
                                    className="flex-1 bg-white/10 border-b border-accent text-[9px] font-heading text-white uppercase outline-none px-1"
                                 />
                                 <div className="flex gap-1">
                                    {['STANDARD', 'POPULAR', 'UNAVAILABLE', 'SPECIAL'].map(s => (
                                      <button 
                                        key={s} 
                                        onClick={() => setEditingKeyFeatureStatus(s as any)}
                                        className={`w-4 h-4 border transition-all flex items-center justify-center ${editingKeyFeatureStatus === s ? 'border-white/40 bg-white/10' : 'border-white/5'}`}
                                      >
                                         <div className={`w-1 h-1 rounded-full ${
                                           s === 'STANDARD' ? 'bg-accent' : 
                                           s === 'POPULAR' ? 'bg-yellow-500' : 
                                           s === 'UNAVAILABLE' ? 'bg-red-500' : 'bg-green-500'
                                         }`}></div>
                                      </button>
                                    ))}
                                 </div>
                                 <button onClick={() => saveKeyFeatureEdit(i)} className="text-accent underline text-[7px] font-heading uppercase">SAVE</button>
                               </div>
                             ) : (
                               <span 
                                 onClick={() => startEditKeyFeature(i, f)}
                                 className="text-[9px] font-heading text-white/70 uppercase truncate cursor-pointer hover:text-white transition-colors">
                                 {f.text}
                               </span>
                             )}
                          </div>
                          <div className="flex items-center gap-1">
                             {editingKeyFeatureIdx === i ? (
                               <button onClick={() => setEditingKeyFeatureIdx(null)} className="text-muted/40 hover:text-white"><X size={10}/></button>
                             ) : (
                               <button onClick={() => removeKeyFeature(i)} className="text-muted/40 hover:text-error"><Trash2 size={12}/></button>
                             )}
                          </div>
                       </div>
                     ))}
                  </div>
               </div>

               {/* Command Actions */}
               <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-white/5">
                  <label className="flex items-center gap-3 cursor-pointer group">
                     <div className={`w-12 h-6 border border-white/10 relative transition-all ${formData.isPopular ? 'bg-yellow-500' : 'bg-black'}`}>
                        <input type="checkbox" className="hidden" checked={formData.isPopular} onChange={e => setFormData({...formData, isPopular: e.target.checked})} />
                        <div className={`absolute top-0.5 bottom-0.5 w-4 bg-white transition-all ${formData.isPopular ? 'right-0.5' : 'left-0.5'}`}></div>
                     </div>
                     <span className="text-[9px] font-heading text-muted uppercase tracking-[0.2em]">RECOMMENDED</span>
                  </label>

                  <div className="flex items-center gap-4">
                     <button onClick={resetForm} className="px-6 py-4 border border-white/10 text-muted font-heading text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">ABORT</button>
                     <button onClick={handleSave} className="px-8 py-4 bg-accent text-black font-heading text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-3 active:scale-95 shadow-glow-sm">
                        <Save size={16}/> {editingId ? 'SYNC_NODE' : 'INITIALIZE'}
                     </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 pb-20 mt-12">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={localPlans.map(p => p.id)}
            strategy={verticalListSortingStrategy}
          >
            {localPlans.map((p, i) => (
              <SortablePlanItem 
                key={p.id} 
                p={p} 
                index={i}
                startEdit={startEdit}
                setDeleteTarget={setDeleteTarget}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <ConfirmDialog 
        isOpen={!!deleteTarget}
        title="DELETE_PLAN_PROTOCOL"
        message="This operation is irreversible. All linked subscriptions will require manual node redirection. Confirm extraction?"
        confirmLabel="CONFIRM_DELETE"
        cancelLabel="ABORT"
        onConfirm={async () => {
          if (deleteTarget) {
            setGlobalLoading(true);
            try {
              await deleteSubscriptionPlan(deleteTarget);
              setDeleteTarget(null);
              addNotification('SUCCESS', 'PURGED', 'Plan node erased from registry.');
            } catch (err) {
              addNotification('ERROR', 'SYS_ERR', 'Extraction failure detected.');
            } finally {
              setGlobalLoading(false);
            }
          }
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default SubscriptionPlanManager;
