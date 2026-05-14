
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import { useUIStore } from '../store/uiStore';
import { 
  Video,
  Monitor,
  LayoutGrid,
  Brain,
  MessageSquare,
  Award,
  TrendingUp,
  FileText,
  Bell,
  Cpu as AI,
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
  XCircle,
  Facebook,
  Youtube,
  Instagram,
  Send,
  Music2
} from 'lucide-react';
import SubscriptionPlanSection from '../components/SubscriptionPlanSection';
import AccountRegistrationSection from '../components/AccountRegistrationSection';
import MoneyManagementDemo from '../components/MoneyManagementDemo';

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
    socialLinks,
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
            <span className="font-heading font-black text-xl sm:text-2xl tracking-tighter text-white">
              {glitchText}
            </span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
             {[
               { name: 'SERVICES', id: 'ecosystem' },
               { name: 'CURRICULUM', id: 'curriculum' },
               { name: 'INFRASTRUCTURE', id: 'extensions' },
               { name: 'TOOLS', id: 'management_preview' },
               { name: 'ACCOUNTS', id: 'account_open', show: tradingPlatforms.length > 0 },
               { name: 'PRICING', id: 'pricing', show: subscriptionPlans.length > 0 },
               { name: 'CONTACT', path: '/contact' }
             ].filter(item => item.show === undefined || item.show).map(item => (
               <button 
                 key={item.name} 
                 onClick={() => item.path ? (window.location.hash = `#${item.path}`) : scrollToSection(item.id!)} 
                 className="text-[10px] font-heading font-bold uppercase tracking-[0.2em] text-muted hover:text-accent transition-all"
               >
                 {item.name}
               </button>
             ))}
          </div>

          <Link to="/login">
            <button className="px-4 py-1.5 sm:px-6 sm:py-2 border border-accent/30 bg-accent/5 text-accent font-heading text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-black hover:bg-accent hover:text-black transition-all active:scale-95" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)' }}>
               LOGIN
            </button>
          </Link>
        </div>
      </nav>

      {/* --- SCROLLABLE CONTENT AREA --- */}
      <main ref={mainRef} className="flex-1 overflow-y-auto custom-scrollbar relative overscroll-behavior-none w-full scroll-smooth snap-y snap-mandatory h-screen">
        <div className="relative z-10 w-full overflow-x-hidden">
        
        {/* --- HERO: MINIMALIST UPLINK --- */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-16 relative pb-32 snap-start overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 sm:h-32 bg-gradient-to-b from-accent/50 to-transparent"></div>
           
           <div className="text-center space-y-6 max-w-4xl relative z-10">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-accent/5 border border-accent/20 mb-4" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 92% 100%, 0 100%)' }}>
                 <span className="text-[7px] sm:text-[9px] font-heading text-accent tracking-[0.4em] uppercase font-black">SYSTEM ONLINE</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-8xl font-heading font-black tracking-[-0.04em] uppercase leading-[0.95] text-white">
                BINARY GRID<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent/20" style={{ WebkitTextStroke: '1px rgba(0,240,255,0.4)' }}>OF THE ELITE</span>
              </h1>

              <p className="text-[10px] sm:text-[13px] text-muted max-w-2xl mx-auto text-center uppercase tracking-[0.3em] leading-relaxed font-medium">
                 ADVANCED BINARY ACADEMY. LIVE MARKET EXECUTION. SMART MONEY MANAGEMENT.
              </p>
              <div className="flex items-center justify-center gap-4 pt-8">
                 <Link to="/login">
                    <button className="px-8 py-3 sm:px-12 sm:py-4 bg-accent text-black font-heading text-[9px] sm:text-[10px] font-black tracking-[0.4em] uppercase hover:shadow-glow transition-all flex items-center justify-center gap-3 active:scale-95" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)' }}>
                       ACCESS ACADEMY <ArrowRight size={14} />
                    </button>
                 </Link>
                 <button onClick={() => scrollToSection('ecosystem')} className="px-8 py-3 sm:px-12 sm:py-4 border border-white/10 text-white font-heading text-[9px] sm:text-[10px] font-black tracking-[0.4em] uppercase hover:bg-white/5 transition-all" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)' }}>
                    SERVICES
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

        {/* --- SERVICE CORE PILLARS --- */}
        <section id="ecosystem" className="min-h-screen snap-start py-24 sm:py-32 px-6 sm:px-12 relative border-t border-white/5 flex items-center">
           <div className="max-w-[1400px] mx-auto w-full">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-16 sm:mb-24">
                 <div className="space-y-4">
                    <span className="text-[8px] font-heading text-accent tracking-[0.4em] uppercase font-black flex items-center gap-3">
                       <div className="w-1.5 h-1.5 bg-accent"></div> OUR SERVICES
                    </span>
                    <h2 className="text-4xl sm:text-6xl font-heading font-black tracking-tighter uppercase leading-[0.9]">
                       THE TACTICAL<br/><span className="text-white/20">ADVANTAGE</span>
                    </h2>
                 </div>
                 <p className="text-[10px] text-muted max-w-sm uppercase tracking-widest leading-loose font-medium">
                    Integrated trading solutions designed for consistent profitability in global binary markets. 
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                 {[
                    { title: 'BINARY ACADEMY', icon: <Video className="text-accent" />, desc: 'From basic fundamentals to elite binary strategies. Text, images and HD video modules.' },
                    { title: 'VIP LIVE SIGNALS', icon: <Radio className="text-accent" />, desc: 'Real-time entry points and expiry signals for both Live and OTC markets.' },
                    { title: 'BINARY LIVE ROOM', icon: <Monitor className="text-accent" />, desc: 'Join professional binary traders live. Real chart breakdown and trade execution training.' },
                    { title: 'ELITE MENTORSHIP', icon: <Brain className="text-accent" />, desc: 'One-to-one binary mentorship sessions, personal trade review and portfolio growth planning.' },
                    { title: 'BINARY AI BOT', icon: <Cpu className="text-accent" />, desc: 'Algorithmic market trend detection and instant binary strategy reminders for precision entries.' },
                    { title: 'ULTIMATE MONEY MGMT', icon: <FileText className="text-accent" />, desc: "The world's most advanced management system. Engineered for binary profitability even with a 2-4 win ratio out of 10 trades. High-mathematical edge exclusive to our grid." },
                 ].map((pill, i) => (
                    <div key={i} className="group relative bg-white/[0.02] border border-white/5 p-8 hover:border-accent/40 transition-all duration-500 overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)' }}>
                       <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                          {React.cloneElement(pill.icon as React.ReactElement, { size: 120 } as any)}
                       </div>
                       <div className="relative z-10 space-y-6">
                          <div className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 group-hover:border-accent/30 transition-colors">
                             {pill.icon}
                          </div>
                          <div className="space-y-3">
                             <h3 className="text-sm font-heading font-black tracking-widest uppercase text-white group-hover:text-accent transition-colors">{pill.title}</h3>
                             <p className="text-[9px] leading-relaxed text-muted uppercase tracking-widest font-medium">
                                {pill.desc}
                             </p>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* --- TRADING ACADEMY MODULES --- */}
        <section id="curriculum" className="min-h-screen snap-start py-24 sm:py-32 px-6 sm:px-12 bg-white/[0.01] border-y border-white/5 overflow-hidden flex items-center">
           <div className="max-w-[1400px] mx-auto w-full">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-20">
                 <div className="space-y-4">
                    <span className="text-[8px] font-heading text-accent tracking-[0.4em] uppercase font-black flex items-center gap-3">
                       <div className="w-1.5 h-1.5 bg-accent"></div> ACADEMY CURRICULUM
                    </span>
                    <h2 className="text-4xl sm:text-6xl font-heading font-black tracking-tighter uppercase leading-[0.9]">
                       MASTER THE<br/><span className="text-muted/20">BINARY FLOW</span>
                    </h2>
                 </div>
                 <div className="max-w-md">
                    <p className="text-[10px] text-muted uppercase tracking-widest leading-loose font-medium">
                       Our curriculum is engineered to transform beginners into institutional-level binary executors. We don't just teach indicators; we teach the logic behind every binary tick.
                    </p>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5">
                 {[
                    { 
                       title: 'BINARY PRICE ACTION', 
                       icon: <TrendingUp size={20} />, 
                       topics: ['Candlestick Psychology', 'Support & Resistance 2.0', 'Trend Confirmation Models', 'Entry/Exit Precision'] 
                    },
                    { 
                       title: 'SMART MONEY CONCEPTS', 
                       icon: <Brain size={20} />, 
                       topics: ['Institutional Order Flow', 'Liquidity Identification', 'Market Manipulation Logic', 'Binary Specific S/D'] 
                    },
                    { 
                       title: 'RISK ARCHITECTURE', 
                       icon: <Shield size={20} />, 
                       topics: ['Compounding Strategy', 'Fixed Risk Planning', 'Binary Psychology Mastery', 'Trading Journal Systems'] 
                    },
                    { 
                       title: 'TECHNICAL TOOLKIT', 
                       icon: <LayoutGrid size={20} />, 
                       topics: ['Strategy PDF Notes', 'Trading Checklists', 'Binary Chart Markup', 'Custom Indicator Setup'] 
                    },
                    { 
                       title: 'MARKET DYNAMICS', 
                       icon: <Globe size={20} />, 
                       topics: ['Live Market Sessions', 'OTC Market Algorithms', 'Binary Session Correlation', 'High Impact News Guard'] 
                    },
                    { 
                       title: 'ELITE EXECUTION', 
                       icon: <Target size={20} />, 
                       topics: ['Sniper Entry Models', 'Multi-timeframe Analysis', 'VIP Signal Verification', 'Mentorship Reviews'] 
                    },
                 ].map((module, i) => (
                    <div key={i} className="bg-[#050505] p-10 space-y-8 group transition-all duration-500 hover:bg-white/[0.02]">
                       <div className="w-12 h-12 flex items-center justify-center border border-white/10 text-muted group-hover:text-accent group-hover:border-accent/40 transition-all">
                          {module.icon}
                       </div>
                       <div className="space-y-6">
                          <h3 className="text-sm font-heading font-black tracking-[0.2em] uppercase text-white">{module.title}</h3>
                          <ul className="space-y-3">
                             {module.topics.map((topic, j) => (
                                <li key={j} className="flex items-center gap-3">
                                   <div className="w-1 h-1 bg-accent/30 group-hover:bg-accent transition-colors"></div>
                                   <span className="text-[9px] font-heading font-bold text-muted/60 uppercase tracking-widest">{topic}</span>
                                </li>
                             ))}
                          </ul>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* --- PRO TRADING INFRASTRUCTURE --- */}
        <section id="extensions" className="min-h-screen snap-start py-24 sm:py-32 px-6 sm:px-12 relative overflow-hidden flex items-center">
           <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_40px,rgba(255,255,255,0.05)_40px,rgba(255,255,255,0.05)_41px)]"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,rgba(255,255,255,0.05)_40px,rgba(255,255,255,0.05)_41px)]"></div>
           </div>
 
           <div className="max-w-[1400px] mx-auto relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                 <div className="space-y-12">
                    <div className="space-y-4">
                       <span className="text-[8px] font-heading text-accent tracking-[0.4em] uppercase font-black flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-accent"></div> SYSTEM EXTENSIONS
                       </span>
                       <h2 className="text-4xl sm:text-7xl font-heading font-black tracking-tighter uppercase leading-[0.9] text-white">
                          INTEGRATED<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent/10" style={{ WebkitTextStroke: '1px rgba(0,240,255,0.2)' }}>BINARY TECH</span>
                       </h2>
                    </div>
                    
                    <div className="space-y-10">
                       <div className="flex gap-8 group">
                          <div className="shrink-0 w-14 h-14 border border-white/10 flex items-center justify-center text-muted group-hover:text-accent group-hover:border-accent/40 transition-all">
                             <Radio size={24} />
                          </div>
                          <div className="space-y-2">
                             <h4 className="text-[11px] font-heading font-black tracking-widest text-white uppercase">WEEKLY LIVE ROOM</h4>
                             <p className="text-[9px] text-muted uppercase tracking-widest leading-loose">Direct access to professional binary trading terminals. Watch real-time execution and chart logic breakdown.</p>
                          </div>
                       </div>
                       
                       <div className="flex gap-8 group">
                          <div className="shrink-0 w-14 h-14 border border-white/10 flex items-center justify-center text-muted group-hover:text-accent group-hover:border-accent/40 transition-all">
                             <AI size={24} />
                          </div>
                          <div className="space-y-2">
                             <h4 className="text-[11px] font-heading font-black tracking-widest text-white uppercase">BINARY MARKET AI</h4>
                             <p className="text-[9px] text-muted uppercase tracking-widest leading-loose">Neural network suggestions for binary market direction and volatility alerts synced across academy nodes.</p>
                          </div>
                       </div>

                       <div className="flex gap-8 group">
                          <div className="shrink-0 w-14 h-14 border border-white/10 flex items-center justify-center text-muted group-hover:text-accent group-hover:border-accent/40 transition-all">
                             <FileText size={24} />
                          </div>
                          <div className="space-y-2">
                             <h4 className="text-[11px] font-heading font-black tracking-widest text-white uppercase">DYNAMIC TOOLKIT</h4>
                             <p className="text-[9px] text-muted uppercase tracking-widest leading-loose">Binary PDF strategy blueprints, session guides, and risk calculators updated for every market cycle.</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="bg-white/[0.02] border border-white/10 p-1 bg-gradient-to-b from-white/10 to-transparent">
                    <div className="bg-[#050505] p-8 sm:p-12 space-y-10">
                       <div className="flex justify-between items-center border-b border-white/5 pb-8">
                          <div className="space-y-1">
                             <span className="text-[7px] font-heading tracking-[0.5em] text-accent uppercase font-black">MARKET STATUS</span>
                             <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[10px] font-heading font-black tracking-widest text-white uppercase">SYSTEM ACTIVE</span>
                             </div>
                          </div>
                          <div className="text-right">
                             <span className="text-[7px] font-heading tracking-[0.5em] text-white/20 uppercase font-black">ENCRYPTION</span>
                             <div className="text-[10px] font-heading font-black tracking-widest text-white uppercase">AES 256 ACTIVE</div>
                          </div>
                       </div>

                       <div className="space-y-6">
                          {[
                             { label: 'OTC SIGNAL ALGORITHM', value: 92 },
                             { label: 'LIVE MARKET PRECISION', value: 89 },
                             { label: 'STUDENT SUCCESS RATIO', value: 76 }
                          ].map((stat, i) => (
                             <div key={i} className="space-y-3">
                                <div className="flex justify-between items-end">
                                   <span className="text-[8px] font-heading font-bold text-muted uppercase tracking-[0.2em]">{stat.label}</span>
                                   <span className="text-[9px] font-mono text-accent">{stat.value}%</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 relative">
                                   <div className="absolute top-0 left-0 h-full bg-accent transition-all duration-1000" style={{ width: `${stat.value}%` }}></div>
                                </div>
                             </div>
                          ))}
                       </div>

                       <div className="pt-6">
                          <button onClick={() => scrollToSection('management_preview')} className="w-full py-4 bg-accent text-[#050505] font-heading text-[9px] font-black tracking-[0.4em] uppercase hover:bg-white hover:text-black transition-all">
                             PREVIEW ANALYTICS TOOLS
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* --- MONEY MANAGEMENT PREVIEW --- */}
        <section id="management_preview" className="min-h-screen snap-start border-t border-white/5 flex items-center bg-[#050505]/40 backdrop-blur-3xl">
           <MoneyManagementDemo />
        </section>

        {/* --- ACCOUNT OPENING PLATFORMS --- */}
        {tradingPlatforms.length > 0 && (
          <section id="account_open" className="min-h-screen snap-start flex items-center bg-[#050505]">
            <AccountRegistrationSection />
          </section>
        )}

        {/* --- SUBSCRIPTION PLANS --- */}
        <section id="pricing" className="min-h-screen snap-start flex items-center bg-white/[0.01]">
          <SubscriptionPlanSection />
        </section>

        {/* --- TIDY FOOTER --- */}
        <footer className="border-t border-white/5 bg-[#050505] py-20 px-6 sm:px-12">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-16 sm:mb-20">
              <div className="space-y-5 sm:space-y-6">
                <div className="flex items-center">
                  <h3 className="font-heading font-black text-lg sm:text-xl tracking-tighter text-white">{brandingName}</h3>
                </div>
                <p className="text-[9px] text-muted uppercase tracking-widest leading-loose font-medium">
                  Pioneering dynamic multi-tenant binary education through elite trading nodes. Deployed globally.
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
                  <p className="text-[8px] font-heading text-muted/40 tracking-[0.3em] sm:tracking-[0.5em] text-center">© 2025 {brandingName}</p>
                  <div className="hidden sm:block h-px w-6 bg-white/10"></div>
                  <p className="text-[8px] font-heading text-accent/30 uppercase tracking-[0.3em] sm:tracking-[0.5em] text-center">ENCRYPTED</p>
               </div>
               <div className="flex gap-4 sm:gap-6">
                  {['Terms', 'Privacy', 'API'].map(item => (
                    <button key={item} className="text-[8px] font-heading text-muted/20 uppercase tracking-widest hover:text-accent transition-colors">{item}</button>
                  ))}
               </div>

               {/* SOCIAL MEDIA LINKS */}
               <div className="flex items-center gap-3 sm:gap-4 order-first sm:order-none">
                 {socialLinks.facebook && (
                   <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 text-muted/40 hover:text-accent hover:border-accent/40 hover:shadow-glow transition-all duration-300" title="Facebook">
                     <Facebook size={14} />
                   </a>
                 )}
                 {socialLinks.telegram && (
                   <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 text-muted/40 hover:text-accent hover:border-accent/40 hover:shadow-glow transition-all duration-300" title="Telegram">
                     <Send size={14} />
                   </a>
                 )}
                 {socialLinks.instagram && (
                   <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 text-muted/40 hover:text-accent hover:border-accent/40 hover:shadow-glow transition-all duration-300" title="Instagram">
                     <Instagram size={14} />
                   </a>
                 )}
                 {socialLinks.youtube && (
                   <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 text-muted/40 hover:text-accent hover:border-accent/40 hover:shadow-glow transition-all duration-300" title="YouTube">
                     <Youtube size={14} />
                   </a>
                 )}
                 {socialLinks.tiktok && (
                   <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 text-muted/40 hover:text-accent hover:border-accent/40 hover:shadow-glow transition-all duration-300" title="TikTok">
                     <Music2 size={14} />
                   </a>
                 )}
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
