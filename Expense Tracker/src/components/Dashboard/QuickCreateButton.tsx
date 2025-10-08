import React from 'react';
import { File, ArrowUpRight } from 'lucide-react';

interface QuickCreateButtonProps {
  label?: string;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

const QuickCreateButton: React.FC<QuickCreateButtonProps> = ({
  label = 'Expense',
  onClick,
  className = 'bg-gray-50 hover:bg-gray-100 text-gray-700',
  icon,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between p-3 md:p-4 rounded-lg transition-all duration-200 ${className}`}
    >
      <div className="flex items-center space-x-2 md:space-x-3">
        <div className="p-1.5 md:p-2 rounded-lg bg-white/80">
          {icon ?? <File className="w-4 h-4" />}
        </div>
        <span className="font-medium text-sm md:text-base truncate">{label}</span>
      </div>
      <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 opacity-60" />
    </button>
  );
};

export default QuickCreateButton;
