import React from 'react';
import MonthFilter from '../Pettycash/monthFilter';
import EnhancedInput from '../../components/Forms/EnhancedInput';

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
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search Input */}
        <div className="flex-1 min-w-0 w-full sm:max-w-md">
          <EnhancedInput
            label=''
            type="text"
            value={searchTerm}
            onChange={onSearch}
            placeholder={`Search ${activeTab === 'vendor' ? 'vendor expenses' : 'petty cash records'}...`}
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