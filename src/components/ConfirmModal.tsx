import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onCancel();
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onCancel]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto bg-white text-slate-900 border border-slate-200 rounded-2xl p-5 max-w-sm w-[90%] shadow-2xl backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm z-50 animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {confirmVariant === 'danger' && (
            <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          )}
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Zavrieť"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm text-slate-600 mb-5 leading-relaxed">{message}</p>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Zrušiť
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onCancel();
          }}
          className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors shadow-sm ${
            confirmVariant === 'danger'
              ? 'bg-red-600 hover:bg-red-500 text-white'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
};
