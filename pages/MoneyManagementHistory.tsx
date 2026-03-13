
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '../store/authStore';
import { useMoneyManagementStore } from '../store/moneyManagementStore';
import { useUIStore } from '../store/uiStore';
import { MoneyManagementSession, UserRole } from '../types';
import { db, getPath } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { History, TrendingUp, TrendingDown, Calendar, DollarSign, ChevronLeft, ChevronDown, ChevronRight, Eye, BarChart3, PieChart, Activity, Target, Database, Cpu, Clock, ArrowDownWideNarrow, ArrowUpNarrowWide, Search, Zap, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import ConfirmDialog from '../components/ConfirmDialog';
import { isPermissionActive } from '../lib/utils';

const MoneyManagementHistory: React.FC = () => {
  const { user } = useAuthStore();
  const { historySessions, isHistoryLoaded, fetchHistoryData, deleteSession } = useMoneyManagementStore();
  const { setGlobalLoading } = useUIStore();
  const [selectedSession, setSelectedSession] = useState<MoneyManagementSession | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [stats, setStats] = useState({
    totalProfit: 0,
    winRate: 0,
    totalSessions: 0,
    completedSessions: 0,
    failedSessions: 0
  });

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'FAILED' | 'ACTIVE'>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      // Always fetch on mount to ensure freshness
      setGlobalLoading(true);
      fetchHistoryData(user.uid).then(() => {
        setGlobalLoading(false);
      });
    }
  }, [user, fetchHistoryData, setGlobalLoading]);

  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) mainContent.scrollTo(0, 0);
  }, [selectedSession ? selectedSession.id : null]);

  useEffect(() => {
    if (historySessions) {
      const completed = historySessions.filter(s => s.status?.toString().toUpperCase() === 'COMPLETED');
      const failed = historySessions.filter(s => s.status?.toString().toUpperCase() === 'FAILED');
      const totalProfit = historySessions.reduce((acc, s) => acc + (s.currentCapital - s.initialCapital), 0);
      
      setStats({
        totalProfit,
        totalSessions: historySessions.length,
        completedSessions: completed.length,
        failedSessions: failed.length,
        winRate: historySessions.length > 0 ? (completed.length / (completed.length + failed.length) * 100) || 0 : 0
      });
    }
  }, [historySessions]);

  const chartData = [...historySessions].reverse().map((s, idx) => ({
    name: `S${idx + 1}`,
    profit: Number((s.currentCapital - s.initialCapital).toFixed(2)),
    capital: s.currentCapital
  }));

  const handleDeleteSession = async (id: string) => {
    setIsDeleting(true);
    setGlobalLoading(true);
    try {
      await deleteSession(id);
      setShowDeleteConfirm(null);
      if (selectedSession?.id === id) {
        setShowModal(false);
        setSelectedSession(null);
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    } finally {
      setIsDeleting(false);
      setGlobalLoading(false);
    }
  };

  const filteredSessions = historySessions.filter(session => {
    const sessionStatus = session.status?.toString().trim().toUpperCase() || '';
    const matchesStatus = statusFilter === 'ALL' || sessionStatus === statusFilter;
    const matchesSearch = !searchTerm || 
      (session.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (session.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (session.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (session.id?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesDate = true;
    if (startDate || endDate) {
      // Handle Firestore Timestamp for filtering
      const createdAt = session.createdAt as any;
      const sessionDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (sessionDate < start) matchesDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (sessionDate > end) matchesDate = false;
      }
    }

    return matchesStatus && matchesSearch && matchesDate;
  }).sort((a, b) => {
    const dateA = (a.createdAt as any).toDate ? (a.createdAt as any).toDate().getTime() : new Date(a.createdAt).getTime();
    const dateB = (b.createdAt as any).toDate ? (b.createdAt as any).toDate().getTime() : new Date(b.createdAt).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const formatDate = (dateString: string | any) => {
    if (!dateString) return '---';
    try {
      // Handle Firestore Timestamp
      const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: '2-digit'
      }).format(date).toUpperCase();
    } catch (e) {
      return '---';
    }
  };

  const formatTime = (dateString: string | any) => {
    if (!dateString) return '---';
    try {
      // Handle Firestore Timestamp
      const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Time';
      return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date).toUpperCase();
    } catch (e) {
      return '---';
    }
  };

  const openDatePicker = (ref: React.RefObject<HTMLInputElement>) => {
    try {
      if (ref.current && 'showPicker' in ref.current) {
        (ref.current as any).showPicker();
      } else {
        ref.current?.focus();
      }
    } catch (error) {
      console.log('Error opening date picker:', error);
    }
  };

  const isAuthorized = user?.role === UserRole.ADMIN || 
                       user?.permissions?.allAccess || 
                       (user?.permissions?.canAccessMoneyManagement && 
                        isPermissionActive(user?.permissions?.moneyManagement));

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <ShieldAlert size={64} className="text-error animate-pulse" />
        <h2 className="text-2xl font-heading font-black uppercase tracking-widest text-error">ACCESS_DENIED</h2>
        <p className="text-muted text-xs font-heading uppercase tracking-widest">SUBSCRIPTION_EXPIRED_OR_UNAUTHORIZED</p>
        <button onClick={() => window.location.hash = '#/dashboard'} className="px-8 py-3 bg-white text-black font-heading text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-all">RETURN_TO_BASE</button>
      </div>
    );
  }

  return (
    <div className="max-w-[1700px] mx-auto space-y-6 sm:space-y-10 pb-20 relative px-0.5 sm:px-4 select-none">
      {/* HUD Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-accent">
            <Cpu size={16} className="animate-pulse" />
            <p className="text-[10px] font-heading tracking-[0.5em] uppercase font-black">ANALYTICS</p>
          </div>
          <h2 className="text-2xl sm:text-5xl font-heading font-black tracking-tighter text-white uppercase leading-none">SESSION_LOGS</h2>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-4">
        {[
          { label: 'TOTAL_PROFIT', val: `${stats.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: stats.totalProfit >= 0 ? 'text-emerald-500' : 'text-rose-500', icon: <DollarSign size={14} className="sm:w-4 sm:h-4"/>, desc: 'YIELD_TOTAL' },
          { label: 'WIN_RATE', val: `${stats.winRate.toFixed(1)}%`, color: 'text-accent', icon: <PieChart size={14} className="sm:w-4 sm:h-4"/>, desc: `${stats.completedSessions}W / ${stats.failedSessions}L` },
          { label: 'TOTAL_SESSIONS', val: stats.totalSessions.toLocaleString('en-US'), color: 'text-white', icon: <Database size={14} className="sm:w-4 sm:h-4"/>, desc: 'REGISTRY_TOTAL' },
          { label: 'AVG_PROFIT', val: `${(stats.totalSessions > 0 ? stats.totalProfit / stats.totalSessions : 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-yellow-500', icon: <Activity size={14} className="sm:w-4 sm:h-4"/>, desc: 'MEAN_PER_SESSION' },
        ].map((s, i) => (
          <div key={i} className={`bg-surface/80 border border-white/5 p-2 sm:p-5 relative overflow-hidden group transition-all duration-500 flex flex-col justify-between min-h-[140px] sm:min-h-[180px] ${
            s.color === 'text-accent' ? 'hover:border-accent/40' : 
            s.color === 'text-white' ? 'hover:border-white/40' : 
            s.color === 'text-yellow-500' ? 'hover:border-yellow-500/40' : 
            s.color === 'text-emerald-500' ? 'hover:border-emerald-500/40' :
            'hover:border-rose-500/40'
          }`}>
             <div className={`absolute top-0 right-0 w-12 sm:w-16 h-1 opacity-20 ${s.color.replace('text-', 'bg-')}`}></div>
             <div className={`absolute bottom-0 left-0 w-1 h-8 sm:h-12 opacity-20 ${s.color.replace('text-', 'bg-')}`}></div>
             
             <div>
               <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className={`p-2 sm:p-3 bg-black border border-white/10 ${s.color} transition-all duration-300
                    ${s.color === 'text-white' ? 'group-hover:bg-white group-hover:text-black' : 
                      s.color === 'text-accent' ? 'group-hover:bg-accent group-hover:text-black' : 
                      s.color === 'text-emerald-500' ? 'group-hover:bg-emerald-500 group-hover:text-black' : 
                      s.color === 'text-yellow-500' ? 'group-hover:bg-yellow-500 group-hover:text-black' : 
                      s.color === 'text-rose-500' ? 'group-hover:bg-rose-500 group-hover:text-black' : 
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
                  <h3 className={`${s.val.toString().length > 10 ? 'text-lg sm:text-2xl' : s.val.toString().length > 7 ? 'text-xl sm:text-3xl' : 'text-xl sm:text-4xl'} font-heading font-black tracking-tighter ${s.color}`}>{s.val}</h3>
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

      {/* Back Button - Repositioned below stats */}
      <div className="relative z-10 flex justify-center sm:justify-start">
        <button 
          onClick={() => window.location.hash = '#/money-management'}
          className="w-full sm:w-auto justify-center px-8 py-4 bg-white border border-white text-[10px] font-heading font-black tracking-[0.3em] sm:tracking-[0.4em] uppercase text-black hover:bg-accent hover:border-accent transition-all flex items-center gap-3 square-button shadow-glow-sm"
          style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
        >
          <ChevronLeft size={16} />
          BACK_TO_MANAGEMENT
        </button>
      </div>

      {/* Charts */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
        <div className="lg:col-span-2 bg-surface/40 border border-white/5 p-1 relative group" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 95%, 95% 100%, 0 100%)' }}>
          <div className="bg-black/60 p-2 sm:p-8 lg:pb-0 flex flex-col h-full space-y-6 sm:space-y-10">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/5 border border-accent/20 text-accent"><TrendingUp size={20} /></div>
                  <div>
                    <h3 className="font-heading text-xs tracking-[0.2em] uppercase text-white font-black">STATS</h3>
                    <p className="text-[8px] font-heading text-muted uppercase tracking-[0.3em] mt-1">REALTIME</p>
                  </div>
               </div>
            </div>
            <div className="h-[220px] sm:h-[300px] lg:h-auto lg:flex-1 w-full min-h-[250px] lg:min-h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#ffffff20" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    fontFamily="Inter"
                    tick={{ fill: '#ffffff20' }}
                  />
                  <YAxis 
                    stroke="#ffffff20" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    fontFamily="Inter"
                    tickFormatter={(value) => `$${value.toLocaleString('en-US')}`} 
                    width={isMobile ? 45 : 60}
                    tick={{ textAnchor: 'start', x: 0, fill: '#ffffff20' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '0px', fontSize: '9px' }}
                    itemStyle={{ color: '#00F0FF' }}
                  />
                  <Area type="monotone" dataKey="profit" stroke="#00F0FF" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-surface/40 border border-white/5 p-2 sm:p-8 lg:p-10 flex flex-col relative overflow-hidden">
          {/* Decorative Grid Background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div className="relative z-10 flex items-center justify-between mb-6 sm:mb-10">
            <h3 className="font-heading text-[10px] sm:text-xs lg:text-sm font-black flex items-center gap-3 tracking-[0.4em] uppercase text-white">
              <History size={16} className="text-accent" />
              RECENT_SESSIONS
            </h3>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-accent/40 rounded-full"></div>
              <div className="w-1 h-1 bg-accent/20 rounded-full"></div>
              <div className="w-1 h-1 bg-accent/10 rounded-full"></div>
            </div>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[500px] sm:max-h-[600px] relative z-10">
            {historySessions.length > 0 ? (
              historySessions.slice(0, 10).map((session) => (
                <div key={session.id} className="group relative">
                  
                  <div className="relative p-3 sm:p-4 bg-black/40 border border-white/5 transition-all duration-300 hover:border-white/10">
                    {/* Status Indicator Bar */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${
                      session.status?.toString().toUpperCase() === 'COMPLETED' ? 'bg-emerald-500' : 
                      session.status?.toString().toUpperCase() === 'FAILED' ? 'bg-rose-500' : 
                      'bg-accent'
                    }`}></div>

                    <div className="flex flex-col gap-3 pl-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 min-w-0">
                          <h4 className="text-[10px] sm:text-xs font-heading font-black text-white uppercase tracking-widest truncate pr-2">
                            {session.name || 'UNNAMED_SESSION'}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-mono text-muted/40 uppercase tracking-widest">{formatDate(session.createdAt)}</span>
                          </div>
                        </div>
                        <div className={`px-2 py-0.5 border text-[7px] font-heading font-black uppercase tracking-widest text-center shrink-0 ${
                          session.status?.toString().toUpperCase() === 'COMPLETED' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' : 
                          session.status?.toString().toUpperCase() === 'FAILED' ? 'border-rose-500/40 text-rose-500 bg-rose-500/5' : 
                          'border-accent/20 text-accent bg-accent/5'
                        }`}>
                          {session.status}
                        </div>
                      </div>

                      <div className="flex items-end justify-between pt-2 border-t border-white/5">
                        <div className="space-y-0.5">
                          <p className="text-[7px] font-heading text-muted/20 uppercase tracking-widest font-black">NET_PROFIT</p>
                          <div className={`text-xs sm:text-sm font-mono font-black tracking-tighter ${session.currentCapital >= session.initialCapital ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {session.currentCapital >= session.initialCapital ? '+' : ''}${(session.currentCapital - session.initialCapital).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>

                        <button 
                          onClick={() => { setSelectedSession(session); setShowModal(true); }}
                          className="w-8 h-8 bg-white/5 border border-white/10 text-muted/40 hover:text-accent hover:border-accent/40 transition-all flex items-center justify-center square-button"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                <Database size={32} className="mb-4" />
                <p className="text-[9px] font-heading uppercase tracking-[0.3em]">No_Recent_Data</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full History - Precision Data Grid */}
      <div className="relative z-10 bg-surface/40 border border-white/5 backdrop-blur-sm overflow-hidden">
        {/* Control Center Header & Filters */}
        <div className="p-2 sm:p-6 lg:p-10 relative overflow-hidden border-b border-white/5">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 blur-[100px] -ml-32 -mb-32"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-8 sm:mb-12">
            <div className="space-y-2 px-2 sm:px-0">
              <div className="flex items-center gap-3 text-accent">
                <div className="w-1.5 h-1.5 bg-accent animate-ping rounded-full"></div>
                <span className="text-[8px] font-heading tracking-[0.4em] uppercase font-black">ARCHIVE</span>
              </div>
              <h3 className="text-xl sm:text-3xl font-heading font-black text-white tracking-tighter uppercase leading-none">SESSION_DATABASE</h3>
              <p className="text-[8px] font-heading text-muted/40 uppercase tracking-[0.2em]">PRECISION_DATA_MAPPING_ACTIVE</p>
            </div>
            
            <div className="w-full lg:w-auto">
              <div className="group w-full px-6 py-4 bg-black/40 border border-white/5 flex items-center justify-between lg:justify-start gap-8 hover:border-accent/30 transition-all">
                <div className="flex flex-col">
                  <span className="text-[7px] font-heading text-muted/40 uppercase tracking-widest">ACTIVE_NODES</span>
                  <span className="text-lg font-heading font-black text-white">{filteredSessions.length}</span>
                </div>
                <div className="w-[1px] h-8 bg-white/10"></div>
                <div className="flex flex-col text-right lg:text-left">
                  <span className="text-[7px] font-heading text-muted/40 uppercase tracking-widest">SYSTEM_HEALTH</span>
                  <span className="text-[9px] font-heading font-black text-emerald-500 uppercase tracking-widest">OPTIMAL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Unified Filter Bar - Individual & Compact Style */}
          <div className="relative z-10 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 mb-4 sm:mb-8">
            {/* Search Module */}
            <div className={`relative group bg-black/40 backdrop-blur-xl border border-white/5 transition-all duration-300 ${isSearchFocused ? 'flex-[2] ring-1 ring-accent/30' : 'flex-1'}`}>
              <Search size={14} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isSearchFocused ? 'text-accent' : 'text-muted'}`} />
              <input 
                type="text"
                placeholder="SEARCH_SESSION..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full bg-transparent pl-10 pr-4 py-4 sm:py-2.5 text-[9px] sm:text-[10px] font-heading tracking-[0.2em] uppercase outline-none placeholder:text-muted/20"
              />
            </div>

            {/* Status Module */}
            <div className="w-full sm:w-auto relative group bg-black/40 backdrop-blur-xl border border-white/5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full sm:w-auto bg-transparent py-4 sm:py-2.5 pl-4 pr-10 text-[9px] sm:text-[10px] font-heading font-black uppercase tracking-widest outline-none cursor-pointer appearance-none text-white min-w-[140px]"
              >
                <option value="ALL" className="bg-black text-white">ALL_STATUS</option>
                <option value="ACTIVE" className="bg-black text-white">ACTIVE</option>
                <option value="COMPLETED" className="bg-black text-white">COMPLETED</option>
                <option value="FAILED" className="bg-black text-white">FAILED</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none group-hover:text-accent transition-colors" />
            </div>

            {/* Date Module */}
            <div className="w-full sm:w-auto flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/5 px-4 py-4 sm:py-2.5 relative group cursor-pointer" onClick={() => openDatePicker(startDateRef)}>
              <Calendar size={12} className="text-accent/30 group-hover:text-accent transition-colors" />
              <input 
                ref={startDateRef}
                type="date" 
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="bg-transparent border-none text-[9px] font-heading text-white uppercase tracking-widest outline-none cursor-pointer w-full sm:w-24"
              />
              <ChevronDown size={12} className="text-muted pointer-events-none group-hover:text-accent transition-colors ml-auto sm:ml-2" />
            </div>

            {/* Sort Module */}
            <button 
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 sm:py-2.5 bg-black/40 backdrop-blur-xl border border-white/5 text-muted hover:text-accent hover:border-accent transition-all group square-button"
            >
              {sortOrder === 'desc' ? <ArrowDownWideNarrow size={14} /> : <ArrowUpNarrowWide size={14} />}
              <span className="text-[9px] font-heading font-black uppercase tracking-widest">
                {sortOrder === 'desc' ? 'NEWEST' : 'OLDEST'}
              </span>
            </button>
          </div>
        </div>

        {/* Precision Data List - Plain Grid with Vertical Dividers & Consistent Icons */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar px-2 pb-2">
          {/* Header Strip - Desktop Only */}
          <div className="hidden lg:grid grid-cols-[24%_14%_14%_14%_14%_10%_10%] items-stretch text-[8px] sm:text-[9px] lg:text-[10px] font-heading font-black text-muted/40 uppercase tracking-[0.3em] bg-black border-b border-white/5 sticky top-0 z-20">
            <div className="px-4 sm:px-6 py-4 flex items-center gap-3">
              <Database size={12} className="text-accent/40" />
              SESSION_IDENTITY
            </div>
            <div className="px-4 sm:px-6 py-4 flex items-center gap-3">
              <Clock size={12} className="text-accent/40" />
              START_TIME
            </div>
            <div className="px-4 sm:px-6 py-4 flex items-center gap-3">
              <Clock size={12} className="text-accent/40" />
              CLOSE_TIME
            </div>
            <div className="px-4 sm:px-6 py-4 flex items-center gap-3">
              <DollarSign size={12} className="text-accent/40" />
              CAPITAL_FLOW
            </div>
            <div className="px-4 sm:px-6 py-4 flex items-center gap-3">
              <Activity size={12} className="text-accent/40" />
              NET_YIELD
            </div>
            <div className="px-4 sm:px-6 py-4 flex items-center justify-center gap-3">
              <Target size={12} className="text-accent/40" />
              STATUS
            </div>
            <div className="px-4 sm:px-6 py-4 text-right">
              ACTIONS
            </div>
          </div>

          {filteredSessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.01 }}
              className="group relative bg-black/40 border border-white/5 transition-all duration-300 hover:border-white/10"
            >
              {/* Status Indicator Bar */}
              <div className={`absolute top-0 left-0 w-1 h-full ${
                session.status?.toString().toUpperCase() === 'COMPLETED' ? 'bg-emerald-500' : 
                session.status?.toString().toUpperCase() === 'FAILED' ? 'bg-rose-500' : 'bg-accent'
              }`}></div>

              {/* Desktop Row */}
              <div className="hidden lg:grid grid-cols-[24%_14%_14%_14%_14%_10%_10%] items-stretch">
                {/* Identity */}
                <div className="px-4 sm:px-6 py-4 flex items-center min-w-0">
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-[10px] sm:text-[11px] lg:text-xs font-heading font-black text-white uppercase tracking-widest group-hover:text-accent transition-colors truncate">
                      {session.name || 'UNNAMED_NODE'}
                    </h4>
                    <p className="text-[6px] sm:text-[7px] font-heading text-muted/30 uppercase tracking-[0.2em] truncate">
                      {session.serialNumber || `SN: SES-${session.id.slice(-4).toUpperCase()}`}
                    </p>
                  </div>
                </div>

                {/* Starting Time */}
                <div className="px-4 sm:px-6 py-4 flex items-center gap-3">
                  <Clock size={12} className="text-accent/20 shrink-0" />
                  <div className="flex items-baseline gap-2">
                    <span className="text-[8px] sm:text-[9px] font-mono text-white/80 font-bold">{formatDate(session.createdAt)}</span>
                    <span className="text-[8px] sm:text-[9px] font-mono text-white/60">{formatTime(session.createdAt)}</span>
                  </div>
                </div>

                {/* Closing Time */}
                <div className="px-4 sm:px-6 py-4 flex items-center gap-3">
                  <Clock size={12} className="text-accent/20 shrink-0" />
                  <div className="flex items-baseline gap-2">
                    {session.completedAt ? (
                      <>
                        <span className="text-[8px] sm:text-[9px] font-mono text-white/80 font-bold">{formatDate(session.completedAt)}</span>
                        <span className="text-[8px] sm:text-[9px] font-mono text-white/60">{formatTime(session.completedAt)}</span>
                      </>
                    ) : (
                      <span className="text-[7px] sm:text-[8px] font-heading text-muted/20 uppercase tracking-widest">IN_PROGRESS</span>
                    )}
                  </div>
                </div>

                {/* Capital Flow */}
                <div className="px-4 sm:px-6 py-4 flex items-center gap-3">
                  <DollarSign size={12} className="text-accent/20 shrink-0" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] sm:text-[10px] font-mono text-white/80 font-bold">${session.currentCapital.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                    <span className="text-[9px] sm:text-[10px] font-mono text-muted/20">/</span>
                    <span className="text-[9px] sm:text-[10px] font-mono text-white/80 font-bold">${session.initialCapital.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>

                {/* Yield */}
                <div className={`px-4 sm:px-6 py-4 flex items-center gap-3 ${session.currentCapital >= session.initialCapital ? 'text-emerald-500' : 'text-rose-500'}`}>
                  <Activity size={12} className="opacity-20 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[9px] sm:text-[10px] font-mono font-black tracking-tighter">
                      {session.currentCapital >= session.initialCapital ? '+' : ''}${(session.currentCapital - session.initialCapital).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[6px] sm:text-[7px] font-heading uppercase tracking-widest opacity-40">
                      {(((session.currentCapital - session.initialCapital) / session.initialCapital) * 100).toFixed(1)}% ROI
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="px-4 sm:px-6 py-4 flex items-center justify-center">
                  <div className={`w-20 sm:w-24 py-1.5 border text-[7px] sm:text-[8px] font-heading font-black uppercase tracking-widest text-center transition-all duration-300 ${
                    session.status?.toString().toUpperCase() === 'COMPLETED' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' : 
                    session.status?.toString().toUpperCase() === 'FAILED' ? 'border-rose-500/40 text-rose-500 bg-rose-500/5' : 
                    'border-accent/20 text-accent bg-accent/5'
                  }`}>
                    {session.status}
                  </div>
                </div>

                {/* Action */}
                <div className="px-6 py-4 flex items-center justify-end gap-3">
                  <button 
                    onClick={() => { setSelectedSession(session); setShowModal(true); }}
                    className="w-10 h-10 bg-white/5 border border-white/10 text-muted/40 hover:text-accent hover:border-accent/40 transition-all flex items-center justify-center relative group"
                    title="View Details"
                    style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(session.id)}
                    className="w-10 h-10 bg-error/5 border border-error/20 text-error/60 hover:bg-error hover:text-white hover:border-error transition-all flex items-center justify-center relative group"
                    title="Delete Session"
                    style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 80% 100%, 0 100%, 0 20%)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Mobile Card View - Box Style */}
              <div className="lg:hidden">
                <div className="p-4 space-y-5 relative overflow-hidden group/card">
                  <div className="flex justify-between items-start pl-3">
                    <div className="space-y-1">
                      <span className="text-[7px] sm:text-[8px] font-heading text-muted/40 uppercase tracking-widest">
                        {session.serialNumber || `SN: SES-${session.id.slice(-4).toUpperCase()}`}
                      </span>
                      <h4 className="text-xs sm:text-sm lg:text-base font-heading font-black text-white uppercase tracking-widest">{session.name || 'UNNAMED_NODE'}</h4>
                    </div>
                    <div className={`px-2 sm:px-3 py-1 border text-[7px] sm:text-[8px] font-heading font-black uppercase tracking-widest text-center ${
                      session.status?.toString().toUpperCase() === 'COMPLETED' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' : 
                      session.status?.toString().toUpperCase() === 'FAILED' ? 'border-rose-500/40 text-rose-500 bg-rose-500/5' : 
                      'border-accent/20 text-accent bg-accent/5'
                    }`}>
                      {session.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5 pl-3">
                    <div className="space-y-1">
                      <p className="text-[7px] font-heading text-muted/40 uppercase tracking-widest">START_TIME</p>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-white/80">{formatDate(session.createdAt)}</span>
                        <span className="text-[9px] font-mono text-muted/40">{formatTime(session.createdAt)}</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[7px] font-heading text-muted/40 uppercase tracking-widest">CLOSE_TIME</p>
                      <div className="flex flex-col">
                        {session.completedAt ? (
                          <>
                            <span className="text-[10px] font-mono text-white/80">{formatDate(session.completedAt)}</span>
                            <span className="text-[9px] font-mono text-muted/40">{formatTime(session.completedAt)}</span>
                          </>
                        ) : (
                          <span className="text-[10px] font-mono text-muted/20 uppercase">IN_PROGRESS</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pl-3">
                    <div className="space-y-1">
                      <p className="text-[7px] font-heading text-muted/40 uppercase tracking-widest">CAPITAL_FLOW</p>
                      <p className="text-[10px] sm:text-[11px] font-mono text-white font-bold">${session.currentCapital.toLocaleString('en-US', { maximumFractionDigits: 0 })} / ${session.initialCapital.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[7px] font-heading text-muted/40 uppercase tracking-widest">NET_YIELD</p>
                      <p className={`text-[10px] sm:text-[11px] font-mono font-black ${session.currentCapital >= session.initialCapital ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {session.currentCapital >= session.initialCapital ? '+' : ''}${(session.currentCapital - session.initialCapital).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button 
                      onClick={() => { setSelectedSession(session); setShowModal(true); }}
                      className="w-10 h-10 bg-white/5 border border-white/10 text-muted/40 hover:text-accent hover:border-accent/40 transition-all flex items-center justify-center square-button"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(session.id)}
                      className="w-10 h-10 bg-error/5 border border-error/20 text-error/60 hover:bg-error hover:text-white hover:border-error transition-all flex items-center justify-center square-button"
                      title="Delete Session"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredSessions.length === 0 && (
          <div className="py-20 sm:py-32 flex flex-col items-center justify-center gap-6 bg-surface/20 border border-dashed border-white/5">
            <div className="relative">
              <Database size={40} className="text-muted/10" />
            </div>
            <div className="text-center space-y-1.5 px-4">
              <p className="text-[9px] sm:text-[10px] font-heading text-muted/40 uppercase tracking-[0.2em] sm:tracking-[0.6em]">NO_RECORDS_FOUND_IN_ARCHIVE</p>
              <p className="text-[7px] sm:text-[8px] font-heading text-muted/20 uppercase tracking-widest">ADJUST_FILTERS_TO_RESCAN_DATABASE</p>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showModal && selectedSession && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
            onClick={() => setShowModal(false)}
          ></motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 w-full max-w-5xl bg-[#050505] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col max-h-[90vh] overflow-hidden"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)' }}
          >
            {/* Minimalist Header */}
            <div className="px-6 sm:px-10 py-6 sm:py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3 sm:gap-6">
                <div className="p-2 sm:p-3 bg-accent/10 border border-accent/20 relative">
                  <Cpu size={16} className="text-accent sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  <div className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t border-l border-accent"></div>
                  <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b border-r border-accent"></div>
                </div>
                <div className="space-y-0.5 sm:space-y-1 min-w-0">
                  <h3 className="text-sm sm:text-lg lg:text-xl font-heading font-black text-white uppercase tracking-widest truncate">
                    {selectedSession.name || 'SESSION_NODE'}
                  </h3>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <p className="text-[8px] sm:text-[10px] font-heading text-accent/40 uppercase tracking-[0.2em]">
                      {selectedSession.serialNumber || `SN: SES-${selectedSession.id.slice(-4).toUpperCase()}`}
                    </p>
                    <div className="w-1 h-1 rounded-full bg-white/20 shrink-0"></div>
                    <span className={`text-[8px] sm:text-[10px] font-heading font-black uppercase tracking-widest shrink-0 ${
                      selectedSession.status?.toString().toUpperCase() === 'COMPLETED' ? 'text-emerald-500' : 
                      selectedSession.status?.toString().toUpperCase() === 'FAILED' ? 'text-rose-500' : 'text-accent'
                    }`}>
                      {selectedSession.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setShowModal(false)}
                className="text-muted/40 hover:text-white transition-colors"
              >
                <div className="relative w-5 h-5 sm:w-6 sm:h-6">
                  <span className="absolute top-1/2 left-0 w-full h-[1px] bg-white/40 rotate-45 group-hover:bg-accent transition-colors"></span>
                  <span className="absolute top-1/2 left-0 w-full h-[1px] bg-white/40 -rotate-45 group-hover:bg-accent transition-colors"></span>
                </div>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-6 sm:space-y-10 custom-scrollbar">
              {/* Overview Grid */}
              <div className="space-y-4 sm:space-y-6">
                {/* Main Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    { [
                      { label: 'INITIAL', val: `$${selectedSession.initialCapital.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, icon: <Database size={10}/> },
                      { label: 'FINAL', val: `$${selectedSession.currentCapital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <Target size={10}/> },
                      { label: 'PROFIT', val: `$${(selectedSession.currentCapital - selectedSession.initialCapital).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <TrendingUp size={10}/>, color: selectedSession.currentCapital >= selectedSession.initialCapital ? 'text-emerald-500' : 'text-rose-500' },
                      { label: 'YIELD', val: `${(((selectedSession.currentCapital - selectedSession.initialCapital) / selectedSession.initialCapital) * 100).toFixed(1)}%`, icon: <Activity size={10}/>, color: selectedSession.currentCapital >= selectedSession.initialCapital ? 'text-emerald-500' : 'text-rose-500' },
                    ].map((s, i) => (
                      <div key={i} className="p-3 sm:p-4 bg-white/[0.02] border border-white/10 space-y-1 sm:space-y-2 relative group" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}>
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-hover:border-accent transition-colors"></div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-muted/40 group-hover:text-accent transition-colors">
                          {s.icon}
                          <span className="text-[7px] sm:text-[8px] lg:text-[9px] font-heading uppercase tracking-widest">{s.label}</span>
                        </div>
                        <p className={`text-xs sm:text-lg lg:text-xl font-heading font-black tracking-tighter ${s.color || 'text-white'} truncate`} title={s.val}>{s.val}</p>
                      </div>
                    ))}
                </div>

                {/* Description / Brief */}
                <div className="p-3 sm:p-4 bg-white/[0.02] border border-white/5 flex flex-col justify-center">
                  <p className="text-[6px] sm:text-[7px] font-heading text-muted/40 uppercase tracking-widest mb-1 sm:mb-2">SESSION_BRIEF</p>
                  <p className="text-[9px] sm:text-[11px] lg:text-xs text-muted leading-relaxed italic">
                    {selectedSession.description || 'No additional intelligence data provided for this session node.'}
                  </p>
                </div>
              </div>

              {/* Data Stream Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                {/* Left: Trade Sequence */}
                <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between px-1 sm:px-2">
                    <h4 className="text-[8px] sm:text-[9px] font-heading font-black text-white uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-2 sm:gap-3">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-accent animate-pulse"></div>
                      EXECUTION_LOG
                    </h4>
                    <span className="text-[6px] sm:text-[7px] font-mono text-muted/40 uppercase tracking-widest">{selectedSession.trades.length} OPS_RECORDED</span>
                  </div>
                  
                  <div className="border border-white/5 bg-black/20 divide-y divide-white/5 max-h-[300px] sm:max-h-[400px] overflow-y-auto custom-scrollbar">
                    {selectedSession.trades.map((trade, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 sm:p-4 hover:bg-white/[0.02] transition-colors group">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <span className="text-[8px] sm:text-[10px] font-mono text-muted/20 w-6 sm:w-8">{(idx + 1).toString().padStart(2, '0')}</span>
                          <div className={`w-0.5 sm:w-1 h-4 sm:h-5 ${trade.outcome === 'WIN' ? 'bg-emerald-500' : trade.outcome === 'LOSE' ? 'bg-rose-500' : 'bg-accent'}`}></div>
                          <div className="space-y-0">
                            <span className="block text-xs sm:text-sm font-mono text-white font-bold">${trade.betAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <span className="block text-[6px] sm:text-[8px] font-heading text-muted/30 uppercase tracking-widest">STAKE</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className="text-right">
                            <span className={`block text-[8px] sm:text-[10px] font-heading font-black tracking-widest ${trade.outcome === 'WIN' ? 'text-emerald-500' : trade.outcome === 'LOSE' ? 'text-rose-500' : 'text-accent'}`}>
                              {trade.outcome || 'PENDING'}
                            </span>
                            <span className="block text-[7px] sm:text-[9px] font-mono text-muted/30 uppercase">
                              {trade.timestamp ? formatTime(trade.timestamp) : '---'}
                            </span>
                          </div>
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border ${trade.outcome === 'WIN' ? 'border-emerald-500/10 text-emerald-500' : trade.outcome === 'LOSE' ? 'border-rose-500/10 text-rose-500' : 'border-accent/10 text-accent'}`}>
                            {trade.outcome === 'WIN' ? <TrendingUp size={14}/> : trade.outcome === 'LOSE' ? <TrendingDown size={14}/> : <Activity size={14}/>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Strategy & Performance */}
                <div className="lg:col-span-5 space-y-4 sm:space-y-6">
                  {/* Strategy Params */}
                  <div className="p-4 sm:p-6 bg-white/[0.01] border border-white/5 space-y-4 sm:space-y-6">
                    <h4 className="text-[8px] sm:text-[9px] font-heading font-black text-white uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-2 sm:gap-3">
                      <Cpu size={10} className="text-accent" />
                      STRATEGY_CONFIG
                    </h4>
                    <div className="space-y-3 sm:space-y-4">
                      {[
                        { label: 'TOTAL_STEPS', val: selectedSession.totalEvents },
                        { label: 'TARGET_WINS', val: selectedSession.expectedWins },
                        { label: 'MARKET_ODDS', val: `@${selectedSession.odds.toFixed(2)}` },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-[7px] sm:text-[8px] font-heading text-muted/60 uppercase tracking-widest">{item.label}</span>
                          <span className="text-[10px] sm:text-xs font-mono text-white font-black">{item.val}</span>
                        </div>
                      ))}
                      <div className="pt-3 sm:pt-4 border-t border-white/5 grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-0.5 sm:space-y-1">
                          <span className="text-[6px] sm:text-[7px] font-heading text-emerald-500/60 uppercase tracking-widest">WINS</span>
                          <p className="text-base sm:text-xl font-mono text-emerald-500 font-black">{selectedSession.wins}</p>
                        </div>
                        <div className="space-y-0.5 sm:space-y-1 text-right">
                          <span className="text-[6px] sm:text-[7px] font-heading text-rose-500/60 uppercase tracking-widest">LOSSES</span>
                          <p className="text-base sm:text-xl font-mono text-rose-500 font-black">{selectedSession.losses}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Streak Analysis */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-emerald-500/[0.02] border border-emerald-500/10">
                      <p className="text-[6px] sm:text-[7px] font-heading text-emerald-500/40 uppercase tracking-widest mb-0.5 sm:mb-1">MAX_WIN_STREAK</p>
                      <p className="text-xl sm:text-2xl font-heading font-black text-emerald-500">
                        {selectedSession.trades.reduce((acc, t) => {
                          if (t.outcome === 'WIN') { acc.current++; acc.max = Math.max(acc.max, acc.current); }
                          else { acc.current = 0; }
                          return acc;
                        }, { current: 0, max: 0 }).max}
                      </p>
                    </div>
                    <div className="p-3 sm:p-4 bg-rose-500/[0.02] border border-rose-500/10">
                      <p className="text-[6px] sm:text-[7px] font-heading text-rose-500/40 uppercase tracking-widest mb-0.5 sm:mb-1">MAX_LOSS_STREAK</p>
                      <p className="text-xl sm:text-2xl font-heading font-black text-rose-500">
                        {selectedSession.trades.reduce((acc, t) => {
                          if (t.outcome === 'LOSE') { acc.current++; acc.max = Math.max(acc.max, acc.current); }
                          else { acc.current = 0; }
                          return acc;
                        }, { current: 0, max: 0 }).max}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-t border-white/5 bg-black/40 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Clock size={10} className="text-muted/40" />
                  <span className="text-[6px] sm:text-[7px] font-mono text-muted/40 uppercase tracking-widest">OPENED: {formatTime(selectedSession.createdAt)}</span>
                </div>
                <div className="w-[1px] h-3 bg-white/10"></div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Database size={10} className="text-muted/40" />
                  <span className="text-[6px] sm:text-[7px] font-mono text-muted/40 uppercase tracking-widest">STATUS: STABLE</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setShowDeleteConfirm(selectedSession.id)}
                  className="w-full sm:w-auto px-6 py-4 bg-error/10 border border-error/20 text-error text-[10px] font-heading font-black uppercase tracking-[0.2em] hover:bg-error hover:text-white transition-all flex items-center justify-center gap-2"
                  style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                >
                  <Trash2 size={14} />
                  DELETE
                </button>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto px-10 py-4 bg-white text-black text-[10px] font-heading font-black uppercase tracking-[0.4em] hover:bg-accent transition-all"
                  style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                >
                  CLOSE_NODE
                </button>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
      <style>{` @keyframes v-scan { 0% { top: -10%; opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.8; } 100% { top: 110%; opacity: 0; } } `}</style>
      <ConfirmDialog 
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => showDeleteConfirm && handleDeleteSession(showDeleteConfirm)}
        title="DELETE_SESSION"
        message="Are you sure you want to permanently delete this session record? This action cannot be undone."
        confirmLabel={isDeleting ? "DELETING..." : "DELETE"}
        type="danger"
      />
    </div>
  );
};

export default MoneyManagementHistory;
