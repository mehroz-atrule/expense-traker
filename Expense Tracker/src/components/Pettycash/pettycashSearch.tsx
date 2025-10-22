// components/Pettycash/pettycashSearch.tsx
import React from 'react';
import MonthFilter from './monthFilter'; // ✅ Correct import

interface PettyCashSearchProps {
  searchTerm: string;
  onSearch: (value: string) => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  totalRecords: number;
  loading: boolean;
}

const PettyCashSearch: React.FC<PettyCashSearchProps> = ({
  searchTerm,
  onSearch,
  selectedMonth,
  onMonthChange,
  totalRecords,
  loading
}) => {
  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            {/* Search Input */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by description, amount, or reference..."
                  value={searchTerm}
                  onChange={(e) => onSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <MonthFilter 
                selectedMonth={selectedMonth}
                onMonthChange={onMonthChange}
              />
              
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PettyCashSearch;