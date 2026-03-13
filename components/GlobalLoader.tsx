
import React, { useState, useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { Terminal } from 'lucide-react';
import CyberBackground from './CyberBackground';

const GlobalLoader: React.FC = () => {
  const { isGlobalLoading } = useUIStore();
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (isGlobalLoading) {
      const interval = setInterval(() => {
        setPercent(prev => (prev < 99 ? prev + Math.floor(Math.random() * 8) : 99));
      }, 150);
      return () => clearInterval(interval);
    } else {
      setPercent(0);
    }
  }, [isGlobalLoading]);

  if (!isGlobalLoading) return null;

  return (
    <div className="fixed inset-0 z-[20000] flex flex-col items-center justify-center overflow-hidden select-none font-mono">
      <CyberBackground />
      
      {/* 2. INTERFACE TEXT & PROGRESS */}
      <div className="relative flex flex-col items-center transform scale-[0.8] sm:scale-100 transition-all duration-700">
        <div className="w-80 space-y-6">
          <div className="relative p-4 border border-white/10 bg-white/5 overflow-hidden"
               style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }}>
            <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Terminal size={12} className="text-accent" />
                <span className="text-[10px] font-black tracking-widest text-white uppercase">System_Init</span>
              </div>
              <span className="text-[10px] font-black text-accent">{percent}%</span>
            </div>

            {/* SEGMENTED PROGRESS BAR */}
            <div className="flex gap-1 h-2">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i}
                  className={`flex-1 transition-all duration-300 ${
                    (i + 1) * 5 <= percent ? 'bg-accent' : 'bg-white/10'
                  }`}
                ></div>
              ))}
            </div>
            
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-white/5"></div>
              <p className="text-[7px] text-accent/50 uppercase tracking-[0.3em] whitespace-nowrap">
                Uplinking_Neural_Core_{percent.toString().padStart(3, '0')}
              </p>
              <div className="flex-1 h-[1px] bg-white/5"></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
      `}</style>
    </div>
  );
};

export default GlobalLoader;
