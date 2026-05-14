
import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useDataStore } from '../store/dataStore';

const DEFAULT_PLANS = [
  {
    id: 'foundation',
    name: 'Lexonex Foundation',
    subtitle: 'Best for Beginners',
    price: 199,
    currency: 'USD',
    durationDays: 0,
    description: 'A beginner friendly binary trading course built with image based lessons and written explanations. Designed for step-by-step learning in a simple and structured way.',
    features: [
      'Image Based Classes',
      'Beginner Strategies',
      'Market Analysis Basics',
      'Risk Management',
      'Trading Psychology Mastery',
      'Strategy PDF Notes',
      'Basic Support Access'
    ],
    keyFeatures: [
      { text: 'Signals: Limited Weekly', status: 'DEFAULT', isAvailable: true },
      { text: 'Live Trading: No', status: 'UNAVAILABLE', isAvailable: false },
      { text: 'Support: Basic', status: 'DEFAULT', isAvailable: true }
    ],
    isPopular: false
  },
  {
    id: 'ascend',
    name: 'Lexonex Ascend',
    subtitle: 'Best for Structured Learning',
    price: 399,
    currency: 'USD',
    durationDays: 0,
    description: 'A complete video based binary trading course designed for professional step-by-step learning with detailed chart explanations and advanced strategy breakdowns.',
    features: [
      'Everything in Foundation',
      'Full Video Course Library',
      'Advanced Strategy Systems',
      'Advanced Money Management',
      'Premium Community Access',
      'AI Trading Assistant',
      'Priority Support System'
    ],
    keyFeatures: [
      { text: 'Signals: Daily Signals', status: 'POPULAR', isAvailable: true },
      { text: 'Live Trading: Weekly', status: 'POPULAR', isAvailable: true },
      { text: 'Support: Priority', status: 'POPULAR', isAvailable: true }
    ],
    isPopular: true
  },
  {
    id: 'vanguard',
    name: 'Lexonex Vanguard',
    subtitle: 'Best for Professional Live Training',
    price: 799,
    currency: 'USD',
    durationDays: 120,
    description: 'A professional live training program for serious learners. Intensive 4-month program covering advanced execution, strong psychology, and precision entries.',
    features: [
      'Everything in Ascend',
      'Live Interactive Classes',
      '120 Days Program Duration',
      'Advanced Market Analysis',
      'Personal Mentorship',
      'Live Trading 3 Days Week',
      'Ultra Priority Support'
    ],
    keyFeatures: [
      { text: 'Signals: Premium Signals', status: 'SPECIAL', isAvailable: true },
      { text: 'Live Trading: 3/Week', status: 'SPECIAL', isAvailable: true },
      { text: 'Support: Fast Priority', status: 'SPECIAL', isAvailable: true }
    ],
    isPopular: false
  },
  {
    id: 'dominion',
    name: 'Lexonex Dominion',
    subtitle: 'Best for Daily Trading Support',
    price: 299,
    currency: 'USD',
    durationDays: 30,
    description: 'Premium support service for active users wanting daily market guidance, strong signal systems, and consistent trading assistance with professional help.',
    features: [
      'VIP Signal Infrastructure',
      'Daily Live Trading Room',
      'Advanced Market Updates',
      'Risk Management Guard',
      'AI Trading Assistant',
      'Elite Private Group',
      'Dedicated VIP Support'
    ],
    keyFeatures: [
      { text: 'Signals: VIP Instant', status: 'POPULAR', isAvailable: true },
      { text: 'Live Trading: Daily', status: 'POPULAR', isAvailable: true },
      { text: 'Support: Dedicated VIP', status: 'POPULAR', isAvailable: true }
    ],
    isPopular: false
  },
  {
    id: 'sovereign',
    name: 'Lexonex Sovereign',
    subtitle: 'Best for Professional Level Execution',
    price: 499,
    currency: 'USD',
    durationDays: 30,
    description: 'Advanced service built for institutional style execution systems, market behavior understanding, and long-term performance management.',
    features: [
      'Everything in Dominion',
      'Institutional VIP Signals',
      'Institutional Strategy Models',
      'Precision Entry Systems',
      'Advanced Market Analysis',
      'One to One Sessions',
      'Elite Priority Support'
    ],
    keyFeatures: [
      { text: 'Signals: Institutional VIP', status: 'SPECIAL', isAvailable: true },
      { text: 'Live Trading: Daily Advanced', status: 'SPECIAL', isAvailable: true },
      { text: 'Support: Elite Priority', status: 'SPECIAL', isAvailable: true }
    ],
    isPopular: false
  },
  {
    id: 'legacy',
    name: 'Lexonex Legacy',
    subtitle: 'Best for Elite VIP Experience',
    price: 699,
    currency: 'USD',
    durationDays: 30,
    description: 'The most premium experience for users wanting maximum private guidance, elite execution models, and world-class management structures.',
    features: [
      'Everything in Sovereign',
      'Ultra VIP Signals',
      'Unlimited VIP Live Trading',
      'Custom Growth Planning',
      'Private One to One Sessions',
      'Lifetime Premium Updates',
      'Dedicated 24/7 VIP Support'
    ],
    keyFeatures: [
      { text: 'Signals: Ultra Premium', status: 'SPECIAL', isAvailable: true },
      { text: 'Live Trading: Unlimited VIP', status: 'SPECIAL', isAvailable: true },
      { text: 'Support: 24/7 VIP Elite', status: 'SPECIAL', isAvailable: true }
    ],
    isPopular: false
  }
];

