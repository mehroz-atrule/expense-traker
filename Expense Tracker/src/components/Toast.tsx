import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  timeoutMs?: number;
}

interface ToastContextValue {
  showToast: (opts: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((opts: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = { timeoutMs: 3500, ...opts, id };
    setToasts(prev => [item, ...prev]);
    if (item.timeoutMs && item.timeoutMs > 0) {
      setTimeout(() => remove(id), item.timeoutMs);
    }
  }, [remove]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[95%] sm:w-[500px]">
        {toasts.map(t => (
          <div key={t.id} className={`rounded-lg shadow-lg border p-3 text-sm flex items-start gap-3 ${
            t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            t.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            t.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="font-semibold">{t.title || (t.type === 'success' ? 'Success' : t.type === 'error' ? 'Error' : t.type === 'warning' ? 'Warning' : 'Info')}</div>
            <div className="flex-1">{t.message}</div>
            <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const formatApiError = (err: any): string => {
  try {
    const resp = err?.response;
    const data = resp?.data ?? err?.data ?? err;

    const pickString = (v: any): string | undefined => (typeof v === 'string' && v.trim() ? v : undefined);
    const joinArray = (v: any): string | undefined => (Array.isArray(v) ? v.filter(Boolean).join(', ') : undefined);

    const fromNestedArray = joinArray(data?.error?.message) || joinArray(data?.message) || joinArray(data?.errors);
    if (fromNestedArray) return fromNestedArray;

    const fromNestedString = pickString(data?.error?.message) || pickString(data?.message) || pickString(data?.error);
    if (fromNestedString) return fromNestedString;

    if (data && typeof data === 'object') {
      const values = Object.values(data).filter(v => typeof v === 'string');
      if (values.length) return values.join(', ');
    }

    return pickString(resp?.statusText) || pickString(err?.message) || 'Something went wrong.';
  } catch {
    return 'Something went wrong.';
  }
};


