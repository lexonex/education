
import React from 'react';
import { useDataStore } from '../store/dataStore';
import { Globe, ArrowRight } from 'lucide-react';

const AccountRegistrationSection: React.FC = () => {
  const { tradingPlatforms, trackPlatformClick } = useDataStore();

  if (!tradingPlatforms || tradingPlatforms.length === 0) return null;

  return (
    <section id="account_open" className="min-h-screen flex flex-col justify-center py-16 sm:py-32 px-4 sm:px-6 max-w-[1400px] mx-auto border-b border-white/5 relative snap-start">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 sm:h-32 bg-gradient-to-b from-accent/50 to-transparent"></div>
      
      <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6 mb-12 sm:mb-24">
         <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-accent/5 border border-accent/20" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 92% 100%, 0 100%)' }}>
            <Globe size={14} className="text-accent animate-pulse" />
            <span className="text-[10px] font-heading text-accent tracking-[0.5em] uppercase font-black">GLOBAL_GATEWAYS</span>
         </div>
         <h2 className="text-4xl sm:text-7xl font-heading font-black uppercase tracking-tighter text-white leading-none">
            REGISTER<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent/40" style={{ WebkitTextStroke: '1px rgba(0,240,255,0.2)' }}>ACCOUNT</span>
         </h2>
          <p className="text-[10px] sm:text-[14px] text-muted text-center uppercase tracking-[0.2em] sm:tracking-[0.3em] leading-relaxed font-medium px-4 max-w-2xl mx-auto">
            EXPLORE THE TRADING PLATFORMS LISTED BELOW. CHOOSE YOUR PLATFORM AND ACCESS THE TOOLS AND FEATURES NEEDED TO START TRADING IN THE FINANCIAL MARKETS.
          </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
         {tradingPlatforms.map((p, i) => (
            <div key={p.id} className={`group relative ${p.isPopular ? 'z-10' : ''}`}>
              {/* Main Card Container with Clip Path */}
              <div className={`relative bg-[#050505] group transition-all duration-500 flex flex-col flex-1 overflow-hidden border-[0.5px] ${p.isPopular ? 'border-yellow-500/30 group-hover:border-yellow-500' : 'border-white/10 group-hover:border-white/30'}`} 
                   style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
                 
                 {p.isPopular && (
                   <div className="absolute top-0 right-0 bg-yellow-500 text-black px-4 py-1 text-[8px] sm:text-[9px] font-heading font-black uppercase tracking-[0.2em] z-30 shadow-lg" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 10% 100%)' }}>POPULAR</div>
                 )}


                 
                 <div className="p-6 sm:p-8 relative z-10 flex flex-col h-full">
                    <div className={`absolute top-4 right-6 sm:top-6 sm:right-8 font-heading text-[40px] sm:text-[60px] font-black transition-colors leading-none select-none ${
                       p.isPopular 
                         ? 'text-yellow-500/[0.02] group-hover:text-yellow-500/[0.05]' 
                         : 'text-white/[0.02] group-hover:text-accent/[0.05]'
                    }`}>
                       {(i + 1).toString().padStart(2, '0')}
                    </div>

                    <div className="flex items-start justify-between mb-6 sm:mb-8">
                       <div className="flex items-center gap-4 sm:gap-5">
                          <div className="relative">
                             <div className="absolute -inset-2 bg-accent/5 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                             <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-black border flex items-center justify-center relative z-10 transition-colors ${p.isPopular ? 'border-yellow-500/30 group-hover:border-yellow-500' : 'border-white/10 group-hover:border-accent/30'}`}>
                                <img 
                                  src={`https://www.google.com/s2/favicons?domain=${new URL(p.url.startsWith('http') ? p.url : `https://${p.url}`).hostname}&sz=128`} 
                                  className="w-6 h-6 sm:w-8 sm:h-8 object-contain transition-all duration-500" 
                                  alt={p.name} 
                                  referrerPolicy="no-referrer"
                                />
                             </div>
                          </div>
                          <div className="space-y-1">
                             <h4 className={`font-heading text-xl sm:text-2xl font-black uppercase tracking-tight transition-colors ${p.isPopular ? 'text-yellow-500' : 'text-white group-hover:text-accent'}`}>{p.name}</h4>
                             <div className="flex items-center gap-2">
                                <span className={`text-[8px] sm:text-[9px] font-heading tracking-[0.2em] sm:tracking-[0.3em] uppercase font-bold ${p.isPopular ? 'text-yellow-500/50' : 'text-accent/50'}`}>UPLINK_ESTABLISHED</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-10 flex-grow group/desc">
                       <div className="flex items-center gap-2">
                          <div className={`h-px w-3 sm:w-4 ${p.isPopular ? 'bg-yellow-500/30' : 'bg-accent/30'}`}></div>
                          <span className="text-[8px] sm:text-[9px] font-heading text-muted tracking-widest uppercase">Description</span>
                       </div>
                       <p className="text-[10px] sm:text-[11px] text-muted/80 group-hover/desc:text-white transition-colors uppercase tracking-[0.1em] sm:tracking-[0.12em] leading-relaxed font-medium">
                          {p.description || 'SECURE_TRADING_INTERFACE_FOR_GLOBAL_MARKET_ACCESS_AND_ASSET_MANAGEMENT.'}
                       </p>
                    </div>
                    
                    <div className="space-y-4 sm:space-y-6">
                       <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <div className="p-2 sm:p-3 border border-white/5 bg-white/[0.02] space-y-1">
                             <p className="text-[8px] sm:text-[9px] font-heading text-muted/40 uppercase tracking-widest">Latency</p>
                             <p className="text-[10px] sm:text-[11px] font-heading text-white font-bold">~14MS</p>
                          </div>
                          <div className="p-2 sm:p-3 border border-white/5 bg-white/[0.02] space-y-1">
                             <p className="text-[8px] sm:text-[9px] font-heading text-muted/40 uppercase tracking-widest">Security</p>
                             <p className={`text-[10px] sm:text-[11px] font-heading font-bold ${p.isPopular ? 'text-yellow-500' : 'text-accent'}`}>SSL_v3</p>
                          </div>
                       </div>
                       
                       <a 
                         href={p.registrationUrl} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         onClick={() => trackPlatformClick(p.id)}
                         className={`group/btn relative w-full py-4 sm:py-5 border font-heading text-[10px] sm:text-[11px] font-black tracking-[0.4em] sm:tracking-[0.5em] uppercase overflow-hidden transition-all active:scale-[0.98] flex items-center justify-center gap-3 square-button ${p.isPopular ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-500 hover:bg-yellow-500 hover:text-black' : 'bg-accent/5 border-accent/20 text-accent hover:bg-accent hover:text-black'}`}
                       >
                          <span className="relative z-10">REGISTER_ACCOUNT</span>
                          <ArrowRight size={14} className="sm:size-[16px] relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                       </a>
                    </div>
                 </div>
              </div>
            </div>
         ))}
      </div>
    </section>
  );
};

export default AccountRegistrationSection;
