import React from 'react';
import { File } from 'lucide-react';

interface QuickCreateButtonProps {
  label?: string;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

const QuickCreateButton: React.FC<QuickCreateButtonProps> = ({
  label = 'Expense',
  onClick,
  className = '',
  icon,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex flex-col items-center text-center font-medium text-xs p-3 ${className}`}
    >
      <div className="flex justify-center py-4 rounded-2xl bg-gray-100 mb-2 w-full">
        {icon ?? <File className="mx-auto" />}
      </div>
      <span className="truncate">{label}</span>
    </button>
  );
};

export default QuickCreateButton;
