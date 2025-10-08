import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, ChevronUp, ChevronLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchExpenses } from "../../redux/submitter/submitterSlice";
 

const MyExpenses: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState({ status: 'all', category: 'all', dateFrom: '', dateTo: '' });
  const [activeFilters, setActiveFilters] = useState({ status: 'all', category: 'all', dateFrom: '', dateTo: '' });

  const dispatch = useAppDispatch();
  const expenses = useAppSelector(s => s.submitter.expenses || []);

  useEffect(() => {
    dispatch(fetchExpenses({}));
  }, [dispatch]);

  const categoryOptions = ['all', ...Array.from(new Set(expenses?.map(e => e.category || 'other')))].filter(Boolean);
  const statusOptions = ['all', 'New', 'WaitingForApproval', 'Approved', 'InReviewByFinance', 'Paid', 'Rejected'];

  const formatDate = (d?: string | Date) => {
    try { return d ? new Date(d).toLocaleDateString() : new Date().toLocaleDateString(); }
    catch { return new Date().toLocaleDateString(); }
  };

  const getStatusColor = (status?: string) => {
    const STATUS_CLASSES: Record<string, string> = {
      New: 'px-2 py-1 rounded-full text-xs font-medium bg-new-500 text-white',
      WaitingForApproval: 'px-2 py-1 rounded-full text-xs font-medium bg-waiting-500 text-white',
      Approved: 'px-2 py-1 rounded-full text-xs font-medium bg-approved-500 text-white',
      InReviewByFinance: 'px-2 py-1 rounded-full text-xs font-medium bg-in-review-500 text-white',
      Preparing: 'px-2 py-1 rounded-full text-xs font-medium bg-preparing-500 text-white',
      Paid: 'px-2 py-1 rounded-full text-xs font-medium bg-paid-500 text-white',
      Rejected: 'px-2 py-1 rounded-full text-xs font-medium bg-danger-500 text-white',
    };

    return (status && STATUS_CLASSES[status]) || 'px-2 py-1 rounded-full text-xs font-medium bg-new-500 text-white';
  };

  const filtered = expenses.filter(e => {
    const vendor = (e.vendor || '').toLowerCase();
    const category = (e.category || '').toLowerCase();
    const matchesSearch = vendor.includes(searchTerm.toLowerCase()) || category.includes(searchTerm.toLowerCase());
    const matchesStatus = activeFilters.status === 'all' || e.status === activeFilters.status;
    const matchesCategory = activeFilters.category === 'all' || e.category === activeFilters.category;

    const ed = e.expenseDate || e.createdAt as string || '';
    const matchesDate = (!activeFilters.dateFrom || !ed || new Date(ed) >= new Date(activeFilters.dateFrom)) && (!activeFilters.dateTo || !ed || new Date(ed) <= new Date(activeFilters.dateTo));

    return matchesSearch && matchesStatus && matchesCategory && matchesDate;
  });

  // clicking an item will navigate to create route with the expense in state

  return (
    <div className="min-h-screen bg-gray-50 py-2 ">
      <div className="mb-3">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-gray-600">
          <ChevronLeft size={16} /> Back
        </button>
      </div>
      {/* <div className="flex items-center mb-6">
        <h1 className="flex-1 text-center text-xl font-bold text-gray-800">My Expenses</h1>
      </div> */}

      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="ml-1 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="flex justify-between items-center p-4 cursor-pointer select-none" onClick={() => setShowFilters(s => !s)}>
          <h2 className="font-semibold text-gray-700">Filters</h2>
          <div className="flex items-center text-sm text-blue-600 font-medium">
            {showFilters ? 'Hide Filters' : 'Show Filters'} {showFilters ? <ChevronUp size={18} className="ml-1" /> : <ChevronDown size={18} className="ml-1" />}
          </div>
        </div>
        {showFilters && (
          <div className="p-4 border-t space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                <select value={tempFilters.status} onChange={(e) => setTempFilters(p => ({ ...p, status: e.target.value }))} className="w-full border border-gray-300 rounded-lg p-2 text-sm">
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                <select value={tempFilters.category} onChange={(e) => setTempFilters(p => ({ ...p, category: e.target.value }))} className="w-full border border-gray-300 rounded-lg p-2 text-sm">
                  {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-600">Date Range</label>
                <div className="flex gap-2">
                  <input type="date" value={tempFilters.dateFrom} onChange={(e) => setTempFilters(p => ({ ...p, dateFrom: e.target.value }))} className="flex-1 border border-gray-300 rounded-lg p-2 text-sm" />
                  <input type="date" value={tempFilters.dateTo} onChange={(e) => setTempFilters(p => ({ ...p, dateTo: e.target.value }))} className="flex-1 border border-gray-300 rounded-lg p-2 text-sm" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setTempFilters({ status: 'all', category: 'all', dateFrom: '', dateTo: '' }); setActiveFilters({ status: 'all', category: 'all', dateFrom: '', dateTo: '' }); }} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm">Reset Filters</button>
              <button onClick={() => setActiveFilters(tempFilters)} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm">Apply Filters</button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-gray-500 font-medium">No expenses found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          filtered.map(exp => (
            <div key={exp.id} className="bg-white rounded-xl py-2 px-4 shadow-sm border border-gray-200 cursor-pointer  transition-all duration-200 " onClick={() => {
              const firstSeg = (location.pathname.split('/')[1] || 'submitter');
              const base = firstSeg || 'submitter';
              navigate(`/${base}/createexpense`, { state: { expense: exp } });
            }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-800 truncate">{exp.vendor}</p>
                      <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{exp.category}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{formatDate(exp.expenseDate || exp.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span>Rs. {exp.amount.toFixed(2)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exp.status || '')}`}>{(exp.status || '').replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyExpenses;