const SubscriptionPlanSection: React.FC = () => {
  const { subscriptionPlans } = useDataStore();
  const [selectedVariants, setSelectedVariants] = React.useState<Record<string, string>>({}); // planId -> variantId

  const plansToDisplay = (subscriptionPlans && subscriptionPlans.length > 0) ? subscriptionPlans : DEFAULT_PLANS;

  return (
    <section id="pricing" className="min-h-screen flex flex-col justify-center py-16 sm:py-32 px-4 sm:px-6 max-w-[1400px] mx-auto border-b border-white/5 relative snap-start">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 sm:h-32 bg-gradient-to-b from-yellow-500/50 to-transparent"></div>

      <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6 mb-12 sm:mb-24">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-yellow-500/5 border border-yellow-500/20" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 92% 100%, 0 100%)' }}>
          <Zap size={14} className="text-yellow-500 animate-pulse" />
          <span className="text-[10px] font-heading text-yellow-500 tracking-[0.5em] uppercase font-black">LEGAL SUBSCRIPTIONS</span>
        </div>
        <h2 className="text-4xl sm:text-7xl font-heading font-black uppercase tracking-tighter text-white leading-none">
          SYSTEM<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200" style={{ WebkitTextStroke: '1px rgba(234,179,8,0.2)' }}>ACCESS</span>
        </h2>
        <p className="text-[10px] sm:text-[14px] text-muted text-center max-w-2xl mx-auto uppercase tracking-[0.2em] sm:tracking-[0.3em] leading-relaxed font-medium px-4">
          DEPLOY YOUR TRADING LEGACY WITH THE WORLD'S MOST ADVANCED BINARY NODES.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
        {plansToDisplay.map((plan, i) => {
          const variants = plan.variants || [];
          const selectedVariantId = selectedVariants[plan.id] || (variants.length > 0 ? variants[0].id : null);
          const currentVariant = variants.find(v => v.id === selectedVariantId);
          
          const displayPrice = currentVariant ? currentVariant.price : plan.price;
          const displayDuration = currentVariant ? currentVariant.durationDays : plan.durationDays;

          return (
            <div key={i} className={`group relative flex flex-col ${plan.isPopular ? 'z-10' : ''}`}>
              
              <div className={`relative flex-1 bg-[#050505] border transition-all duration-500 flex flex-col overflow-hidden ${plan.isPopular ? 'border-yellow-500/30 group-hover:border-yellow-500' : 'border-white/10 group-hover:border-white/30'}`} 
                   style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
                
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 bg-yellow-500 text-black px-4 py-1 text-[8px] sm:text-[9px] font-heading font-black uppercase tracking-[0.2em] z-30 shadow-lg" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 10% 100%)' }}>RECOMMENDED</div>
                )}

                <div className="px-4 py-6 sm:p-8 relative z-10 flex flex-col h-full">
                  <div className="absolute top-4 right-6 sm:top-6 sm:right-8 font-heading text-[40px] sm:text-[60px] font-black text-white/[0.02] group-hover:text-accent/[0.05] transition-colors leading-none select-none">
                    {(i + 1).toString().padStart(2, '0')}
                  </div>

                  <div className="relative z-10 flex flex-col mb-4 sm:mb-6">
                    <h4 className={`font-heading text-xl sm:text-2xl font-black uppercase tracking-tighter mb-1 ${plan.isPopular ? 'text-yellow-500' : 'text-white'}`}>{plan.name}</h4>
                    {plan.subtitle && (
                      <p className="text-[10px] sm:text-[11px] text-accent/80 font-heading uppercase tracking-widest mb-2 italic">{plan.subtitle}</p>
                    )}
                    
                    {/* Variant Selector */}
                    {variants.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4 mt-2">
                        {variants.map(v => (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVariants({ ...selectedVariants, [plan.id]: v.id })}
                            className={`px-3 py-1.5 text-[8px] font-heading font-black uppercase tracking-widest transition-all
                              ${selectedVariantId === v.id 
                                ? (plan.isPopular ? 'bg-yellow-500 text-black' : 'bg-accent text-black')
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
                      <span className="text-[9px] sm:text-[10px] font-heading text-muted uppercase tracking-[0.3em] font-bold">/ {plan.currency}</span>
                    </div>
                  </div>

                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 group/desc min-h-[80px]">
                   <div className="flex items-center gap-2">
                      <div className="h-px w-3 sm:w-4 bg-accent/30"></div>
                      <span className="text-[8px] sm:text-[9px] font-heading text-muted tracking-widest uppercase">Description</span>
                   </div>
                   <p className="w-full text-left text-[10px] sm:text-[11px] text-muted/90 group-hover/desc:text-white transition-colors uppercase tracking-[0.1em] sm:tracking-[0.12em] leading-relaxed font-medium line-clamp-3">
                      {plan.description || 'Secure subscription plan for advanced market access.'}
                   </p>
                </div>

                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-grow overflow-y-auto custom-scrollbar min-h-[220px] max-h-[220px] -mx-2 px-2 scroll-smooth">
                  {(plan.features || []).map((feat, fidx) => {
                    const feature = typeof feat === 'string' ? { text: feat, isAvailable: true } : feat;
                    return (
                      <div key={fidx} className={`flex items-center gap-3 sm:gap-4 group/item ${!feature.isAvailable ? 'opacity-60' : ''}`}>
                        <div className={`shrink-0 transition-transform group-hover/item:scale-125 ${!feature.isAvailable ? 'text-red-500' : (plan.isPopular ? 'text-yellow-500' : 'text-accent')}`}>
                          {feature.isAvailable ? <CheckCircle size={14} className="sm:size-[16px]" /> : <XCircle size={14} className="sm:size-[16px]" />}
                        </div>
                        <span className={`text-[10px] sm:text-[11px] uppercase tracking-widest leading-none transition-colors translate-y-[1px] ${feature.isAvailable ? 'text-white/60 group-hover/item:text-white' : 'text-red-500/80 line-through'}`}>
                          {feature.text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Key Features Bottom Section */}
                <div className="mt-auto">
                  {(plan.keyFeatures && plan.keyFeatures.length > 0) ? (
                    <div className="mb-8 p-4 bg-white/[0.02] border border-white/5 space-y-4 min-h-[140px]">
                      <div className="flex items-center gap-2">
                         <Zap size={12} className="text-yellow-500" />
                         <span className="text-[8px] font-heading text-muted tracking-[0.2em] uppercase font-bold">Key Performance Indicators</span>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {plan.keyFeatures.map((f, kfidx) => {
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
                  
                  <div className="">
                    <Link to="/login" className="w-full">
                      <button 
                        className={`w-full py-4 sm:py-5 font-heading text-[10px] sm:text-[11px] font-black tracking-[0.4em] sm:tracking-[0.5em] uppercase transition-all flex items-center justify-center gap-3 active:scale-95 ${plan.isPopular ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-glow-sm' : 'bg-white text-black hover:bg-accent'}`}
                        style={{ clipPath: 'polygon(0px 0px, 100% 0px, 100% 65%, 88% 100%, 0px 100%)' }}
                      >
                        GET STARTED <ArrowRight size={14} className="sm:size-[16px]" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
    </section>
  );
};

export default SubscriptionPlanSection;
