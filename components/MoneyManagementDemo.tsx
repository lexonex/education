import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Activity, 
  ShieldAlert, 
  Zap, 
  Percent, 
  ChevronRight,
  Undo2,
  Database,
  History,
  Lock,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  AlertTriangle
} from 'lucide-react';
import { calculateVMatrix, calculateBetAmount, getExpectedFinalCapital } from '../lib/moneyManagement';

const MoneyManagementDemo: React.FC = () => {
  const [localSession, setLocalSession] = useState<any | null>(null);
  const [showRegPrompt, setShowRegPrompt] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  // Form State
  const [capital, setCapital] = useState<number | string>(100);
  const [totalEvents, setTotalEvents] = useState<number | string>(15);
  const [expectedWins, setExpectedWins] = useState<number | string>(6);
  const [odds, setOdds] = useState<number | string>(1.90);
  const [sessionName, setSessionName] = useState<string>('DEMO_SESSION');

  // Helper for comma formatting
  const formatNumber = (val: string | number) => {
    if (val === '' || val === undefined || val === null) return '';
    const strVal = val.toString();
    const parts = strVal.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
  };

  const previewV = useMemo(() => calculateVMatrix(Number(totalEvents) || 1, Number(expectedWins) || 1, Number(odds) || 1.01), [totalEvents, expectedWins, odds]);
  const previewFinal = useMemo(() => getExpectedFinalCapital(Number(capital) || 0, Number(totalEvents) || 1, Number(expectedWins) || 1, previewV), [capital, totalEvents, expectedWins, previewV]);
  const previewProfit = previewFinal - (Number(capital) || 0);
  const previewROI = Number(capital) > 0 ? (previewProfit / Number(capital)) * 100 : 0;
  const previewWinProb = Number(totalEvents) > 0 ? (Number(expectedWins) / Number(totalEvents)) * 100 : 0;

  const startDemoSession = () => {
    const numCapital = Number(capital);
    const numTotalEvents = Number(totalEvents);
    const numExpectedWins = Number(expectedWins);
    const numOdds = Number(odds);

    if (numExpectedWins > numTotalEvents) return;

    const V = calculateVMatrix(numTotalEvents, numExpectedWins, numOdds);
    const finalCapital = getExpectedFinalCapital(numCapital, numTotalEvents, numExpectedWins, V);
    const firstBet = calculateBetAmount(numCapital, numTotalEvents, numExpectedWins, numOdds, V);

    setLocalSession({
      name: sessionName || 'DEMO_NODE',
      initialCapital: numCapital,
      totalEvents: numTotalEvents,
      expectedWins: numExpectedWins,
      odds: numOdds,
      currentCapital: numCapital,
      wins: 0,
      losses: 0,
      status: 'ACTIVE',
      trades: [
        {
          tradeNo: 1,
          betAmount: Number(firstBet.toFixed(2)),
          returnAmount: 0,
          currentCapital: numCapital,
          timestamp: new Date().toISOString(),
        }
      ],
      finalCapital: Number(finalCapital.toFixed(2)),
      netProfit: Number((finalCapital - numCapital).toFixed(2)),
    });
  };

  const handleTradeResult = (outcome: 'WIN' | 'LOSE') => {
    if (!localSession) return;

    // Limitation: Max 2 steps in demo
    const completedTradesCount = localSession.trades.filter((t: any) => t.outcome).length;
    if (completedTradesCount >= 2) {
      setShowRegPrompt(true);
      return;
    }

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

    // Check if we just completed the 2nd trade
    const newCompletedCount = updatedTrades.filter(t => t.outcome).length;
    
    const nRemaining = localSession.totalEvents - (newWins + newLosses);
    const kRemaining = localSession.expectedWins - newWins;

    let status: 'ACTIVE' | 'COMPLETED' | 'FAILED' = 'ACTIVE';
    if (kRemaining <= 0) status = 'COMPLETED';
    else if (nRemaining < kRemaining) status = 'FAILED';

    if (status === 'ACTIVE' && newCompletedCount < 2) {
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

    setLocalSession({
      ...localSession,
      currentCapital: Number(newCapital.toFixed(2)),
      wins: newWins,
      losses: newLosses,
      status: (status === 'ACTIVE' && newCompletedCount >= 2) ? 'ACTIVE' : status, // Keep active but we won't add next trade if limit hit
      trades: updatedTrades
    });

    // If we just finished 2nd trade, we'll let them see the result, but next click prompt will happen via the check at start of function
    // or we could show prompt immediately if we want
  };

  const resetSession = () => {
    setLocalSession(null);
  };

  const sortedTrades = useMemo(() => {
    if (!localSession) return [];
    return sortOrder === 'desc' ? [...localSession.trades].reverse() : localSession.trades;
  }, [localSession?.trades, sortOrder]);

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 py-24 sm:py-32 space-y-16">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-accent/60">
            <Activity size={16} className="animate-pulse" />
            <p className="text-[10px] font-heading tracking-[0.5em] uppercase font-black text-accent">SYSTEM PREVIEW</p>
          </div>
          <h2 className="text-4xl sm:text-6xl font-heading font-black tracking-tighter text-white uppercase leading-none">MONEY MANAGEMENT</h2>
          <p className="text-[11px] text-muted max-w-xl uppercase tracking-widest leading-relaxed font-medium">
             PREVIEW THE SYSTEM MATHEMATICS. DYNAMIC CALCULATION FOR OPTIMAL TRADING RESULTS.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="px-4 py-2 bg-accent/5 border border-accent/20 flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></div>
              <span className="text-[9px] font-heading font-black text-accent tracking-[0.2em]">DEMO ACTIVE</span>
           </div>
        </div>
      </div>

      {/* Unified Stats Grid */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-4">
        {(localSession ? [
          { label: 'CURRENT BALANCE', val: `$${localSession.currentCapital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <DollarSign size={16}/>, desc: `INIT: $${localSession.initialCapital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-white' },
          { label: 'TARGET CAPITAL', val: `$${(localSession.finalCapital || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <Target size={16}/>, desc: `GOAL: +$${(localSession.netProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-accent' },
          { label: 'TRADE PROGRESS', val: `${localSession.wins}/${localSession.expectedWins}`, icon: <TrendingUp size={16}/>, desc: 'WINS REQUIRED', color: 'text-yellow-500' },
          { label: 'REMAINING TRADES', val: `${Number(localSession.totalEvents) - (localSession.wins + localSession.losses)}`, icon: <RotateCcw size={16}/>, desc: `TOTAL STEPS: ${localSession.totalEvents}`, color: 'text-error' }
        ] : [
          { label: 'INITIAL CAPITAL', val: `$${Number(capital || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <DollarSign size={16}/>, desc: 'STARTING NODE', color: 'text-white' },
          { label: 'TARGET CAPITAL', val: `$${(previewFinal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <Target size={16}/>, desc: 'GOAL YIELD', color: 'text-accent' },
          { label: 'EXPECTED PROFIT', val: `$${(previewProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <TrendingUp size={16}/>, desc: 'NET GAIN', color: 'text-yellow-500' },
          { label: 'WIN PROBABILITY', val: `${(previewWinProb || 0).toFixed(0)}%`, icon: <Activity size={16}/>, desc: 'SUCCESS RATE', color: 'text-emerald-500' },
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

      {!localSession ? (
        <div className="bg-surface border border-white/5 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
            {/* Left Side: Parameters */}
            <div className="lg:col-span-7 p-6 sm:p-12 space-y-10 sm:space-y-12">
               <div className="space-y-8">
                  <div className="flex items-center gap-3 border-l-2 border-accent pl-4">
                    <span className="text-[10px] font-heading font-black text-white uppercase tracking-[0.4em]">SESSION SETUP</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3 group">
                      <label className="text-[8px] font-heading text-muted/40 uppercase tracking-[0.4em] pl-1 group-focus-within:text-accent transition-colors">INITIAL CAPITAL</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={formatNumber(capital)}
                          onChange={(e) => {
                            const val = e.target.value.replace(/,/g, '');
                            if (/^\d*\.?\d*$/.test(val)) setCapital(val);
                          }}
                          className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading text-white outline-none focus:border-accent/50 transition-colors uppercase"
                          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                        />
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20"></div>
                      </div>
                    </div>
                    <div className="space-y-3 group">
                      <label className="text-[8px] font-heading text-muted/40 uppercase tracking-[0.4em] pl-1 group-focus-within:text-accent transition-colors">MARKET ODDS</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          step="0.01"
                          value={odds}
                          onChange={(e) => setOdds(e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading text-white outline-none focus:border-accent/50 transition-colors"
                          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                        />
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20"></div>
                      </div>
                    </div>
                    <div className="space-y-3 group">
                      <label className="text-[8px] font-heading text-muted/40 uppercase tracking-[0.4em] pl-1 group-focus-within:text-accent transition-colors">TOTAL TRADES</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={totalEvents}
                          onChange={(e) => setTotalEvents(e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading text-white outline-none focus:border-accent/50 transition-colors"
                          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                        />
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20"></div>
                      </div>
                    </div>
                    <div className="space-y-3 group">
                      <label className="text-[8px] font-heading text-muted/40 uppercase tracking-[0.4em] pl-1 group-focus-within:text-accent transition-colors">TARGET WINS</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={expectedWins}
                          onChange={(e) => setExpectedWins(e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/10 p-4 text-[11px] font-heading text-white outline-none focus:border-accent/50 transition-colors"
                          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                        />
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/20"></div>
                      </div>
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={startDemoSession}
                    className="py-5 bg-white text-black font-heading font-black text-[10px] tracking-[0.4em] uppercase hover:bg-accent transition-all flex items-center justify-center gap-3 active:scale-95"
                    style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                  >
                    START DEMO SESSION <ChevronRight size={14} />
                  </button>
                  <button 
                    onClick={() => setShowRegPrompt(true)}
                    className="py-5 border border-white/10 text-white font-heading font-black text-[10px] tracking-[0.4em] uppercase hover:bg-white/5 transition-all flex items-center justify-center gap-3"
                    style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                  >
                    START REAL SESSION <Lock size={14} className="text-accent/40" />
                  </button>
               </div>
            </div>

            {/* Right Side: Projections */}
            <div className="lg:col-span-5 p-6 sm:p-12 space-y-8 bg-white/[0.01]">
                <div className="flex items-center gap-3 border-l-2 border-accent pl-4">
                  <span className="text-[10px] font-heading font-black text-white uppercase tracking-[0.4em] text-accent">PROJECTION ANALYSIS</span>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'ALLOWED LOSSES', val: (Number(totalEvents) - Number(expectedWins)), icon: <ShieldAlert size={14} />, color: 'text-error' },
                    { label: 'FIRST TRADE', val: `$${calculateBetAmount(Number(capital), Number(totalEvents), Number(expectedWins), Number(odds), previewV).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: <Zap size={14}/>, color: 'text-white' },
                    { label: 'TOTAL PROFIT', val: `+$${previewProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: <TrendingUp size={14}/>, color: 'text-emerald-500' },
                    { label: 'TOTAL ROI', val: `${previewROI.toFixed(2)}%`, icon: <Percent size={14}/>, color: 'text-accent' },
                    { label: 'BREAK EVEN %', val: `${((1 / Number(odds)) * 100).toFixed(2)}%`, icon: <Activity size={14} />, color: 'text-white' }
                  ].map((item, j) => (
                    <div key={j} className="flex items-center justify-between p-4 bg-black/40 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="text-muted/40">{item.icon}</div>
                        <span className="text-[9px] font-heading text-muted uppercase tracking-widest">{item.label}</span>
                      </div>
                      <span className={`text-[11px] font-heading font-black ${item.color}`}>{item.val}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-accent/5 border border-accent/10">
                   <p className="text-[8px] font-heading text-accent uppercase tracking-widest leading-relaxed">
                      THIS PREVIEW SHOWS MATHEMATICAL PROJECTIONS. LIVE EXECUTION REQUIRES ACCOUNT VERIFICATION.
                   </p>
                </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-12 xl:col-span-8">
              <div 
                className="bg-surface border border-accent/50 p-8 sm:p-10 space-y-8 relative overflow-hidden"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)' }}
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-6">
                   <div className="space-y-1">
                      <h3 className="text-xs font-heading font-black text-white uppercase tracking-widest">{localSession.name}</h3>
                      <p className="text-[8px] text-muted uppercase tracking-widest font-black text-accent">STEP_{localSession.trades.length.toString().padStart(2, '0')}</p>
                   </div>
                   <button onClick={resetSession} className="text-[10px] font-heading text-muted hover:text-white flex items-center gap-2">
                      <RotateCcw size={12} /> RESET
                   </button>
                </div>

                {localSession.status === 'ACTIVE' ? (
                  <div className="space-y-8">
                    <div className="text-center py-10 bg-black/60 border border-white/5 relative">
                      <div className="text-[10px] text-muted/60 uppercase tracking-[0.3em] mb-2 font-heading">ALLOCATED ENTRY SIZE</div>
                      <div className="text-5xl font-heading font-black text-white tracking-tighter">
                        ${localSession.trades[localSession.trades.length - 1].betAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => handleTradeResult('WIN')}
                        className="py-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all font-heading font-black tracking-[0.4em] text-[10px] flex items-center justify-center gap-2"
                        style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                      >
                        <CheckCircle2 size={16} /> WIN
                      </button>
                      <button 
                        onClick={() => handleTradeResult('LOSE')}
                        className="py-5 bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-heading font-black tracking-[0.4em] text-[10px] flex items-center justify-center gap-2"
                        style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                      >
                        <XCircle size={16} /> LOSS
                      </button>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-black/40 border border-white/5">
                      <span className="text-[9px] font-heading text-muted uppercase tracking-[0.3em]">NEXT_EST_PROFIT</span>
                      <span className="text-xl font-heading font-black text-accent">
                        +${(localSession.trades[localSession.trades.length - 1].betAmount * (localSession.odds - 1)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ) : (
                <div className="text-center py-6 space-y-6">
                   <div className={`p-4 inline-flex ${localSession.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'} border border-current`}>
                      {localSession.status === 'COMPLETED' ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                   </div>
                   <h3 className="text-2xl font-heading font-black text-white uppercase">{localSession.status === 'COMPLETED' ? 'TARGET_MET' : 'LIMIT_BREACH'}</h3>
                   <button onClick={resetSession} className="w-full py-4 bg-white text-black font-heading font-black text-[10px] tracking-[0.4em] uppercase">NEW_DEMO</button>
                </div>
              )}
            </div>
          </div>

          {/* History Module */}
          <div className="lg:col-span-8 bg-surface border border-white/5 flex flex-col h-full overflow-hidden">
             <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <Database size={16} className="text-accent" />
                   <span className="text-[10px] font-heading font-black tracking-widest text-white uppercase">TRADE RECORD</span>
                </div>
                <button onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} className="text-[9px] font-heading text-muted hover:text-white flex items-center gap-2">
                   {sortOrder === 'desc' ? <ArrowDownWideNarrow size={12} /> : <ArrowUpNarrowWide size={12} />}
                   {sortOrder.toUpperCase()}
                </button>
             </div>
             <div className="flex-1 overflow-y-auto max-h-[500px] divide-y divide-white/5 custom-scrollbar">
                {sortedTrades.map((trade, idx) => (
                  <div key={idx} className="p-5 space-y-3 hover:bg-white/[0.01] transition-colors">
                     <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-muted">#{trade.tradeNo.toString().padStart(2, '0')}</span>
                        {trade.outcome && (
                          <span className={`text-[9px] font-heading font-bold px-2 py-0.5 border ${trade.outcome === 'WIN' ? 'border-emerald-500/40 text-emerald-500' : 'border-rose-500/40 text-rose-500'}`}>
                            {trade.outcome}
                          </span>
                        )}
                     </div>
                     <div className="grid grid-cols-3 gap-4">
                        <div>
                           <p className="text-[7px] text-muted uppercase tracking-[0.2em]">ENTRY</p>
                           <p className="text-[10px] font-heading font-black text-white">${trade.betAmount.toLocaleString()}</p>
                        </div>
                        <div>
                           <p className="text-[7px] text-muted uppercase tracking-[0.2em]">RESULT</p>
                           <p className={`text-[10px] font-heading font-black ${trade.outcome === 'WIN' ? 'text-emerald-500' : trade.outcome === 'LOSE' ? 'text-rose-500' : 'text-white'}`}>
                             {trade.outcome === 'WIN' ? `+$${trade.returnAmount.toLocaleString()}` : trade.outcome === 'LOSE' ? `-$${trade.betAmount.toLocaleString()}` : '-'}
                           </p>
                        </div>
                        <div>
                           <p className="text-[7px] text-muted uppercase tracking-[0.2em]">BALANCE</p>
                           <p className="text-[10px] font-heading font-black text-accent">${trade.currentCapital.toLocaleString()}</p>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* MODAL / REG PROMPT */}
      {showRegPrompt && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-[10px]" onClick={() => setShowRegPrompt(false)}></div>
          <div 
            className="relative w-full max-w-md bg-surface border border-accent/40 p-10 sm:p-14 text-center space-y-10 animate-in zoom-in duration-300"
            style={{ clipPath: 'polygon(0 30px, 30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%)' }}
          >
            <div className="flex flex-col items-center space-y-6">
              <div className="w-20 h-20 bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                 <Lock size={40} />
              </div>
              <div className="space-y-3">
                 <h3 className="font-heading text-2xl font-black uppercase tracking-tighter text-white">LIMIT REACHED</h3>
                 <p className="text-[10px] font-heading text-muted uppercase tracking-[0.3em] leading-relaxed">
                   YOU HAVE REACHED THE MAXIMUM STEPS FOR THE DEMO EXERCISE. TO UNLOCK PERSISTENT SESSION MANAGEMENT AND UNLIMITED CALCULATIONS, PLEASE REGISTER.
                 </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
               <button 
                 onClick={() => window.location.hash = '#/register'}
                 className="w-full py-5 bg-accent text-black font-heading text-[10px] font-black tracking-[0.5em] uppercase hover:shadow-glow transition-all active:scale-95 flex items-center justify-center gap-3"
                 style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
               >
                 START TRADING NOW <ChevronRight size={14} />
               </button>
               <button 
                 onClick={() => setShowRegPrompt(false)}
                 className="w-full py-4 text-[9px] font-heading text-muted uppercase tracking-widest hover:text-white transition-colors"
               >
                 CLOSE PREVIEW
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoneyManagementDemo;
