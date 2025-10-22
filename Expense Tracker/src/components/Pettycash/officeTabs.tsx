import React from 'react';
import type { Office } from '../../types/admin';

interface OfficeTabsProps {
  offices: Office[];
  selectedOffice: string;
  onOfficeChange: (officeId: string) => void;
  loading: boolean;
}

const OfficeTabs: React.FC<OfficeTabsProps> = ({
  offices,
  selectedOffice,
  onOfficeChange,
  loading
}) => {
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="animate-pulse flex space-x-4">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4">
      <div className="bg-white rounded-lg border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {offices.map((office) => (
              <button
                key={office._id}
                onClick={() => onOfficeChange(office._id!)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${selectedOffice === office._id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {office.name}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default OfficeTabs;