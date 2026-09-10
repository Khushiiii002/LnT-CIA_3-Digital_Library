import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const bgColors = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    error: 'bg-rose-50 text-rose-800 border-rose-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />,
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 border rounded-xl shadow-lg transition-all transform duration-300 max-w-md ${bgColors[type]}`}>
      {icons[type]}
      <span className="text-sm font-medium leading-relaxed">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto p-1 rounded-lg hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4 opacity-60" />
        </button>
      )}
    </div>
  );
};
