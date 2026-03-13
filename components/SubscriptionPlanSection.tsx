
import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useDataStore } from '../store/dataStore';

const SubscriptionPlanSection: React.FC = () => {
  const { subscriptionPlans } = useDataStore();

  if (!subscriptionPlans || subscriptionPlans.length === 0) return null;

  return (
    <section id="pricing" className="min-h-screen flex flex-col justify-center py-16 sm:py-32 px-4 sm:px-6 max-w-[1400px] mx-auto border-b border-white/5 relative snap-start">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 sm:h-32 bg-gradient-to-b from-yellow-500/50 to-transparent"></div>

      <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6 mb-12 sm:mb-24">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-yellow-500/5 border border-yellow-500/20" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 92% 100%, 0 100%)' }}>
          <Zap size={14} className="text-yellow-500 animate-pulse" />
          <span className="text-[10px] font-heading text-yellow-500 tracking-[0.5em] uppercase font-black">SUBSCRIPTIONS</span>
        </div>
        <h2 className="text-4xl sm:text-7xl font-heading font-black uppercase tracking-tighter text-white leading-none">
          PRICING<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200" style={{ WebkitTextStroke: '1px rgba(234,179,8,0.2)' }}>PLANS</span>
        </h2>
        <p className="text-[10px] sm:text-[14px] text-muted text-center max-w-2xl mx-auto uppercase tracking-[0.2em] sm:tracking-[0.3em] leading-relaxed font-medium px-4">
          CHOOSE THE BEST PLAN FOR YOUR TRADING JOURNEY.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
        {subscriptionPlans.map((plan, i) => (
          <div key={i} className={`group relative flex flex-col ${plan.isPopular ? 'z-10' : ''}`}>
            
            {/* Main Card Container with Clip Path */}
            <div className={`relative flex-1 bg-[#050505] border transition-all duration-500 flex flex-col overflow-hidden ${plan.isPopular ? 'border-yellow-500/30 group-hover:border-yellow-500' : 'border-white/10 group-hover:border-white/30'}`} 
                 style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
              
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-yellow-500 text-black px-4 py-1 text-[8px] sm:text-[9px] font-heading font-black uppercase tracking-[0.2em] z-30 shadow-lg" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 10% 100%)' }}>RECOMMENDED</div>
              )}

              {/* Straight Edge Borders */}
              <div className={`absolute top-0 left-[20px] right-0 h-[1px] transition-colors z-20 ${plan.isPopular ? 'bg-yellow-500/20 group-hover:bg-yellow-500/40' : 'bg-white/10 group-hover:bg-white/20'}`}></div>
              <div className={`absolute top-0 right-0 bottom-[20px] w-[1px] transition-colors z-20 ${plan.isPopular ? 'bg-yellow-500/20 group-hover:bg-yellow-500/40' : 'bg-white/10 group-hover:bg-white/20'}`}></div>
              <div className={`absolute bottom-0 right-[20px] left-0 h-[1px] transition-colors z-20 ${plan.isPopular ? 'bg-yellow-500/20 group-hover:bg-yellow-500/40' : 'bg-white/10 group-hover:bg-white/20'}`}></div>
              <div className={`absolute bottom-0 left-0 top-[20px] w-[1px] transition-colors z-20 ${plan.isPopular ? 'bg-yellow-500/20 group-hover:bg-yellow-500/40' : 'bg-white/10 group-hover:bg-white/20'}`}></div>

              <div className="px-4 py-6 sm:p-8 relative z-10 flex flex-col h-full">
                {/* Index Number */}
                <div className="absolute top-4 right-6 sm:top-6 sm:right-8 font-heading text-[40px] sm:text-[60px] font-black text-white/[0.02] group-hover:text-accent/[0.05] transition-colors leading-none select-none">
                  {(i + 1).toString().padStart(2, '0')}
                </div>

                <div className="relative z-10 flex flex-col mb-4 sm:mb-6">
                  <h4 className={`font-heading text-xl sm:text-2xl font-black uppercase tracking-tighter mb-1 ${plan.isPopular ? 'text-yellow-500' : 'text-white'}`}>{plan.name}</h4>
                  <div className="flex items-center gap-2">
                    <Clock size={10} className="text-muted/40" />
                    <p className="text-[8px] sm:text-[9px] text-muted uppercase tracking-[0.2em] font-bold">{plan.durationDays} DAYS DURATION</p>
                  </div>
                </div>

                <div className="mb-6 sm:mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-heading font-black text-white tracking-tighter">${plan.price.toLocaleString('en-US')}</span>
                    <span className="text-[9px] sm:text-[10px] font-heading text-muted uppercase tracking-[0.3em] font-bold">/ {plan.currency}</span>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-10 flex-grow group/desc">
                   <div className="flex items-center gap-2">
                      <div className="h-px w-3 sm:w-4 bg-accent/30"></div>
                      <span className="text-[8px] sm:text-[9px] font-heading text-muted tracking-widest uppercase">Description</span>
                   </div>
                   <p className="w-full text-left text-[10px] sm:text-[11px] text-muted/90 group-hover/desc:text-white transition-colors uppercase tracking-[0.1em] sm:tracking-[0.12em] leading-relaxed font-medium">
                      {plan.description || 'Secure subscription plan for advanced market access.'}
                   </p>
                </div>

                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-10">
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

                <div className="">
                  <Link to="/login" className="w-full">
                    <button 
                      className={`w-full py-4 sm:py-5 font-heading text-[10px] sm:text-[11px] font-black tracking-[0.4em] sm:tracking-[0.5em] uppercase transition-all flex items-center justify-center gap-3 active:scale-95 ${plan.isPopular ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-glow-sm' : 'bg-white text-black hover:bg-accent'}`}
                      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 65%, 88% 100%, 0 100%)' }}
                    >
                      GET STARTED <ArrowRight size={14} className="sm:size-[16px]" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SubscriptionPlanSection;
