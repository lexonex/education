import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';
import { useUIStore } from '../store/uiStore';
import { MoneyManagementSession, MoneyManagementTrade, UserRole } from '../types';
import { useMoneyManagementStore } from '../store/moneyManagementStore';
import { calculateVMatrix, calculateBetAmount, getExpectedFinalCapital } from '../lib/moneyManagement';
import { db, getPath } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { Play, RotateCcw, TrendingUp, Target, DollarSign, CheckCircle2, XCircle, History, ChevronRight, AlertTriangle, Activity, ShieldAlert, Database, ArrowDownWideNarrow, ArrowUpNarrowWide, Percent, Zap, Info, Layers, Cpu, ChevronLeft } from 'lucide-react';
import { isPermissionActive } from '../lib/utils';

const MoneyManagementPage: React.FC = () => {
  const { user } = useAuthStore();
  const { addLog } = useDataStore();
  const { activeSession, settings, isDataLoaded, fetchActiveData, fetchHistoryData } = useMoneyManagementStore();
  const { setGlobalLoading } = useUIStore();
  
  const [localSession, setLocalSession] = useState<MoneyManagementSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Form State
  const [capital, setCapital] = useState<number | string>(100);
  const [totalEvents, setTotalEvents] = useState<number | string>(15);
  const [expectedWins, setExpectedWins] = useState<number | string>(6);
  const [odds, setOdds] = useState<number | string>(1.90);
  const [sessionName, setSessionName] = useState<string>('');
  const [sessionDescription, setSessionDescription] = useState<string>('');

  // Helper for comma formatting
  const formatNumber = (val: string | number) => {
    if (val === '' || val === undefined || val === null) return '';
    const strVal = val.toString();
    const parts = strVal.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
  };

  useEffect(() => {
    if (user) {
      // If data is already loaded, just ensure loading is false
      if (isDataLoaded) {
        setLoading(false);
        // Optionally fetch in background to refresh
        fetchActiveData(user.uid);
      } else {
        setGlobalLoading(true);
        fetchActiveData(user.uid).then(() => {
          setLoading(false);
          setGlobalLoading(false);
        });
      }
    }
  }, [user, fetchActiveData, setGlobalLoading, isDataLoaded]);

  useEffect(() => {
    setLocalSession(activeSession);
  }, [activeSession]);

  useEffect(() => {
    if (settings) {
      setTotalEvents(settings.totalEvents);
      setExpectedWins(settings.expectedWins);
      setOdds(settings.odds);
    }
  }, [settings]);

  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) mainContent.scrollTo(0, 0);
  }, [localSession ? localSession.id : null]);

  const saveSettings = async (t: number, e: number, o: number) => {
    if (!user) return;
    try {
      const q = query(collection(db, getPath('money_management_settings')), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      if (snap.empty) {
        await addDoc(collection(db, getPath('money_management_settings')), { userId: user.uid, totalEvents: t, expectedWins: e, odds: o });
      } else {
        await updateDoc(doc(db, getPath('money_management_settings'), snap.docs[0].id), { totalEvents: t, expectedWins: e, odds: o });
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  };

  const startNewSession = async () => {
    if (!user) return;
    const numCapital = Number(capital);
    const numTotalEvents = Number(totalEvents);
    const numExpectedWins = Number(expectedWins);
    const numOdds = Number(odds);

    if (numExpectedWins > numTotalEvents) {
      setError('Target wins cannot exceed total trades');
      return;
    }

    setLoading(true);
    setGlobalLoading(true);
    try {
      await saveSettings(numTotalEvents, numExpectedWins, numOdds);
      
      // Generate Serial Number: SN: SES-XXXX (where XXXX is count + 100001)
      const sessionsQuery = query(collection(db, getPath('money_management_sessions')), where('userId', '==', user.uid));
      const sessionsSnap = await getDocs(sessionsQuery);
      const sessionCount = sessionsSnap.size;
      const serialNumber = `SN: SES-${(100001 + sessionCount).toString()}`;

      const V = calculateVMatrix(numTotalEvents, numExpectedWins, numOdds);
      const finalCapital = getExpectedFinalCapital(numCapital, numTotalEvents, numExpectedWins, V);
      
      const firstBet = calculateBetAmount(numCapital, numTotalEvents, numExpectedWins, numOdds, V);

      const newSession: Partial<MoneyManagementSession> = {
        userId: user.uid,
        adminId: user.adminId || 'default',
        name: sessionName || 'SESSION',
        description: sessionDescription,
        initialCapital: numCapital,
        totalEvents: numTotalEvents,
        expectedWins: numExpectedWins,
        odds: numOdds,
        currentCapital: numCapital,
        wins: 0,
        losses: 0,
        status: 'ACTIVE',
        serialNumber,
        trades: [
          {
            tradeNo: 1,
            betAmount: Number(firstBet.toFixed(2)),
            returnAmount: 0,
            currentCapital: numCapital,
            timestamp: new Date().toISOString(),
          }
        ],
        createdAt: new Date().toISOString(),
        finalCapital: Number(finalCapital.toFixed(2)),
        netProfit: Number((finalCapital - numCapital).toFixed(2)),
        roi: Number(((finalCapital - numCapital) / numCapital * 100).toFixed(2))
      };

      const docRef = await addDoc(collection(db, getPath('money_management_sessions')), {
        ...newSession,
        createdAt: serverTimestamp()
      });
      
      const createdSession = { id: docRef.id, ...newSession } as MoneyManagementSession;
      setLocalSession(createdSession);
      
      // Update Store
      useMoneyManagementStore.setState(state => ({ 
        activeSession: createdSession,
        historySessions: [createdSession, ...state.historySessions]
      }));
      
      setError(null);
    } catch (err) {
      console.error('Error starting session:', err);
      setError('Failed to start new session');
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const handleTradeResult = async (outcome: 'WIN' | 'LOSE') => {
    if (!localSession) return;

    const currentTrade = localSession.trades[localSession.trades.length - 1];
    const newWins = outcome === 'WIN' ? localSession.wins + 1 : localSession.wins;
    const newLosses = outcome === 'LOSE' ? localSession.losses + 1 : localSession.losses;
    
    let newCapital = localSession.currentCapital;
    let returnAmount = 0;

    if (outcome === 'WIN') {
      returnAmount = currentTrade.betAmount * localSession.odds;
      newCapital = localSession.currentCapital + (currentTrade.betAmount * (localSession.odds - 1));
    } else {
      newCapital = localSession.currentCapital - currentTrade.betAmount;
    }

    const updatedTrades = [...localSession.trades];
    updatedTrades[updatedTrades.length - 1] = {
      ...currentTrade,
      outcome,
      returnAmount: Number(returnAmount.toFixed(2)),
      currentCapital: Number(newCapital.toFixed(2))
    };

    const nRemaining = localSession.totalEvents - (newWins + newLosses);
    const kRemaining = localSession.expectedWins - newWins;

    let status: 'ACTIVE' | 'COMPLETED' | 'FAILED' = 'ACTIVE';
    if (kRemaining <= 0) status = 'COMPLETED';
    else if (nRemaining < kRemaining) status = 'FAILED';

    if (status === 'ACTIVE') {
      const V = calculateVMatrix(localSession.totalEvents, localSession.expectedWins, localSession.odds);
      const nextBet = calculateBetAmount(newCapital, nRemaining, kRemaining, localSession.odds, V);
      
      updatedTrades.push({
        tradeNo: updatedTrades.length + 1,
        betAmount: Number(nextBet.toFixed(2)),
        returnAmount: 0,
        currentCapital: Number(newCapital.toFixed(2)),
        timestamp: new Date().toISOString()
      });
    }

    const sessionUpdate: Partial<MoneyManagementSession> = {
      currentCapital: Number(newCapital.toFixed(2)),
      wins: newWins,
      losses: newLosses,
      status,
      trades: updatedTrades,
      ...(status !== 'ACTIVE' ? { completedAt: new Date().toISOString() } : {})
    };

    try {
      await updateDoc(doc(db, getPath('money_management_sessions'), localSession.id), sessionUpdate);
      const updatedSession = { ...localSession, ...sessionUpdate } as MoneyManagementSession;
      setLocalSession(updatedSession);
      
      // Update Store
      useMoneyManagementStore.setState(state => ({ 
        activeSession: updatedSession,
        historySessions: state.historySessions.map(s => s.id === updatedSession.id ? updatedSession : s)
      }));
      
    } catch (err) {
      console.error('Error updating trade:', err);
      setError('Failed to update trade result');
    }
  };

  const handleTerminateSession = async () => {
    if (!localSession) return;
    setLoading(true);
    setGlobalLoading(true);
    try {
      const completedAt = new Date().toISOString();
      await updateDoc(doc(db, getPath('money_management_sessions'), localSession.id), {
        status: 'FAILED',
        completedAt
      });
      
      const updatedSession = { 
        ...localSession, 
        status: 'FAILED' as const, 
        completedAt 
      };
      
      setLocalSession(updatedSession);
      
      // Update Store
      useMoneyManagementStore.setState(state => ({ 
        activeSession: updatedSession,
        historySessions: state.historySessions.map(s => s.id === updatedSession.id ? updatedSession : s)
      }));
      
      addLog('PROTOCOL_ABORT', user?.displayName || 'User', 'Manually terminated active MONEY_MANAGEMENT session.');
      setShowTerminateConfirm(false);
    } catch (err) {
      console.error('Error terminating session:', err);
      setError('Failed to terminate session');
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const resetSession = () => {
    setLocalSession(null);
    useMoneyManagementStore.setState({ activeSession: null });
    setError(null);
  };

  const sortedTrades = useMemo(() => {
    if (!localSession) return [];
    return sortOrder === 'desc' ? [...localSession.trades].reverse() : localSession.trades;
  }, [localSession?.trades, sortOrder]);

  const previewV = useMemo(() => calculateVMatrix(Number(totalEvents) || 1, Number(expectedWins) || 1, Number(odds) || 1.01), [totalEvents, expectedWins, odds]);
  const previewFinal = useMemo(() => getExpectedFinalCapital(Number(capital) || 0, Number(totalEvents) || 1, Number(expectedWins) || 1, previewV), [capital, totalEvents, expectedWins, previewV]);
  const previewProfit = previewFinal - (Number(capital) || 0);
  const previewROI = Number(capital) > 0 ? (previewProfit / Number(capital)) * 100 : 0;
  const previewWinProb = Number(totalEvents) > 0 ? (Number(expectedWins) / Number(totalEvents)) * 100 : 0;

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
      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-accent">
            <TrendingUp size={16} />
            <p className="text-[10px] font-heading tracking-[0.5em] uppercase font-black">MANAGEMENT</p>
          </div>
          <h2 className="text-2xl sm:text-5xl font-heading font-black tracking-tighter text-white uppercase leading-none">MONEY_MANAGEMENT_V4.0</h2>
        </div>
        
        <div className="hidden md:flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {localSession && localSession.status === 'ACTIVE' && (
              <button 
                onClick={() => setShowTerminateConfirm(true)}
                disabled={loading}
                className={`flex-1 sm:flex-none justify-center px-8 py-4 border border-error/20 text-[10px] font-heading font-black tracking-[0.3em] uppercase transition-all flex items-center gap-2 disabled:opacity-100 relative overflow-hidden ${
                  loading ? 'bg-error text-white' : 'bg-error/10 text-error hover:bg-error hover:text-white'
                }`}
                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
              >
                <XCircle size={14} />
                CLOSE
              </button>
            )}
            <button 
              onClick={() => {
                window.location.hash = '#/money-management-history';
              }}
              className="flex-1 sm:flex-none justify-center px-8 py-4 bg-white text-black text-[10px] font-heading font-black tracking-[0.2em] uppercase hover:bg-accent transition-all flex items-center gap-3 active:scale-95 shadow-glow-sm"
              style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
            >
              <History size={18} />
              HISTORY
            </button>
          </div>
        </div>
      </div>

      {/* Global Error Display */}
      {error && (
        <div className="relative z-10 p-4 bg-error/10 border border-error/20 text-error text-[10px] font-heading font-bold uppercase tracking-widest flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle size={16} />
            {error}
          </div>
          <button onClick={() => setError(null)} className="hover:text-white">
            <XCircle size={14} />
          </button>
        </div>
      )}

      {/* Unified Stats Grid (Always at top) */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-4">
        {(localSession ? [
          { label: 'CURRENT_BALANCE', val: `$${localSession.currentCapital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <DollarSign size={16}/>, desc: `INIT: $${localSession.initialCapital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-white' },
          { label: 'TARGET_CAPITAL', val: `$${(localSession.finalCapital || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <Target size={16}/>, desc: `GOAL: +$${(localSession.netProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-accent' },
          { label: 'TRADE_PROGRESS', val: `${localSession.wins}/${localSession.expectedWins}`, icon: <TrendingUp size={16}/>, desc: 'WINS_REQUIRED', color: 'text-yellow-500' },
          { label: 'REMAINING_TRADES', val: `${Number(localSession.totalEvents) - (localSession.wins + localSession.losses)}`, icon: <RotateCcw size={16}/>, desc: `TOTAL: ${localSession.totalEvents}`, color: 'text-error' }
        ] : [
          { label: 'INITIAL_CAPITAL', val: `$${Number(capital || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <DollarSign size={16}/>, desc: 'STARTING_NODE', color: 'text-white' },
          { label: 'TARGET_CAPITAL', val: `$${(previewFinal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <Target size={16}/>, desc: 'GOAL_YIELD', color: 'text-accent' },
          { label: 'EXPECTED_PROFIT', val: `$${(previewProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <TrendingUp size={16}/>, desc: 'NET_GAIN', color: 'text-yellow-500' },
          { label: 'WIN_PROBABILITY', val: `${(previewWinProb || 0).toFixed(0)}%`, icon: <Activity size={16}/>, desc: 'SUCCESS_RATE', color: 'text-emerald-500' },
        ]).map((s, i) => (
          <div key={i} className={`bg-surface/80 border border-white/5 p-2 sm:p-5 relative overflow-hidden group transition-all duration-500 flex flex-col justify-between min-h-[140px] sm:min-h-[180px] ${
            s.color === 'text-white' ? 'hover:border-white/40' : 
            s.color === 'text-accent' ? 'hover:border-accent/40' : 
            s.color === 'text-yellow-500' ? 'hover:border-yellow-500/40' : 
            s.color === 'text-emerald-500' ? 'hover:border-emerald-500/40' :
            'hover:border-error/40'
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
                  <h3 className={`${s.val.length > 10 ? 'text-lg sm:text-2xl' : s.val.length > 7 ? 'text-xl sm:text-3xl' : 'text-xl sm:text-4xl'} font-heading font-black tracking-tighter ${s.color}`}>{s.val}</h3>
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

      {/* Mobile Action Buttons - Visible only on mobile */}
      <div className="flex md:hidden flex-col gap-3 relative z-10">
        <div className="flex flex-col items-center gap-3 w-full">
          {localSession && localSession.status === 'ACTIVE' && (
            <button 
              onClick={() => setShowTerminateConfirm(true)}
              disabled={loading}
              className={`w-full justify-center px-6 py-4 border border-error/20 text-[10px] font-heading font-black tracking-[0.3em] uppercase transition-all flex items-center gap-2 disabled:opacity-100 relative overflow-hidden ${
                loading ? 'bg-error text-white' : 'bg-error/10 text-error hover:bg-error hover:text-white'
              }`}
              style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
            >
              <XCircle size={14} />
              CLOSE
            </button>
          )}
          <button 
            onClick={() => {
              window.location.hash = '#/money-management-history';
            }}
            className="w-full justify-center px-8 py-4 bg-white text-black text-[10px] font-heading font-black tracking-[0.2em] uppercase hover:bg-accent transition-all flex items-center gap-3 active:scale-95 shadow-glow-sm"
            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
          >
            <History size={18} />
            HISTORY
          </button>
        </div>
      </div>

      {!localSession ? (
        <div className="relative z-10">
          <div className="bg-surface border border-white/5 overflow-hidden">
            {/* Header Section - Optimized for Mobile */}
            <div className="p-2 sm:p-12 border-b border-white/5 bg-black/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-accent/60">
                    <Zap size={14} />
                    <span className="text-[8px] font-heading font-black tracking-[0.5em] uppercase">SESSION_SETUP</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-heading font-black text-white tracking-tight uppercase">CREATE_SESSION</h2>
                  <p className="text-[9px] sm:text-[10px] text-muted/40 font-heading tracking-widest uppercase">Define parameters for automated management</p>
                </div>
                <div className="flex sm:flex items-center gap-4 px-4 sm:px-6 py-3 bg-white/[0.02] border border-white/5 w-fit">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[8px] sm:text-[9px] font-heading font-bold text-muted/60 uppercase tracking-[0.3em]">System_Ready</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
              {/* Left Side: Parameters - Optimized Padding */}
              <div className="lg:col-span-7 p-2 sm:p-12 space-y-10 sm:space-y-12">
                {/* Identity Section */}
                <div className="space-y-6 sm:space-y-8">
                  <div className="flex items-center gap-3 border-l-2 border-accent pl-4">
                    <span className="text-[9px] sm:text-[10px] font-heading font-black text-white uppercase tracking-[0.4em]">01. SESSION_IDENTITY</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2 sm:space-y-3 group">
                      <label className="flex items-center gap-2 text-[8px] font-heading text-muted/40 uppercase tracking-[0.4em] pl-1 group-focus-within:text-accent transition-colors">
                        SESSION_NAME
                      </label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                        <input 
                          type="text" 
                          value={sessionName}
                          onChange={(e) => setSessionName(e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-muted/10 uppercase text-white"
                          placeholder="IDENTIFIER_NODE..."
                          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                        />
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3 group">
                      <label className="flex items-center gap-2 text-[8px] font-heading text-muted/40 uppercase tracking-[0.4em] pl-1 group-focus-within:text-accent transition-colors">
                        DESCRIPTION
                      </label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                        <input 
                          type="text" 
                          value={sessionDescription}
                          onChange={(e) => setSessionDescription(e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading outline-none focus:border-accent/50 transition-colors duration-300 placeholder:text-muted/10 uppercase text-white"
                          placeholder="OPTIONAL_METADATA..."
                          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                        />
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Section */}
                <div className="space-y-6 sm:space-y-8">
                  <div className="flex items-center gap-3 border-l-2 border-accent pl-4">
                    <span className="text-[9px] sm:text-[10px] font-heading font-black text-white uppercase tracking-[0.4em]">02. FINANCIAL_MATRIX</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2 sm:space-y-3 group">
                      <label className="flex items-center gap-2 text-[8px] font-heading text-muted/40 uppercase tracking-[0.4em] pl-1 group-focus-within:text-accent transition-colors">
                        STARTING_BALANCE
                      </label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                        <div className="flex items-center w-full bg-white/[0.02] border border-white/10 focus-within:border-accent/50 transition-all" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
                          <button 
                            onClick={() => setCapital(Math.max(0, Number(capital) - 10))}
                            className="w-12 h-12 flex items-center justify-center text-muted/40 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <ChevronRight className="rotate-180" size={16} />
                          </button>
                          <div className="flex-1 relative">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-accent/40 pointer-events-none">
                              <DollarSign size={14} />
                            </div>
                            <input 
                              type="text" 
                              value={formatNumber(capital)}
                              onChange={(e) => {
                                const val = e.target.value.replace(/,/g, '');
                                if (/^\d*\.?\d*$/.test(val)) {
                                  setCapital(val);
                                }
                              }}
                              className="w-full h-12 bg-transparent border-none text-center text-[11px] font-heading text-white outline-none px-8 uppercase"
                            />
                          </div>
                          <button 
                            onClick={() => setCapital(Number(capital) + 10)}
                            className="w-12 h-12 flex items-center justify-center text-muted/40 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3 group">
                      <label className="flex items-center gap-2 text-[8px] font-heading text-muted/40 uppercase tracking-[0.4em] pl-1 group-focus-within:text-accent transition-colors">
                        MARKET_ODDS
                      </label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                        <div className="flex items-center w-full bg-white/[0.02] border border-white/10 focus-within:border-accent/50 transition-all" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
                          <button 
                            onClick={() => setOdds(Math.max(1.01, Number((Number(odds) - 0.01).toFixed(2))))}
                            className="w-12 h-12 flex items-center justify-center text-muted/40 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <ChevronRight className="rotate-180" size={16} />
                          </button>
                          <div className="flex-1 relative">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-accent/40 pointer-events-none">
                              <Percent size={14} />
                            </div>
                            <input 
                              type="number" 
                              step="0.01"
                              value={odds}
                              onChange={(e) => setOdds(e.target.value)}
                              className="w-full h-12 bg-transparent border-none text-center text-[11px] font-heading text-white outline-none px-8 uppercase"
                            />
                          </div>
                          <button 
                            onClick={() => setOdds(Number((Number(odds) + 0.01).toFixed(2)))}
                            className="w-12 h-12 flex items-center justify-center text-muted/40 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Execution Section */}
                <div className="space-y-6 sm:space-y-8">
                  <div className="flex items-center gap-3 border-l-2 border-accent pl-4">
                    <span className="text-[9px] sm:text-[10px] font-heading font-black text-white uppercase tracking-[0.4em]">03. EXECUTION_LOGIC</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2 sm:space-y-3 group">
                      <label className="flex items-center gap-2 text-[8px] font-heading text-muted/40 uppercase tracking-[0.4em] pl-1 group-focus-within:text-accent transition-colors">
                        TOTAL_STEPS
                      </label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                        <div className="flex items-center w-full bg-white/[0.02] border border-white/10 focus-within:border-accent/50 transition-all" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
                          <button 
                            onClick={() => setTotalEvents(Math.max(1, Number(totalEvents) - 1))}
                            className="w-12 h-12 flex items-center justify-center text-muted/40 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <ChevronRight className="rotate-180" size={16} />
                          </button>
                          <input 
                            type="number"
                            value={totalEvents}
                            onChange={(e) => setTotalEvents(e.target.value)}
                            className="flex-1 bg-transparent border-none text-center text-[11px] font-heading text-white outline-none uppercase"
                          />
                          <button 
                            onClick={() => setTotalEvents(Math.min(100, Number(totalEvents) + 1))}
                            className="w-12 h-12 flex items-center justify-center text-muted/40 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3 group">
                      <label className="flex items-center gap-2 text-[8px] font-heading text-muted/40 uppercase tracking-[0.4em] pl-1 group-focus-within:text-accent transition-colors">
                        REQUIRED_WINS
                      </label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-accent/0 group-focus-within:bg-accent/[0.02] transition-all duration-500"></div>
                        <div className="flex items-center w-full bg-white/[0.02] border border-white/10 focus-within:border-accent/50 transition-all" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}>
                          <button 
                            onClick={() => setExpectedWins(Math.max(1, Number(expectedWins) - 1))}
                            className="w-12 h-12 flex items-center justify-center text-muted/40 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <ChevronRight className="rotate-180" size={16} />
                          </button>
                          <input 
                            type="number"
                            value={expectedWins}
                            onChange={(e) => setExpectedWins(e.target.value)}
                            className="flex-1 bg-transparent border-none text-center text-[11px] font-heading text-white outline-none uppercase"
                          />
                          <button 
                            onClick={() => setExpectedWins(Math.min(Number(totalEvents), Number(expectedWins) + 1))}
                            className="w-12 h-12 flex items-center justify-center text-muted/40 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-focus-within:border-accent transition-colors"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={startNewSession}
                  disabled={loading}
                  className={`w-full py-5 sm:py-6 font-heading font-black text-[12px] tracking-[0.6em] uppercase transition-all duration-300 disabled:opacity-100 flex justify-center items-center gap-4 group relative overflow-hidden ${
                    loading ? 'bg-accent text-black' : 'bg-white text-black hover:bg-accent hover:shadow-glow'
                  }`}
                  style={{ clipPath: 'polygon(12% 0, 100% 0, 100% 65%, 88% 100%, 0 100%, 0 35%)' }}
                >
                  CREATE_SESSION
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Right Side: Strategy Summary - Aligned & Styled like Inputs */}
              <div className="lg:col-span-5 p-2 sm:p-12 space-y-10 sm:space-y-12 border-l border-white/5 bg-white/[0.01]">
                
                <div className="space-y-6 sm:space-y-8">
                  <div className="flex items-center gap-3 border-l-2 border-accent pl-4">
                    <span className="text-[9px] sm:text-[10px] font-heading font-black text-white uppercase tracking-[0.4em]">PROJECTION_ANALYSIS</span>
                  </div>

                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    {/* Max Loss Buffer */}
                    <div className="space-y-2 sm:space-y-3 group">
                      <label className="flex items-center gap-2 text-[8px] font-heading text-muted/40 uppercase tracking-[0.4em] pl-1 group-hover:text-accent transition-colors">
                        ALLOWED_LOSSES
                      </label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/[0.02] transition-all duration-500"></div>
                        <div 
                          className="w-full bg-white/[0.02] border border-white/10 p-4 flex items-center justify-between transition-all group-hover:border-accent/50"
                          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                        >
                          <div className="flex items-baseline gap-2">
                            <span className="text-[11px] font-heading text-error uppercase font-bold">{(Number(totalEvents) - Number(expectedWins)).toLocaleString('en-US')}</span>
                          </div>
                          <ShieldAlert className="text-muted/20 group-hover:text-accent transition-colors" size={14} />
                        </div>
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-hover:border-accent transition-colors"></div>
                      </div>
                    </div>

                    {/* Initial Entry Load */}
                    <div className="space-y-2 sm:space-y-3 group">
                      <label className="flex items-center gap-2 text-[8px] font-heading text-muted/40 uppercase tracking-[0.4em] pl-1 group-hover:text-accent transition-colors">
                        FIRST_TRADE
                      </label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/[0.02] transition-all duration-500"></div>
                        <div 
                          className="w-full bg-white/[0.02] border border-white/10 p-4 flex items-center justify-between transition-all group-hover:border-accent/50"
                          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                        >
                          <span className="text-[11px] font-heading text-white uppercase font-bold">
                            ${calculateBetAmount(Number(capital), Number(totalEvents), Number(expectedWins), Number(odds), previewV).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <Zap className="text-muted/20 group-hover:text-accent transition-colors" size={14} />
                        </div>
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-hover:border-accent transition-colors"></div>
                      </div>
                    </div>

                    {/* Net Profit Potential */}
                    <div className="space-y-2 sm:space-y-3 group">
                      <label className="flex items-center gap-2 text-[8px] font-heading text-muted/40 uppercase tracking-[0.4em] pl-1 group-hover:text-accent transition-colors">
                        TOTAL_PROFIT
                      </label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/[0.02] transition-all duration-500"></div>
                        <div 
                          className="w-full bg-white/[0.02] border border-white/10 p-4 flex items-center justify-between transition-all group-hover:border-accent/50"
                          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                        >
                          <span className="text-[11px] font-heading text-emerald-500 uppercase font-bold">
                            +${(previewProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <TrendingUp className="text-muted/20 group-hover:text-emerald-500 transition-colors" size={14} />
                        </div>
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-hover:border-accent transition-colors"></div>
                      </div>
                    </div>

                    {/* ROI Yield */}
                    <div className="space-y-2 sm:space-y-3 group">
                      <label className="flex items-center gap-2 text-[8px] font-heading text-muted/40 uppercase tracking-[0.4em] pl-1 group-hover:text-accent transition-colors">
                        TOTAL_ROI
                      </label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/[0.02] transition-all duration-500"></div>
                        <div 
                          className="w-full bg-white/[0.02] border border-white/10 p-4 flex items-center justify-between transition-all group-hover:border-accent/50"
                          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                        >
                          <span className="text-[11px] font-heading text-accent uppercase font-bold">
                            {(previewROI || 0).toFixed(2)}%
                          </span>
                          <Percent className="text-muted/20 group-hover:text-accent transition-colors" size={14} />
                        </div>
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-hover:border-accent transition-colors"></div>
                      </div>
                    </div>

                     {/* Break Even Rate */}
                     <div className="space-y-2 sm:space-y-3 group">
                      <label className="flex items-center gap-2 text-[8px] font-heading text-muted/40 uppercase tracking-[0.4em] pl-1 group-hover:text-accent transition-colors">
                        BREAK_EVEN_%
                      </label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/[0.02] transition-all duration-500"></div>
                        <div 
                          className="w-full bg-white/[0.02] border border-white/10 p-4 flex items-center justify-between transition-all group-hover:border-accent/50"
                          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                        >
                          <span className="text-[11px] font-heading text-white uppercase font-bold">
                            {((1 / Number(odds)) * 100).toFixed(2)}%
                          </span>
                          <Activity className="text-muted/20 group-hover:text-accent transition-colors" size={14} />
                        </div>
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20 group-hover:border-accent transition-colors"></div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 space-y-8">
          {/* Main Action Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Current Trade HUD */}
            <div className="lg:col-span-4">
              {localSession.status === 'ACTIVE' ? (
                <div className="relative group">
                  <div 
                    className="bg-surface border border-accent/50 p-6 sm:p-10 space-y-8 relative overflow-hidden"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)' }}
                  >
                    <div className="relative z-10 space-y-8">
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <div className="space-y-1">
                          <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest">{localSession.name || 'CURRENT_TRADE'}</h3>
                          <p className="text-[8px] text-muted uppercase tracking-widest font-medium">EXECUTION_PHASE</p>
                        </div>
                        <div className="px-3 py-1 bg-accent/10 border border-accent/20 text-[9px] font-heading font-bold text-accent uppercase tracking-wider relative">
                          Live
                          <div className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t border-l border-accent"></div>
                          <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b border-r border-accent"></div>
                        </div>
                      </div>
                      
                      <div className="text-center py-6 bg-black/40 border border-white/5 relative group-hover:border-white/10 transition-colors">
                        <div className="text-[10px] text-muted/60 uppercase tracking-[0.3em] mb-2 font-heading">INVESTMENT_AMOUNT</div>
                        <div className="text-4xl sm:text-5xl font-mono font-black text-white tracking-tight">
                          ${localSession.trades[localSession.trades.length - 1].betAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button 
                          onClick={() => handleTradeResult('WIN')}
                          className="group/btn relative py-4 sm:py-5 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                          style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                        >
                          <CheckCircle2 size={18} className="text-emerald-500 group-hover/btn:text-white transition-colors" />
                          <span className="text-[10px] font-heading font-black uppercase tracking-[0.3em]">WIN</span>
                        </button>
                        <button 
                          onClick={() => handleTradeResult('LOSE')}
                          className="group/btn relative py-4 sm:py-5 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white"
                          style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                        >
                          <XCircle size={18} className="text-rose-500 group-hover/btn:text-white transition-colors" />
                          <span className="text-[10px] font-heading font-black uppercase tracking-[0.3em]">LOSS</span>
                        </button>
                      </div>

                      <div className="flex justify-between items-center px-5 py-4 bg-black/40 border border-white/5 relative group-hover:border-white/10 transition-colors">
                        <span className="text-[9px] font-heading text-muted/60 uppercase tracking-[0.3em]">EXPECTED_PROFIT</span>
                        <span className="text-lg font-mono font-black text-accent">
                          +${(localSession.trades[localSession.trades.length - 1].betAmount * (localSession.odds - 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <div 
                    className={`bg-surface border ${localSession.status === 'COMPLETED' ? 'border-emerald-500/50' : 'border-rose-500/50'} p-6 sm:p-10 text-center space-y-8 relative overflow-hidden`}
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)' }}
                  >
                    <div className="relative z-10 space-y-8">
                      <div className="flex flex-col items-center gap-4">
                        <div className={`p-4 ${localSession.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'} border relative`}>
                          {localSession.status === 'COMPLETED' ? <CheckCircle2 size={40} className="sm:size-[48px]" /> : <XCircle size={40} className="sm:size-[48px]" />}
                          <div className={`absolute -top-1 -left-1 w-2 h-2 border-t border-l ${localSession.status === 'COMPLETED' ? 'border-emerald-500' : 'border-rose-500'}`}></div>
                          <div className={`absolute -bottom-1 -right-1 w-2 h-2 border-b border-r ${localSession.status === 'COMPLETED' ? 'border-emerald-500' : 'border-rose-500'}`}></div>
                        </div>
                        
                        <div className="space-y-2">
                          <h2 className="font-heading text-2xl sm:text-4xl font-black uppercase tracking-tighter text-white leading-none">
                            {localSession.status === 'COMPLETED' ? 'TARGET_REACHED' : 'SESSION_FAILED'}
                          </h2>
                          <p className={`text-[9px] sm:text-[11px] font-heading uppercase tracking-[0.4em] font-black ${localSession.status === 'COMPLETED' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {localSession.status === 'COMPLETED' ? 'YIELD_SECURED' : 'MARGIN_BREACH'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-black/40 border border-white/5 space-y-2 relative group-hover:border-white/10 transition-colors">
                          <p className="text-[8px] sm:text-[9px] font-heading text-muted/60 uppercase tracking-[0.3em]">FINAL_BALANCE</p>
                          <p className="text-xl sm:text-3xl font-mono font-black text-white">${localSession.currentCapital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div className="p-5 bg-black/40 border border-white/5 space-y-2 relative group-hover:border-white/10 transition-colors">
                          <p className="text-[8px] sm:text-[9px] font-heading text-muted/60 uppercase tracking-[0.3em]">NET_RESULT</p>
                          <p className={`text-xl sm:text-3xl font-mono font-black ${localSession.currentCapital >= localSession.initialCapital ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {localSession.currentCapital >= localSession.initialCapital ? '+' : ''}${(localSession.currentCapital - localSession.initialCapital).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={resetSession}
                        className="w-full py-5 bg-white text-black font-heading font-black text-[10px] sm:text-[12px] tracking-[0.4em] sm:tracking-[0.6em] uppercase hover:bg-accent transition-all flex items-center justify-center gap-3 group/btn shadow-glow-sm"
                        style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                      >
                        NEW_SESSION
                        <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Trade Log Module */}
            <div className="lg:col-span-8 bg-surface border border-white/5 overflow-hidden flex flex-col w-full shadow-2xl">
              <div className="px-3 py-4 sm:px-6 sm:py-5 border-b border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <Database size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-heading text-[11px] sm:text-xs font-black tracking-widest uppercase text-white">HISTORY</h3>
                    <p className="text-[9px] sm:text-[10px] text-muted uppercase tracking-widest font-bold">{localSession.trades.filter(t => t.outcome).length} COMPLETED_TRADES</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  className="w-full sm:w-auto flex items-center justify-center px-6 py-4 bg-black/60 border border-white/10 text-[9px] font-heading font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all group relative overflow-hidden"
                >
                  <span className="flex items-center gap-3 relative z-10">
                    {sortOrder === 'desc' ? <ArrowDownWideNarrow size={16} /> : <ArrowUpNarrowWide size={16} />}
                    {sortOrder === 'desc' ? 'LATEST_FIRST' : 'OLDEST_FIRST'}
                  </span>
                </button>
              </div>
              
              {/* Trade History List */}
              <div className="divide-y divide-white/5 bg-black/20 overflow-y-auto max-h-[85vh] sm:max-h-[600px] custom-scrollbar">
                {sortedTrades.map((trade, idx) => (
                  <div key={idx} className={`p-2 sm:p-6 space-y-4 transition-colors ${!trade.outcome ? 'bg-accent/5' : 'hover:bg-white/5'}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-7 sm:w-12 sm:h-8 bg-white/5 border border-white/10 flex items-center justify-center font-mono text-[9px] sm:text-[10px] text-muted font-bold shrink-0">
                          #{trade.tradeNo.toString().padStart(2, '0')}
                        </div>
                        {trade.outcome ? (
                          <div className={`w-20 h-7 sm:w-24 sm:h-8 border text-[8px] sm:text-[9px] font-heading font-black uppercase tracking-widest flex items-center justify-center shrink-0 ${
                            trade.outcome === 'WIN' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-rose-500/30 text-rose-400 bg-rose-500/10'
                          }`}>
                            {trade.outcome}
                          </div>
                        ) : (
                          <div className="w-20 h-7 sm:w-24 sm:h-8 border border-accent/30 text-accent bg-accent/10 text-[8px] sm:text-[9px] font-heading font-black uppercase tracking-widest flex items-center justify-center shrink-0">
                            Pending
                          </div>
                        )}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-muted/40 font-mono font-medium">
                        {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="p-3 bg-black/40 border border-white/5 flex sm:flex-col justify-between sm:justify-start items-center sm:items-start gap-1">
                        <span className="text-[7px] sm:text-[8px] text-muted uppercase font-heading tracking-widest font-bold">AMOUNT</span>
                        <span className="text-xs sm:text-sm font-mono text-white font-black">${trade.betAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="p-3 bg-black/40 border border-white/5 flex sm:flex-col justify-between sm:justify-start items-center sm:items-start gap-1">
                        <span className="text-[7px] sm:text-[8px] text-muted uppercase font-heading tracking-widest font-bold">RESULT</span>
                        <span className={`text-xs sm:text-sm font-mono font-black ${trade.outcome === 'WIN' ? 'text-emerald-400' : trade.outcome === 'LOSE' ? 'text-rose-400' : 'text-white'}`}>
                          {trade.outcome === 'WIN' ? `+$${trade.returnAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : trade.outcome === 'LOSE' ? `-$${trade.betAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                        </span>
                      </div>
                      <div className="p-3 bg-black/40 border border-white/5 flex sm:flex-col justify-between sm:justify-start items-center sm:items-start gap-1">
                        <span className="text-[7px] sm:text-[8px] text-muted uppercase font-heading tracking-widest font-bold">BALANCE</span>
                        <span className="text-xs sm:text-sm font-mono text-accent font-black">${trade.currentCapital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TERMINATE CONFIRMATION MODAL */}
      {showTerminateConfirm && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/95 backdrop-blur-[20px] transition-opacity" onClick={() => setShowTerminateConfirm(false)}></div>
           <div 
             className="relative w-full max-w-md bg-surface border border-error/40 p-8 sm:p-12 animate-in zoom-in duration-300"
             style={{ clipPath: 'polygon(0 30px, 30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)' }}
           >
              <div className="flex flex-col items-center text-center space-y-6">
                 <div className="p-4 bg-error/10 border border-error/20 text-error"><AlertTriangle size={40} className="animate-pulse" /></div>
                 <div className="space-y-2">
                    <h3 className="font-heading text-xl font-black uppercase tracking-tighter text-white">CLOSE_SESSION</h3>
                    <p className="text-[10px] font-heading text-muted uppercase tracking-[0.2em] leading-relaxed">Are you sure you want to close this session? This will mark the session as failed and you can start a new one.</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4 w-full pt-4">
                    <button onClick={() => setShowTerminateConfirm(false)} disabled={loading} className="py-4 border border-white/10 text-[10px] font-heading font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all disabled:opacity-50">CANCEL</button>
                    <button onClick={handleTerminateSession} disabled={loading} className="py-4 bg-error text-white text-[10px] font-heading font-black uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-2 disabled:opacity-50">
                      {loading ? (
                        <div className="w-3 h-3 border-2 border-white animate-spin"></div>
                      ) : 'CLOSE'}
                    </button>
                 </div>
              </div>
           </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MoneyManagementPage;
