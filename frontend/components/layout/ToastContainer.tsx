'use client';

import { useToastStore } from '../../store/toast.store';
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {toasts.map((t) => {
        return (
          <div
            key={t.id}
            className="pointer-events-auto bg-surface border border-secondary/30 p-4 flex items-start gap-3 shadow-lg transition-all duration-300 transform translate-y-0"
            style={{ borderRadius: '2px' }}
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-tertiary shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-secondary shrink-0 mt-0.5" />}

            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                {t.type === 'success' ? 'SYSTEM CONFIRMED' : t.type === 'error' ? 'SYSTEM ERROR' : 'NOTIFICATION'}
              </p>
              <p className="text-xs text-primary mt-1 leading-normal font-sans">{t.message}</p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-secondary hover:text-primary transition-colors mt-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
