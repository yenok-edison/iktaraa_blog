import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-[#23A2B3] shrink-0" />,
  };

  const bgStyles = {
    success: 'bg-white border-emerald-200 shadow-emerald-500/10',
    error: 'bg-white border-rose-200 shadow-rose-500/10',
    info: 'bg-white border-[#23A2B3]/30 shadow-[#23A2B3]/10',
  };

  return (
    <div
      className={`pointer-events-auto p-4 rounded-2xl border shadow-lg flex items-start gap-3 transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 ${bgStyles[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <h5 className="text-xs font-bold text-[#231E59] font-heading">{toast.title}</h5>
        {toast.message && <p className="text-[11px] text-neutral-600 mt-0.5">{toast.message}</p>}
      </div>
      <button
        onClick={onDismiss}
        className="text-neutral-400 hover:text-neutral-700 p-0.5 transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
