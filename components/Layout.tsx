
import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import { useUIStore } from '../store/uiStore';

import { useMoneyManagementStore } from '../store/moneyManagementStore';
import { UserRole } from '../types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { generateDocumentUrl, isPermissionActive } from '../lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  FolderTree, 
  FileText, 
  ShieldCheck, 
  Search, 
  History, 
  Settings,
  LogOut, 
  Menu, 
  X, 
  User as UserIcon, 
  Key,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Target,
  Square,
  PanelLeftClose,
  PanelLeft,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
  Zap,
  Cloud,
  Code,
  Binary,
  Globe,
  Database,
  Activity,
  Wifi,
  Terminal,
  Layers,
  DollarSign,
  Bookmark
} from 'lucide-react';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
  onNavigate?: () => Promise<void>;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, isActive, isCollapsed, onClick, onNavigate }) => {
  const navigate = useNavigate();
  const { setGlobalLoading } = useUIStore();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) onClick();
    
    if (onNavigate) {
      setGlobalLoading(true);
      try {
        await onNavigate();
      } finally {
        setGlobalLoading(false);
        navigate(to);
      }
    } else {
      navigate(to);
    }
  };

  return (
    <a
      href={`#${to}`}
      onClick={handleClick}
      title={isCollapsed ? label : ""}
      className={`relative flex items-center transition-all duration-300 group mb-1 h-12 overflow-hidden border-b border-white/[0.02] ${
        isActive 
          ? 'text-accent' 
          : 'text-muted/40 hover:text-white'
      } ${isCollapsed ? 'lg:justify-center lg:px-0 px-6' : 'px-6'}`}
    >
      {/* Active Line Indicator */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent transition-all duration-300"></div>
      )}

      {/* Hover Backdrop */}
      <div className={`absolute inset-0 transition-all duration-300 ${
        isActive 
          ? 'bg-accent/5 opacity-100' 
          : 'bg-white/5 opacity-0 group-hover:opacity-100'
      }`}></div>

      {/* Icon - Perfectly Centered in Collapsed Mode */}
      <span className={`relative z-10 shrink-0 transition-transform duration-300 flex items-center justify-center ${isCollapsed ? 'lg:w-full lg:scale-110' : 'group-hover:scale-110'}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 18 })}
      </span>

      <div className={`relative z-10 overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:w-0 lg:opacity-0 lg:ml-0 flex-1 opacity-100 ml-4' : 'flex-1 opacity-100 ml-4'}`}>
        <span className="font-heading text-[10px] tracking-[0.3em] uppercase font-black whitespace-nowrap block">
          {label}
        </span>
      </div>
    </a>
  );
};

