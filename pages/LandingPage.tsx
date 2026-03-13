
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import { useUIStore } from '../store/uiStore';
import { 
  Zap, 
  Shield, 
  Cpu, 
  ChevronRight, 
  Layers, 
  Binary, 
  Database,
  ArrowRight,
  Terminal,
  Activity,
  Lock,
  Wifi,
  Target,
  Box,
  Server,
  CloudLightning,
  ShieldCheck,
  User as UserIcon,
  Phone,
  MapPin,
  Mail,
  Clock,
  Globe,
  Radio,
  HardDrive,
  Maximize2,
  Crosshair,
  Settings,
  ShieldAlert,
  MessageCircle,
  ExternalLink,
  CheckCircle,
  XCircle
} from 'lucide-react';
import SubscriptionPlanSection from '../components/SubscriptionPlanSection';
import AccountRegistrationSection from '../components/AccountRegistrationSection';

const LandingPage: React.FC = () => {
  const { 
    isInitialized,
    brandingName, 
    ownerName, 
    ownerPhone, 
    ownerEmail, 
    ownerAddress, 
    officeHours,
    whatsappNumber,
    tradingPlatforms,
    subscriptionPlans,
    initializePublicSettings,
    trackPlatformClick
  } = useDataStore();

  const { setGlobalLoading } = useUIStore();
  const [glitchText, setGlitchText] = useState(brandingName);
  const mainRef = React.useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    initializePublicSettings();
  }, [initializePublicSettings]);

  useEffect(() => {
    if (isInitialized) {
      const timer = setTimeout(() => {
        setGlobalLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isInitialized, setGlobalLoading]);

  useEffect(() => {
    setGlitchText(brandingName);
    const interval = setInterval(() => {
      const chars = "X01_#@";
      if (Math.random() > 0.97) {
        const randomChar = chars[Math.floor(Math.random() * chars.length)];
        setGlitchText(prev => prev.slice(0, -1) + randomChar);
        setTimeout(() => setGlitchText(brandingName), 100);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [brandingName]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="h-[100dvh] text-white font-body selection:bg-accent selection:text-black overflow-hidden flex flex-col">
      
      {/* --- SLIM NAVIGATION --- */}
      <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 bg-[#050505]/40 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-10 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-heading font-black text-sm sm:text-base tracking-tighter uppercase">
              {glitchText}
            </span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
             {['ACCOUNT REGISTER', 'PRICING'].map(item => (
               <button key={item} onClick={() => scrollToSection(item === 'ACCOUNT REGISTER' ? 'account_open' : 'pricing')} className="text-[10px] font-heading font-bold uppercase tracking-[0.2em] text-muted hover:text-accent transition-all">
                 {item}
               </button>
             ))}
          </div>

          <Link to="/login">
            <button className="px-4 py-1.5 sm:px-6 sm:py-2 border border-accent/30 bg-accent/5 text-accent font-heading text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-black hover:bg-accent hover:text-black transition-all active:scale-95" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
               LOGIN
            </button>
          </Link>
        </div>
      </nav>

      {/* --- SCROLLABLE CONTENT AREA --- */}
      <main ref={mainRef} className="flex-1 overflow-y-auto custom-scrollbar relative overscroll-behavior-none w-full scroll-smooth snap-y snap-mandatory">
        <div className="relative z-10 w-full overflow-x-hidden">
        
        {/* --- HERO: MINIMALIST UPLINK --- */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-16 relative pb-32 snap-start overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 sm:h-32 bg-gradient-to-b from-accent/50 to-transparent"></div>
           
           <div className="text-center space-y-6 max-w-4xl relative z-10">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-accent/5 border border-accent/20 mb-4" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 92% 100%, 0 100%)' }}>
                 <span className="text-[7px] sm:text-[9px] font-heading text-accent tracking-[0.4em] uppercase font-black">SYSTEM</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-8xl font-heading font-black tracking-[-0.04em] uppercase leading-[0.95] text-white">
                LEARNING_GRID<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent/20" style={{ WebkitTextStroke: '1px rgba(0,240,255,0.4)' }}>OF_KNOWLEDGE</span>
              </h1>

              <p className="text-[10px] sm:text-[13px] text-muted max-w-2xl mx-auto text-center uppercase tracking-[0.3em] leading-relaxed font-medium">
                 INTELLIGENT DATA SILOS. DYNAMIC KNOWLEDGE MAPPING. HIGH FIDELITY INFRASTRUCTURE.
              </p>
              <div className="flex items-center justify-center gap-4 pt-8">
                 <Link to="/login">
                    <button className="px-8 py-3 sm:px-12 sm:py-4 bg-accent text-black font-heading text-[9px] sm:text-[10px] font-black tracking-[0.4em] uppercase hover:shadow-glow transition-all flex items-center justify-center gap-3 active:scale-95" style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
                       START <ArrowRight size={14} />
                    </button>
                 </Link>
                 <button onClick={() => scrollToSection('account_open')} className="px-8 py-3 sm:px-12 sm:py-4 border border-white/10 text-white font-heading text-[9px] sm:text-[10px] font-black tracking-[0.4em] uppercase hover:bg-white/5 transition-all" style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}>
                    DETAILS
                 </button>
              </div>
           </div>

           {/* Scrolling Ticker */}
           <div className="absolute bottom-10 left-0 right-0 border-y border-white/5 bg-[#050505]/50 backdrop-blur-sm py-2 overflow-hidden">
              <div className="flex whitespace-nowrap animate-[marquee_40s_linear_infinite]">
                 {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-8 mx-4">
                       {[
                          { s: 'BTC', p: '64,230.50', c: '+2.4%', u: true },
                          { s: 'ETH', p: '3,450.20', c: '+1.2%', u: true },
                          { s: 'SOL', p: '145.80', c: '+5.7%', u: true },
                          { s: 'AAPL', p: '189.30', c: '-0.5%', u: false },
                          { s: 'TSLA', p: '178.20', c: '+1.1%', u: true },
                          { s: 'EUR/USD', p: '1.0845', c: '+0.02%', u: true },
                          { s: 'NVDA', p: '890.50', c: '+3.2%', u: true },
                          { s: 'GOLD', p: '2,340.00', c: '+0.8%', u: true },
                       ].map((item, j) => (
                          <div key={j} className="flex items-center gap-3">
                             <span className="text-[10px] font-mono font-bold text-white">{item.s}</span>
                             <span className="text-[10px] font-mono text-muted">{item.p}</span>
                             <span className={`text-[9px] font-mono ${item.u ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {item.c}
                             </span>
                             <span className="text-[9px] font-mono text-white/10">///</span>
                          </div>
                       ))}
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* --- ACCOUNT OPENING PLATFORMS --- */}
        <AccountRegistrationSection />

        {/* --- SUBSCRIPTION PLANS --- */}
        <SubscriptionPlanSection />

        {/* --- TIDY FOOTER --- */}
        <footer className="relative z-10 border-t border-white/5 bg-[#050505] pt-16 sm:pt-20 pb-10 px-6 sm:px-12 snap-start">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-16 sm:mb-20">
              <div className="space-y-5 sm:space-y-6">
                <div className="flex items-center">
                  <h3 className="font-heading font-black text-lg sm:text-xl tracking-tighter uppercase text-white">{brandingName}</h3>
                </div>
                <p className="text-[9px] text-muted uppercase tracking-widest leading-loose font-medium">
                  Pioneering dynamic multi-tenant education management through neural grid technologies. Deployed globally.
                </p>
              </div>

              <div className="space-y-5 sm:space-y-6">
                 <h4 className="font-heading text-[10px] font-black uppercase tracking-[0.4em] text-accent">IDENTITY</h4>
                 <div className="space-y-3">
                    <div className="flex items-center gap-4 text-white/40 hover:text-accent transition-colors group cursor-default">
                      <UserIcon size={12} className="shrink-0 text-accent/60 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-heading uppercase tracking-widest flex items-center gap-2">OWNER: <span className="text-white/80">{ownerName}</span></span>
                    </div>
                    <div className="flex items-center gap-4 text-white/40 hover:text-accent transition-colors group cursor-default">
                      <Clock size={12} className="shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-heading uppercase tracking-widest flex items-center gap-2">HOURS: <span className="text-white/80">{officeHours}</span></span>
                    </div>
                 </div>
              </div>

              <div className="space-y-5 sm:space-y-6">
                 <h4 className="font-heading text-[10px] font-black uppercase tracking-[0.4em] text-accent">CONTACT</h4>
                 <div className="space-y-3">
                    <a href={`tel:${ownerPhone}`} className="flex items-center gap-4 text-white/40 hover:text-accent transition-colors group">
                      <Phone size={12} className="shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-heading uppercase tracking-widest flex items-center gap-2">PHONE: <span className="text-white/80">{ownerPhone}</span></span>
                    </a>
                    {whatsappNumber && (
                      <a href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-white/40 hover:text-accent transition-colors group">
                        <MessageCircle size={12} className="shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-heading uppercase tracking-widest flex items-center gap-2">WHATSAPP: <span className="text-white/80">{whatsappNumber}</span></span>
                      </a>
                    )}
                    <a href={`mailto:${ownerEmail}`} className="flex items-center gap-4 text-white/40 hover:text-accent transition-colors group">
                      <Mail size={12} className="shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-heading uppercase tracking-widest truncate flex items-center gap-2">EMAIL: <span className="text-white/80">{ownerEmail}</span></span>
                    </a>
                 </div>
              </div>

              <div className="space-y-5 sm:space-y-6">
                 <h4 className="font-heading text-[10px] font-black uppercase tracking-[0.4em] text-accent">LOCATION</h4>
                 <div className="space-y-3">
                    <div className="flex items-start gap-4 text-white/40 hover:text-accent transition-colors group cursor-default">
                      <MapPin size={12} className="shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-heading uppercase tracking-widest leading-loose flex items-start gap-2">OFFICE: <span className="text-white/80">{ownerAddress}</span></span>
                    </div>
                 </div>
              </div>
            </div>
            
            <div className="pt-8 sm:pt-10 border-t border-white/5 flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
               <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6 lg:gap-8">
                  <p className="text-[8px] font-heading text-muted/40 uppercase tracking-[0.3em] sm:tracking-[0.5em] text-center">© 2025 {brandingName}_GRID</p>
                  <div className="hidden sm:block h-px w-6 bg-white/10"></div>
                  <p className="text-[8px] font-heading text-accent/30 uppercase tracking-[0.3em] sm:tracking-[0.5em] text-center">ENCRYPTED</p>
               </div>
               <div className="flex gap-4 sm:gap-6">
                  {['Terms', 'Privacy', 'API'].map(item => (
                    <button key={item} className="text-[8px] font-heading text-muted/20 uppercase tracking-widest hover:text-accent transition-colors">{item}</button>
                  ))}
               </div>
            </div>
          </div>
        </footer>
        </div>
      </main>

      <style>{`
        @keyframes h-scan { 0% { top: -5%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 105%; opacity: 0; } }
        @keyframes v-scan { 0% { top: -10%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 110%; opacity: 0; } }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
};

export default LandingPage;
