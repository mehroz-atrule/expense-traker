import React from 'react';
import EnhancedInput from '../../components/Forms/EnhancedInput';

interface PettyCashSearchProps {
  searchTerm: string;
  onSearch: (value: string) => void;
  totalRecords: number;
  loading: boolean;
}

const PettyCashSearch: React.FC<PettyCashSearchProps> = ({
  searchTerm,
  onSearch,
  totalRecords,
  loading
}) => {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4">
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <EnhancedInput
              label="Search Transactions"
              placeholder="Search by title, description, bank name..."
              value={searchTerm}
              onChange={onSearch}
            />
          </div>
          <div className="text-sm text-gray-500">
            {loading ? 'Searching...' : `${totalRecords} records found`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PettyCashSearch;