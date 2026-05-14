
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare, 
  MessageCircle,
  Facebook, 
  Send, 
  Instagram, 
  Youtube, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Globe,
  TrendingUp,
  Target,
  Users
} from 'lucide-react';
import { useDataStore } from '../store/dataStore';

const ContactUsPage: React.FC = () => {
  const { 
    brandingName, 
    ownerName, 
    ownerPhone, 
    ownerEmail, 
    ownerAddress, 
    whatsappNumber, 
    officeHours,
    socialLinks,
    seoDescription
  } = useDataStore();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const contactMethods = [
    {
      icon: <Phone className="text-accent" size={24} />,
      title: "DIRECT LINE",
      value: ownerPhone || "+8801XXXXXXX",
      link: `tel:${ownerPhone}`,
      desc: "Call us for immediate support"
    },
    {
      icon: <MessageCircle className="text-accent" size={24} />,
      title: "WHATSAPP",
      value: whatsappNumber || "+8801XXXXXXX",
      link: `https://wa.me/${whatsappNumber?.replace(/\D/g, '')}`,
      desc: "Instant chat and signals query"
    },
    {
      icon: <Mail className="text-accent" size={24} />,
      title: "EMAIL SUPPORT",
      value: ownerEmail || "support@domain.com",
      link: `mailto:${ownerEmail}`,
      desc: "For official queries and billing"
    },
    {
      icon: <MapPin className="text-accent" size={24} />,
      title: "OFFICE LOCATION",
      value: ownerAddress || "Global Grid Sector 01",
      link: "#",
      desc: "Visit our tactical headquarters"
    }
  ];

  const socialPlatforms = [
    { icon: <Facebook size={20} />, link: socialLinks.facebook, name: "FACEBOOK" },
    { icon: <Send size={20} />, link: socialLinks.telegram, name: "TELEGRAM" },
    { icon: <Instagram size={20} />, link: socialLinks.instagram, name: "INSTAGRAM" },
    { icon: <Youtube size={20} />, link: socialLinks.youtube, name: "YOUTUBE" },
    { icon: <MessageSquare size={20} />, link: socialLinks.tiktok, name: "TIKTOK" }
  ].filter(p => p.link);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-accent/30 selection:text-accent">
      {/* Header / Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 bg-[#050505]/40 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-10 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => window.location.hash = '#/'}
              className="text-white/40 hover:text-white transition-colors flex items-center gap-2 group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-heading font-black tracking-widest uppercase hidden sm:inline">RETURN HOME</span>
            </button>
            <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
            <span className="font-heading font-black text-xl sm:text-2xl tracking-tighter text-white">
              {brandingName}
            </span>
          </div>
          <button 
            onClick={() => window.location.hash = '#/login'}
            className="px-6 py-2 bg-white text-black font-heading text-[9px] font-black tracking-[0.2em] uppercase hover:bg-accent transition-all"
            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
          >
            ACCESS NODE
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-8 sm:pb-12 px-4 sm:px-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-3 px-3 py-1 bg-accent/5 border border-accent/20 self-start" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 92% 100%, 0 100%)' }}>
               <span className="text-[8px] font-heading text-accent tracking-[0.4em] uppercase font-black">COMMUNICATION CHANNELS</span>
            </div>
            <h1 className="text-4xl sm:text-7xl font-heading font-black tracking-tighter uppercase leading-[0.9] max-w-4xl">
              GET IN <span className="text-white/20">TOUCH</span><br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent/20" style={{ WebkitTextStroke: '1px rgba(0,240,255,0.4)' }}>WITH {brandingName}</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Mission & Founder Section */}
      <section className="pb-8 sm:pb-12 px-4 sm:px-10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-8">
            <div className="bg-white/[0.02] border border-white/5 p-6 sm:p-10 relative overflow-hidden group h-full">
              <div className="absolute top-0 left-0 w-32 h-32 bg-accent/5 blur-3xl group-hover:bg-accent/10 transition-colors"></div>
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3 border-l-2 border-accent pl-4">
                  <span className="text-[9px] font-heading font-black text-white/40 uppercase tracking-[0.4em]">MISSION STATEMENT</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-heading font-black tracking-tighter text-white uppercase leading-tight">
                  EMPOWERING THE NEXT GENERATION OF <span className="text-accent">BINARY TRADERS</span>
                </h2>
                <p className="text-[11px] sm:text-[13px] text-muted uppercase tracking-widest leading-relaxed font-medium max-w-3xl">
                  {seoDescription || `${brandingName} IS AN INSTITUTIONAL-GRADE EDUCATION PLATFORM BUILT TO BRIDGE THE GAP BETWEEN RETAIL PARTICIPANTS AND PROFESSIONAL EXECUTION.`}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                  <div className="space-y-2">
                    <TrendingUp className="text-accent" size={20} />
                    <p className="text-[8px] font-heading font-black uppercase text-white">ELITE STRATEGY</p>
                    <p className="text-[7px] text-muted uppercase tracking-widest leading-relaxed">ADVANCED VISUAL CONTENT FOR SYSTEMATIC LEARNING.</p>
                  </div>
                  <div className="space-y-2">
                    <Target className="text-accent" size={20} />
                    <p className="text-[8px] font-heading font-black uppercase text-white">PRECISION SIGNALS</p>
                    <p className="text-[7px] text-muted uppercase tracking-widest leading-relaxed">INSTANT INFRASTRUCTURE FOR REAL-TIME EXECUTION.</p>
                  </div>
                  <div className="space-y-2">
                    <Users className="text-accent" size={20} />
                    <p className="text-[8px] font-heading font-black uppercase text-white">ACTIVE COMMUNITY</p>
                    <p className="text-[7px] text-muted uppercase tracking-widest leading-relaxed">JOIN THOUSANDS OF TRADERS IN OUR ECOSYSTEM.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-accent p-6 sm:p-10 space-y-6 flex flex-col justify-between h-full" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)' }}>
              <div className="space-y-4">
                <span className="text-[9px] font-heading font-black text-black/60 uppercase tracking-[0.4em]">ADMIN FOUNDER</span>
                <div className="space-y-1">
                  <h3 className="text-3xl font-heading font-black tracking-tighter text-black uppercase leading-none">
                    {ownerName || "ADMIN ROOT"}
                  </h3>
                  <p className="text-[9px] font-heading font-black text-black/40 uppercase tracking-[0.1em]">PLATFORM ARCHITECT</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-[9px] text-black font-bold leading-relaxed uppercase tracking-wider">
                  "WE PROVIDE A TRANSPARENT AND PROFITABLE PATHWAY FOR TRADERS GLOBALLY."
                </p>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-black" />
                  <span className="text-[8px] font-heading font-black text-black uppercase tracking-[0.1em]">VERIFIED OFFICIAL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <section className="pb-20 sm:pb-32 px-4 sm:px-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 items-start">
            {/* Contact Grid */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-l-2 border-accent pl-4">
                <span className="text-[10px] font-heading font-black text-white uppercase tracking-[0.4em]">TACTICAL CONTACTS</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {contactMethods.map((method, i) => (
                  <motion.a
                    href={method.link}
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-surface/40 border border-white/5 p-4 sm:p-8 group hover:border-accent/40 transition-all relative overflow-hidden flex flex-row sm:flex-col items-center sm:items-start sm:justify-between gap-4 sm:gap-0 sm:min-h-[160px]"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%)' }}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                      <ChevronRight size={14} className="text-accent" />
                    </div>
                    <div className="sm:mb-4 flex-shrink-0">{method.icon}</div>
                    <div className="space-y-0.5 sm:space-y-1 flex-grow">
                      <span className="text-[7px] font-heading text-accent tracking-[0.4em] uppercase font-black">{method.title}</span>
                      <p className="text-sm sm:text-lg font-heading font-black tracking-tight text-white group-hover:text-accent transition-colors truncate">{method.value}</p>
                      <p className="text-[8px] text-muted uppercase tracking-widest leading-loose hidden sm:block">{method.desc}</p>
                    </div>
                    <div className="sm:hidden">
                      <ChevronRight size={14} className="text-white/20" />
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Support Info & Socials */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-l-2 border-white/10 pl-4">
                <span className="text-[10px] font-heading font-black text-white uppercase tracking-[0.4em]">SYSTEM OPERATIONS</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-6 sm:p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Clock size={80} />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="text-accent" size={16} />
                    <span className="text-[10px] font-heading font-black text-white uppercase tracking-[0.4em]">OPERATIONAL HOURS</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl sm:text-4xl font-heading font-black tracking-tighter text-white uppercase leading-none">
                      {officeHours || "SAT - THU: 09:00 - 18:00"}
                    </p>
                    <p className="text-[9px] text-muted font-heading font-black tracking-widest uppercase">GMT +6:00 / DHAKA STANDARD</p>
                  </div>
                </div>

                <div className="h-px bg-white/5"></div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Globe className="text-accent" size={16} />
                    <span className="text-[10px] font-heading font-black text-white uppercase tracking-[0.4em]">SOCIAL NODES</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {socialPlatforms.map((social, i) => (
                      <a 
                        key={i}
                        href={social.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 bg-white/5 border border-white/10 text-muted/60 hover:text-accent hover:border-accent/40 hover:shadow-glow transition-all duration-300 group min-h-[50px] sm:min-h-[60px]"
                        style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 80%, 95% 100%, 0 100%, 0 20%)' }}
                      >
                        <div className="flex items-center gap-3">
                          {social.icon}
                          <span className="text-[7px] sm:text-[8px] font-heading font-black tracking-[0.3em] uppercase">{social.name}</span>
                        </div>
                        <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-4 text-center">
        <p className="text-[8px] font-heading font-black text-muted/40 tracking-[0.5em] uppercase">
          &copy; {new Date().getFullYear()} {brandingName} // ALL SYSTEMS OPERATIONAL // SECURE CONNECTION ACTIVE
        </p>
      </footer>
    </div>
  );
};

export default ContactUsPage;
