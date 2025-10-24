import React from 'react';
import { ChevronLeft, Plus, List } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface CombinedHeaderProps {
  activeTab: string;
  tabs: Tab[];
  viewMode?: 'table' | 'grid';
  onTabChange: (tabId: string) => void;
  onViewModeChange?: (mode: 'table' | 'grid') => void;
  onCreateNew: () => void;
  onNavigateBack: () => void;
  onAddIncome?: () => void;
  onAddExpense?: () => void;
}

const CombinedHeader: React.FC<CombinedHeaderProps> = ({
  activeTab,
  tabs,
  onTabChange,
  onCreateNew,
  onNavigateBack,
  onAddIncome,
  onAddExpense
}) => {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Main Header Row */}
        <div className="flex items-center justify-between py-3 sm:py-4">
          {/* Left Section - Back button and Title */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
            <button
              onClick={onNavigateBack}
              className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <List className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  My Expenses
                </h1>
                <p className="text-sm text-gray-500 truncate hidden sm:block">
                  Manage all your expenses in one place
                </p>
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* View Mode Toggle - Only show for vendor tab */}
            {/* {activeTab === 'vendor' && (
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => onViewModeChange('table')}
                  className={`p-1.5 sm:p-2 rounded transition-colors ${viewMode === 'table'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                  title="Table View"
                >
                  <List className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => onViewModeChange('grid')}
                  className={`p-1.5 sm:p-2 rounded transition-colors ${viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            )} */}

            {/* Buttons for Petty Cash */}
            {activeTab === 'pettycash' ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onAddIncome}
                  className="inline-flex items-center space-x-1 sm:space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden xs:inline">Add Income</span>
                </button>
                <button
                  onClick={onAddExpense}
                  className="inline-flex items-center space-x-1 sm:space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-sm text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden xs:inline">Add Expense</span>
                </button>
              </div>
            ) : (
              /* Single button for Vendor tab */
              <button
                onClick={onCreateNew}
                className="inline-flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">
                  Add {activeTab === 'vendor' ? 'Expense' : 'Petty Cash'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="border-t border-gray-200">
          <div className="flex space-x-6 sm:space-x-8 overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-shrink-0 py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
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