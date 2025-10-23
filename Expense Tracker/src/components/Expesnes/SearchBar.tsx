import React from 'react';
import { Search } from 'lucide-react';
import Input from '../../components/Forms/Input';
import MonthFilter from '../Pettycash/monthFilter';

interface SearchBarProps {
  searchTerm: string;
  onSearch: (value: string) => void;
  activeTab: string;
  selectedMonth?: string;
  onMonthChange?: (month: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearch,
  activeTab,
  selectedMonth,
  onMonthChange
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Search Input */}
        <div className="flex-1 relative min-w-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={`Search ${activeTab === 'vendor' ? 'vendor expenses' : 'petty cash records'}...`}
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* Month Filter - Only for Petty Cash */}
        {activeTab === 'pettycash' && onMonthChange && selectedMonth && (
          <div className="w-full sm:w-auto">
            <MonthFilter
              selectedMonth={selectedMonth}
              onMonthChange={onMonthChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
