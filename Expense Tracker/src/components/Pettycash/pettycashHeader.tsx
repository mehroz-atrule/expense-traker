import React from 'react';
import { Download, Printer } from 'lucide-react';

interface PettyCashHeaderProps {
  onCreateNew: () => void;
}

const PettyCashHeader: React.FC<PettyCashHeaderProps> = ({ onCreateNew }) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between h-auto sm:h-16 gap-3 sm:gap-0 py-3">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-semibold text-gray-900 max-sm:text-sm">Pettycash Expense</h1>
            <p className="text-sm text-gray-500 max-sm:hidden">Manage pettycash transactions</p>
          </div>
          <div className="flex gap-2">
            {/* <button className="flex items-center gap-2 px-3 py-2 max-sm:px-2 max-sm:text-sm max-sm:py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download size={16} />
              Export
            </button>
            <button className="flex items-center gap-2 px-3 py-2 max-sm:px-2 max-sm:text-sm max-sm:py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Printer size={16} />
              Print
            </button> */}
            <button
              onClick={onCreateNew}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 max-sm:px-2 max-sm:py-1 max-sm:text-sm rounded-lg hover:bg-blue-700"
            >
              Add Pettycash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PettyCashHeader;