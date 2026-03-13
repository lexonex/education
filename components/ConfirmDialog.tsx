
import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'WARNING',
  message = 'Are you sure you want to proceed with this action?',
  confirmLabel = 'CONFIRM',
  cancelLabel = 'CANCEL',
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const colorClass = type === 'danger' ? 'error' : type === 'warning' ? 'yellow-500' : 'accent';

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-[20px] transition-opacity" onClick={onClose}></div>
      <div 
        className={`relative w-full max-w-md bg-[#0A0A0A] border border-${colorClass}/40 p-8 sm:p-10 animate-in zoom-in duration-300`}
        style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
      >
        <div className="flex flex-col items-center text-center space-y-6">
          <div className={`p-4 bg-${colorClass}/10 border border-${colorClass}/20 text-${colorClass}`}>
            <AlertTriangle size={32} className="animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-heading text-lg font-black uppercase tracking-tighter text-white">{title}</h3>
            <p className="text-[9px] font-heading text-muted uppercase tracking-[0.2em] leading-relaxed opacity-60">{message}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full pt-4">
            <button 
              onClick={onClose} 
              className="py-4 border border-white/10 text-[9px] font-heading font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all"
              style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
            >
              {cancelLabel}
            </button>
            <button 
              onClick={onConfirm} 
              className={`py-4 bg-${colorClass} text-white text-[9px] font-heading font-black uppercase tracking-[0.2em] transition-all`}
              style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
        
        <button onClick={onClose} className="absolute top-4 right-4 text-muted/20 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDialog;
