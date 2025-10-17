import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import DashboardCard from '../../components/Dashboard/DashboardCard';

const PettyCash: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const baseSeg = location.pathname.split('/')[1] || 'submitter';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-12 xs:h-14 sm:h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <Plus className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">PettyCash</h1>
                <p className="text-sm text-gray-500">Manage petty cash records and expenses</p>
              </div>
            </div>
            <div>
              <button
                onClick={() => navigate(`/${baseSeg}/create-pettycash-expense`)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} />
                Create Pettycash Expense
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6">
          <div className="grid grid-cols-1 gap-4">
            <DashboardCard
              color="from-blue-400 to-blue-600"
              title="Overview"
              amount={0}
              icon={<Plus />}
            />
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <p className="text-sm text-gray-600">List of petty cash records and recent transactions will appear here.</p>
            </div>
          </div>
      </div>
    </div>
  );
};

export default PettyCash;