const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { documents, categories } = useDataStore();

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLower = query.toLowerCase();
  
  const filteredDocs = query.length > 1 
    ? documents.filter(d => d.title.toLowerCase().includes(searchLower) || d.serialNumber?.toLowerCase().includes(searchLower)).slice(0, 3)
      .map(d => ({ id: d.id, title: d.title, link: generateDocumentUrl(d), type: 'DOC' }))
    : [];

  const filteredCats = query.length > 1
    ? categories.filter(c => c.name.toLowerCase().includes(searchLower) || c.serialNumber?.toLowerCase().includes(searchLower)).slice(0, 2)
      .map(c => ({ id: c.id, title: c.name, link: '/categories', type: 'PERM' }))
    : [];



  const allResults = [...filteredDocs, ...filteredCats].slice(0, 5);

  return (
    <div className="relative" ref={searchRef}>
      <div 
        onClick={() => {setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 50);}}
        className={`flex items-center transition-all duration-300 bg-[#050505] group ${
          isOpen 
            ? 'border border-accent w-48 sm:w-80 px-3 py-2 sm:px-5 sm:py-3' 
            : 'border border-white/10 w-9 h-9 sm:w-64 sm:h-auto p-2 sm:px-5 sm:py-3 bg-white/5 sm:bg-black hover:border-accent/40'
        }`}
      >
        <Search 
          size={isOpen ? 16 : 20} 
          className={`shrink-0 transition-colors duration-300 ${isOpen ? 'text-accent' : 'text-muted/40 group-hover:text-accent'}`} 
        />
        <input 
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SEARCH..."
          className={`bg-transparent border-none outline-none text-[8px] sm:text-[10px] font-heading tracking-[0.2em] uppercase w-full placeholder:text-muted/20 text-white ml-2 sm:ml-3 ${isOpen ? 'block' : 'hidden sm:block'}`}
        />
      </div>

      {isOpen && query.length > 1 && (
        <div className="absolute top-[calc(100%+8px)] sm:top-[calc(100%+12px)] right-0 w-56 sm:w-full bg-[#080808] border border-white/10 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-0 flex flex-col divide-y divide-white/5">
            {allResults.length > 0 ? (
              allResults.map((res, idx) => (
                <button 
                  key={`${res.type}-${res.id}-${idx}`} 
                  onClick={() => { navigate(res.link); setIsOpen(false); setQuery(''); }} 
                  className="w-full text-left p-3 sm:p-4 hover:bg-white/[0.03] transition-all flex items-center justify-between group"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] sm:text-[10px] font-bold uppercase truncate text-white/60 group-hover:text-white font-heading tracking-widest">{res.title}</span>
                    <span className="text-[6px] sm:text-[7px] text-accent/40 font-heading uppercase tracking-widest">{res.type} // {res.id.slice(-6).toUpperCase()}</span>
                  </div>
                  <ChevronRight size={10} className="text-muted/20 group-hover:text-accent" />
                </button>
              ))
            ) : (
              <div className="p-4 sm:p-6 text-center text-[7px] sm:text-[9px] font-heading text-muted/20 uppercase tracking-[0.3em]">NULL_RESULT</div>
            )}
            <button 
              onClick={() => { setIsOpen(false); navigate('/search'); }}
              className="w-full bg-white/[0.05] text-white/40 p-3 sm:p-4 font-heading text-[8px] sm:text-[10px] font-black tracking-[0.4em] uppercase hover:bg-accent hover:text-black transition-all"
            >
              SEARCH_ALL
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const { initializeListeners, cleanupListeners, brandingName, categories, documents, faviconURL } = useDataStore();
  const { setGlobalLoading } = useUIStore();
  const { fetchActiveData: fetchMoneyData } = useMoneyManagementStore();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth >= 1024 && window.innerWidth < 1536);
  const [dataHydrated, setDataHydrated] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [location.pathname, location.search, location.key]);

  useEffect(() => {
    if (user) {
      const adminId = user.role === UserRole.ADMIN ? user.uid : user.adminId;
      if (adminId) { initializeListeners(adminId, user.role, user.uid); }
    }
    return () => cleanupListeners();
  }, [user, initializeListeners, cleanupListeners]);

  useEffect(() => {
    if (user && !dataHydrated) {
      if (categories.length > 0 || documents.length > 0) {
        setTimeout(() => { setGlobalLoading(false); setDataHydrated(true); }, 1000);
      }
    }
  }, [user, categories, documents, dataHydrated, setGlobalLoading]);

  const isAdmin = user?.role === UserRole.ADMIN;
  
  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Layers': return <Layers />;
      case 'Cpu': return <Cpu />;
      case 'Database': return <Database />;
      case 'Activity': return <Activity />;
      case 'Wifi': return <Wifi />;
      case 'Binary': return <Binary />;
      case 'Globe': return <Globe />;
      case 'Terminal': return <Terminal />;
      case 'Target': return <Target />;
      case 'ShieldAlert': return <ShieldCheck />;
      case 'FolderTree': return <FolderTree />;
      case 'FileText': return <FileText />;
      case 'TrendingUp': return <TrendingUp />;
      case 'Zap': return <Zap />;
      case 'Cloud': return <Cloud />;
      case 'Code': return <Code />;
      case 'Search': return <Search />;
      case 'Users': return <Users />;
      case 'Settings': return <Settings />;
      case 'History': return <History />;
      default: return <FolderTree />;
    }
  };

  const menu = isAdmin ? [
    { to: '/dashboard', label: 'DASHBOARD', icon: <LayoutDashboard /> },
    { to: '/users', label: 'USERS', icon: <Users /> },
    { to: '/categories', label: 'PERMISSIONS', icon: <FolderTree /> },
    { to: '/documents', label: 'DOCUMENTS', icon: <FileText /> },
    { to: '/resource-links', label: 'ACC_REGISTRATION', icon: <Globe /> },
    { to: '/subscription-plans', label: 'SUB_PLAN', icon: <Zap /> },
    { to: '/subscriptions', label: 'SUB_MANAGEMENT', icon: <TrendingUp /> },
    { to: '/registration', label: 'REGISTRATION', icon: <Key /> },
    { to: '/logs', label: 'LOGS', icon: <History /> },
    { to: '/settings', label: 'SETTINGS', icon: <Settings /> },
  ] : [
    { to: '/dashboard', label: 'DASHBOARD', icon: <FileText /> },
    { to: '/profile', label: 'PROFILE', icon: <UserIcon /> },
  ];

  // Dynamic Knowledge Base Items (Permissions + Vault)
  const knowledgeBaseItems = categories.filter(cat => {
    if (isAdmin || user?.permissions?.allAccess) return true;
    return user?.permissions?.categories?.includes(cat.id) && 
           isPermissionActive(user?.permissions?.categoryPermissions?.[cat.id]);
  }).map(cat => ({
    to: `/category/${cat.name.toLowerCase().replace(/\s+/g, '-')}`,
    label: cat.name,
    icon: getCategoryIcon(cat.icon),
    id: cat.id
  }));

  // Add VAULT to Knowledge Base for students
  if (!isAdmin && (knowledgeBaseItems.length > 0 || (user?.bookmarks?.length || 0) > 0)) {
    knowledgeBaseItems.unshift({
      to: '/dashboard?view=vault',
      label: 'VAULT',
      icon: <Bookmark />,
      id: 'vault'
    } as any);
  }

  const isMoneyManagementAuthorized = isAdmin || 
                                     user?.permissions?.allAccess || 
                                     (user?.permissions?.canAccessMoneyManagement && 
                                      isPermissionActive(user?.permissions?.moneyManagement));

  const tools = [
    ...(isMoneyManagementAuthorized ? [{ 
      to: '/money-management', 
      label: 'MONEY_MGMT', 
      icon: <DollarSign />
    }] : [])
  ];

  return (
    <div className="h-[100dvh] bg-transparent flex text-white font-body overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[45] lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      
      {/* --- SIDEBAR --- */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-[#0A0A0A] border-r border-white/5 transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-20 w-[300px]' : 'w-[300px] lg:w-96'}`}
      >
        {/* FLOATING TOGGLE BUTTON */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-4 top-24 w-8 h-8 bg-[#0A0A0A] border border-accent/40 items-center justify-center text-accent hover:text-white hover:border-accent hover:shadow-glow transition-all duration-300 z-[100] shadow-xl"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="h-full flex flex-col relative overflow-hidden">
          
          {/* TOP HEADER: BRANDING - FIXING PERFECT CENTERING */}
          <div className={`h-20 flex items-center border-b border-white/5 shrink-0 transition-all duration-300 ${isCollapsed ? 'lg:justify-center lg:px-0 px-6' : 'px-6'}`}>
            <Link to="/" className={`flex items-center transition-all duration-300 ${isCollapsed ? 'lg:justify-center lg:gap-0 gap-4' : 'gap-4'}`}>
              <div className="p-2.5 bg-[#0A0A0A] border border-accent/20 shrink-0 flex items-center justify-center w-10 h-10 overflow-hidden">
                {faviconURL ? (
                  <img src={faviconURL || undefined} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
              <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? 'lg:w-0 lg:opacity-0 lg:h-0 w-auto opacity-100' : 'w-auto opacity-100'}`}>
                <h1 className="font-heading font-black text-lg uppercase text-white tracking-tighter truncate leading-none">
                  {brandingName}
                </h1>
                <p className="text-[7px] font-heading tracking-[0.5em] text-accent/40 uppercase font-bold mt-1.5 block leading-none">SYSTEM_V5.0</p>
              </div>
            </Link>
          </div>

          {/* Navigation Sector */}
          <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-8 px-0 ${isCollapsed ? 'lg:scrollbar-hide custom-scrollbar' : 'custom-scrollbar'}`}>
             <div className={`mb-6 transition-all duration-300 flex items-center ${isCollapsed ? 'lg:justify-center lg:px-0 px-6' : 'px-6'}`}>
                {isCollapsed ? (
                  <>
                    <div className="hidden lg:block w-8 h-px bg-accent/20 shadow-[0_0_8px_rgba(var(--accent-rgb),0.2)]"></div>
                    <div className="lg:hidden flex items-center gap-3 w-full">
                      <p className="text-[10px] font-heading tracking-[0.3em] uppercase font-black text-accent/60 whitespace-nowrap">NAVIGATION</p>
                      <div className="h-px flex-1 bg-white/5"></div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3 w-full">
                    <p className="text-[10px] font-heading tracking-[0.3em] uppercase font-black text-accent/60 whitespace-nowrap">NAVIGATION</p>
                    <div className="h-px flex-1 bg-white/5"></div>
                  </div>
                )}
             </div>
            {menu.map((item) => (
              <SidebarItem 
                key={item.to} 
                {...item} 
                isActive={location.pathname === item.to} 
                isCollapsed={isCollapsed}
                onClick={() => setSidebarOpen(false)} 
              />
            ))}

            {knowledgeBaseItems.length > 0 && (
              <>
                <div className={`mt-10 mb-6 transition-all duration-300 flex items-center ${isCollapsed ? 'lg:justify-center lg:px-0 px-6' : 'px-6'}`}>
                  {isCollapsed ? (
                    <>
                      <div className="hidden lg:block w-8 h-px bg-accent/20 shadow-[0_0_8px_rgba(var(--accent-rgb),0.2)]"></div>
                      <div className="lg:hidden flex items-center gap-3 w-full">
                        <p className="text-[10px] font-heading tracking-[0.3em] uppercase font-black text-accent/60 whitespace-nowrap">KNOWLEDGE_BASE</p>
                        <div className="h-px flex-1 bg-white/5"></div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3 w-full">
                      <p className="text-[10px] font-heading tracking-[0.3em] uppercase font-black text-accent/60 whitespace-nowrap">KNOWLEDGE_BASE</p>
                      <div className="h-px flex-1 bg-white/5"></div>
                    </div>
                  )}
                </div>
                {knowledgeBaseItems.map((item) => (
                  <SidebarItem 
                    key={item.to} 
                    {...item} 
                    isActive={location.pathname === item.to || (item.id === 'vault' && location.search.includes('view=vault'))} 
                    isCollapsed={isCollapsed}
                    onClick={() => setSidebarOpen(false)} 
                  />
                ))}
              </>
            )}

            {tools.length > 0 && (
              <>
                <div className={`mt-10 mb-6 transition-all duration-300 flex items-center ${isCollapsed ? 'lg:justify-center lg:px-0 px-6' : 'px-6'}`}>
                  {isCollapsed ? (
                    <>
                      <div className="hidden lg:block w-8 h-px bg-accent/20 shadow-[0_0_8px_rgba(var(--accent-rgb),0.2)]"></div>
                      <div className="lg:hidden flex items-center gap-3 w-full">
                        <p className="text-[10px] font-heading tracking-[0.3em] uppercase font-black text-accent/60 whitespace-nowrap">TOOLS</p>
                        <div className="h-px flex-1 bg-white/5"></div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3 w-full">
                      <p className="text-[10px] font-heading tracking-[0.3em] uppercase font-black text-accent/60 whitespace-nowrap">TOOLS</p>
                      <div className="h-px flex-1 bg-white/5"></div>
                    </div>
                  )}
                </div>
                {tools.map((item) => (
                  <SidebarItem 
                    key={item.to} 
                    {...item} 
                    isActive={location.pathname === item.to} 
                    isCollapsed={isCollapsed}
                    onClick={() => setSidebarOpen(false)} 
                  />
                ))}
              </>
            )}
          </nav>

          {/* User Profile Section */}
          <div className="border-t border-white/5 bg-transparent shrink-0">
            <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'lg:justify-center lg:py-4 lg:flex-col lg:gap-0 px-6 py-4 gap-4' : 'px-6 py-4 gap-4'}`}>
              <div className={`border border-white/10 bg-zinc-950 overflow-hidden shrink-0 transition-all duration-300 flex items-center justify-center relative group/avatar ${isCollapsed ? 'lg:w-10 lg:h-10 w-11 h-11' : 'w-11 h-11'}`}>
                <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-accent/40 group-hover/avatar:border-accent transition-colors"></div>
                {user?.photoURL ? (
                  <img src={user.photoURL || undefined} className="w-full h-full object-cover grayscale opacity-50" alt="user" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted/20"><UserIcon size={18} /></div>
                )}
              </div>
              <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? 'lg:w-0 lg:opacity-0 lg:h-0 w-auto opacity-100 flex-1' : 'w-auto opacity-100 flex-1'}`}>
                <p className="text-[9px] font-black uppercase text-white leading-none whitespace-nowrap">{user?.displayName}</p>
                <p className="text-[7px] text-accent/60 tracking-widest uppercase font-bold mt-1.5 flex items-center gap-1.5 whitespace-nowrap">
                  <Target size={8} /> {user?.role}
                </p>
              </div>
            </div>
            
            {/* LOGOUT BUTTON */}
            <button 
              onClick={logout} 
              className={`flex items-center transition-all duration-300 group hover:bg-error/5 hover:text-error ${
                isCollapsed 
                  ? 'lg:h-12 lg:w-full lg:justify-center h-12 w-full px-6' 
                  : 'h-12 w-full px-6'
              }`}
            >
              <div className={`shrink-0 flex items-center justify-center transition-all duration-300 ${isCollapsed ? 'lg:w-full' : ''}`}>
                 <LogOut size={16} className={`transition-transform duration-300 group-hover:scale-110 ${isCollapsed ? 'lg:text-white' : 'text-muted/40'}`} />
              </div>
              <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? 'lg:w-0 lg:opacity-0 lg:h-0 opacity-100 ml-4 flex-1 text-left' : 'opacity-100 ml-4 flex-1 text-left'}`}>
                <span className="font-heading text-[9px] uppercase tracking-[0.4em] font-black whitespace-nowrap text-muted/40 group-hover:text-error">LOGOUT</span>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-transparent relative">
        <header className="h-20 border-b border-white/5 bg-[#0A0A0A] backdrop-blur-xl sticky top-0 z-40 shrink-0 flex flex-col justify-center">
          <div className="w-full pl-2 pr-1 sm:px-10 lg:px-12">
            <div className="w-full max-w-[1700px] mx-auto px-0.5 sm:px-4 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-6 min-w-0">
                <button 
                  className="lg:hidden p-2 bg-white/5 border border-white/10 text-accent transition-all active:scale-95 w-9 h-9 flex items-center justify-center shrink-0" 
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu size={20} />
                </button>
                <div className="flex flex-col min-w-0">
                  <span className="text-[7px] font-heading tracking-[0.4em] text-accent/40 uppercase font-black truncate">LOCATION</span>
                  <h1 className="font-heading text-[9px] sm:text-[11px] tracking-[0.1em] uppercase text-white font-black mt-1 truncate">
                    ROOT {location.pathname.split('/').map(p => p ? ` // ${p.toUpperCase().replace(/-/g, '_')}` : '').join('') || ' // TERMINAL'}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-8 shrink-0 mr-1">
                <GlobalSearch />
              </div>
            </div>
          </div>
        </header>

        <main ref={mainRef} className="flex-1 overflow-y-auto pl-2 pr-1 py-4 sm:p-10 lg:p-12 custom-scrollbar relative overscroll-behavior-none">
          <div className="relative z-10 animate-in fade-in zoom-in-95 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
