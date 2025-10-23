import React from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-lg bg-white p-4 shadow-xl">
        <div className="mb-3">
          <h3 className="text-base font-semibold">{title}</h3>
        </div>
        <div className="mb-4 text-sm text-gray-600">
          {message}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-2 text-sm rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50">{cancelText}</button>
          <button onClick={onConfirm} className="px-3 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700">{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;


