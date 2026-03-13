import React from 'react';
import { useUIStore } from '../store/uiStore';
import { X, CheckCircle, AlertTriangle, Info, ShieldAlert, Binary } from 'lucide-react';

const HUDNotification: React.FC = () => {
  const { notifications, removeNotification } = useUIStore();

  return (
    <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-[9999] flex flex-col gap-3 sm:gap-4 w-[calc(100%-32px)] sm:w-80 pointer-events-none">
      {notifications.map((n) => (
        <div 
          key={n.id}
          className={`pointer-events-auto relative group bg-black/90 backdrop-blur-xl border p-px animate-in slide-in-from-right-12 duration-500
            ${n.type === 'SUCCESS' ? 'border-accent/40' : 
              n.type === 'ERROR' ? 'border-error/40' : 'border-white/10'}
          `}
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 90% 100%, 0 100%)' }}
        >
          <div className="bg-surface/60 p-4 sm:p-5 flex gap-3 sm:gap-4 items-start">
            <div className={`mt-0.5 sm:mt-1 shrink-0 ${n.type === 'SUCCESS' ? 'text-accent' : n.type === 'ERROR' ? 'text-error' : 'text-white'}`}>
              {n.type === 'SUCCESS' && <CheckCircle size={16} />}
              {n.type === 'ERROR' && <ShieldAlert size={16} />}
              {n.type === 'INFO' && <Binary size={16} />}
              {n.type === 'WARNING' && <AlertTriangle size={16} />}
            </div>
            <div className="flex-1 space-y-0.5">
              <h4 className="font-heading text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-white truncate">
                {n.title}
              </h4>
              <p className="text-[8px] sm:text-[9px] text-muted uppercase tracking-widest leading-tight sm:leading-relaxed">
                {n.message}
              </p>
            </div>
            <button onClick={() => removeNotification(n.id)} className="text-muted/40 hover:text-white transition-colors shrink-0">
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HUDNotification;