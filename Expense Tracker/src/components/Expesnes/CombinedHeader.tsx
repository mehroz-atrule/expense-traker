import React from 'react';
import { ChevronLeft, Plus, List, Grid3X3 } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  count?: number;
}
type ExpenseTab = 'vendor' | 'pettycash';
interface CombinedHeaderProps {
  activeTab: ExpenseTab | string;

  tabs: Tab[];
  viewMode: 'table' | 'grid';
  onTabChange: (tabId: ExpenseTab | string) => void;

  onViewModeChange: (mode: 'table' | 'grid') => void;
  onCreateNew: () => void;
  onNavigateBack: () => void;
}

const CombinedHeader: React.FC<CombinedHeaderProps> = ({
  activeTab,
  tabs,
  viewMode,
  onTabChange,
  onViewModeChange,
  onCreateNew,
  onNavigateBack
}) => {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-12 xs:h-14 sm:h-16">
          <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-4 flex-1 min-w-0">
            <button
              onClick={onNavigateBack}
              className="inline-flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-auto md:h-auto md:gap-2 md:px-3 md:py-2 text-gray-600 bg-gray-50 md:bg-white rounded-full md:rounded-lg border-0 md:border md:border-gray-200 hover:bg-gray-100 md:hover:bg-gray-50 transition-all duration-200 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 xs:w-5 xs:h-5 md:w-4 md:h-4" />
              <span className="hidden md:inline text-sm">Back</span>
            </button>
            
            <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-3 flex-1 min-w-0">
              <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-blue-100 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                <List className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm xs:text-base sm:text-lg font-semibold text-gray-900 truncate leading-tight">
                  My Expenses
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 truncate hidden sm:block leading-tight">
                  Manage all your expenses in one place
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-md sm:rounded-lg p-0.5 sm:p-1">
              <button
                onClick={() => onViewModeChange('table')}
                className={`p-1 xs:p-1.5 sm:p-2 rounded-sm sm:rounded-md transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Table View"
              >
                <List className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-1 xs:p-1.5 sm:p-2 rounded-sm sm:rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Grid View"
              >
                <Grid3X3 className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <button
              onClick={onCreateNew}
              className="inline-flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-auto md:h-auto md:gap-2 md:px-4 md:py-2 bg-blue-600 text-white rounded-full md:rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4 xs:w-5 xs:h-5 md:w-4 md:h-4" />
              <span className="hidden md:inline text-sm font-medium">
                Add {activeTab === 'vendor' ? 'Expense' : 'Petty Cash'}
              </span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombinedHeader;