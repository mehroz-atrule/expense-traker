import React from 'react';

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  widthClassName?: string;
}

const Modal: React.FC<ModalProps> = ({ open, title, onClose, children, footer, widthClassName = 'max-w-lg' }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative z-10 w-full ${widthClassName} max-h-[90vh] rounded-lg bg-white shadow-xl flex flex-col`}>
        {title && (
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>
        {footer && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex justify-end gap-3">
              {footer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;


