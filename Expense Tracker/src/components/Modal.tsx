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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative z-10 w-full ${widthClassName} rounded-lg bg-white p-4 shadow-xl`}>
        {title ? (
          <div className="mb-3">
            <h3 className="text-base font-semibold">{title}</h3>
          </div>
        ) : null}
        <div className="mb-3">
          {children}
        </div>
        {footer ? (
          <div className="flex justify-end gap-2">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Modal;


