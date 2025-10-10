import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, ChevronUp, ChevronLeft, Plus, Eye, Edit, Trash2, Grid3X3, List } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchExpenses, removeExpense } from "../../redux/submitter/submitterSlice";
import Input from "../../components/Forms/Input";
import SelectDropdown from "../../components/Forms/SelectionDropDown";
import type { Option } from "../../types";
import { listOffices } from "../../api/adminApi";
import { listVendors } from "../../api/vendorApi";
import ConfirmDialog from '../../components/ConfirmDialog';
import Modal from '../../components/Modal';

const MyExpenses: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  const [officeOptions, setOfficeOptions] = useState<Option[]>([]);
  const [vendorOptions, setVendorOptions] = useState<Option[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [filters, setFilters] = useState({
    office: "",
    vendor: "",
    status: "all",
    category: "all",
    dateFrom: "",
    dateTo: "",
  });

  const { expenses = [], totalPages = 1, totalCount = 0 } = useAppSelector((s) => s.submitter);
  console.log('Expenses from store:', expenses);

  // Create mappings for IDs to names
  const officeMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    officeOptions.forEach(office => {
      map[office.value] = office.label;
    });
    return map;
  }, [officeOptions]);

  const vendorMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    vendorOptions.forEach(vendor => {
      map[vendor.value] = vendor.label;
    });
    return map;
  }, [vendorOptions]);

  // Function to get office name from ID
  const getOfficeName = (officeId: string) => {
    return officeMap[officeId] || officeId || 'N/A';
  };

  // Function to get vendor name from ID
  const getVendorName = (vendorId: string) => {
    return vendorMap[vendorId] || vendorId || 'N/A';
  };

  // fetch from API
  useEffect(() => {
    const params: Record<string, any> = {
      q: searchTerm || undefined,
      office: filters.office || undefined,
      vendor: filters.vendor || undefined,
      status: filters.status !== "all" ? filters.status : undefined,
      category: filters.category !== "all" ? filters.category : undefined,
      startDate: filters.dateFrom || undefined,
      endDate: filters.dateTo || undefined,
      page,
      limit,
    };
    dispatch(fetchExpenses(params as any));
  }, [dispatch, searchTerm, filters, page, limit]);

   useEffect(() => {
    // fetch full office list
    listOffices()
      .then((list: any[]) => {
        const options = (list || []).map((o: any) => ({ value: String(o._id || o.name), label: String(o.name) }));
        setOfficeOptions(options);
      })
      .catch(() => setOfficeOptions([]));

    // fetch full vendor list (first page, large limit)
    listVendors({ page: 1, limit: 1000 } as any)
      .then((resp: any) => {
        const data = resp?.data || resp || [];
        const options = (data || []).map((v: any) => ({ value: String(v._id || v.vendorName), label: String(v.vendorName) }));
        setVendorOptions(options);
      })
      .catch(() => setVendorOptions([]));
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      office: "",
      vendor: "",
      status: "all",
      category: "all",
      dateFrom: "",
      dateTo: "",
    });
    setPage(1);
  };

  const handleViewExpense = (expense: any) => {
    setSelectedExpense(expense);
    setViewModalOpen(true);
  };

  const handleEditExpense = (expense: any) => {
    const firstSeg = location.pathname.split("/")[1] || "submitter";
    navigate(`/${firstSeg}/createexpense`, { state: { expense: expense } });
  };

  const handleDeleteExpense = (expense: any) => {
    setSelectedExpense(expense);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    // Delete logic here
    console.log('Deleting expense:', selectedExpense);
       if (selectedExpense?._id) {
          dispatch(removeExpense(selectedExpense._id));
        }
    setConfirmDeleteOpen(false);
    setSelectedExpense(null);
  };

  const cancelDelete = () => {
    setConfirmDeleteOpen(false);
    setSelectedExpense(null);
  };

  const formatDate = (d?: string | Date) => {
    try {
      return d ? new Date(d).toLocaleDateString() : "";
    } catch {
      return "";
    }
  };

  const getStatusColor = (status?: string) => {
    const STATUS_CLASSES: Record<string, string> = {
      New: "bg-blue-100 text-blue-800",
      WaitingForApproval: "bg-yellow-100 text-yellow-800",
      Approved: "bg-green-100 text-green-800",
      InReviewByFinance: "bg-purple-100 text-purple-800",
      InReviewbyFinance: "bg-purple-100 text-purple-800",
      Readyforpayment: "bg-indigo-100 text-indigo-800",
      Preparing: "bg-orange-100 text-orange-800",
      Paid: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
    };
    return `px-3 py-1 rounded-full text-xs font-medium ${
      status && STATUS_CLASSES[status] ? STATUS_CLASSES[status] : "bg-gray-100 text-gray-800"
    }`;
  };

  // Show pagination only when there are more than 10 items or multiple pages
  const showPagination = totalCount > limit || page > 1;

  return (
    <div className="min-h-screen bg-gray-50 py-2">
      {/* Header */}
      <div className="mb-3">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-gray-600">
          <ChevronLeft size={16} /> Back
        </button>
      </div>

      {/* Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Expenses</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 self-center sm:self-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'table' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Grid View"
            >
              <Grid3X3 size={16} />
            </button>
          </div>
          
          <button
            onClick={() => {
              const firstSeg = location.pathname.split("/")[1] || "submitter";
              navigate(`/${firstSeg}/createexpense`);
            }}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
          >
            <Plus size={18} />
            <span className="whitespace-nowrap">Add Expense</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="ml-1 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search expenses by title, vendor, or description..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div 
          className="flex justify-between items-center p-4 cursor-pointer select-none" 
          onClick={() => setShowFilters(!showFilters)}
        >
          <h2 className="font-semibold text-gray-700">Filters</h2>
          <div className="flex items-center text-sm text-blue-600 font-medium">
            {showFilters ? 'Hide Filters' : 'Show Filters'} 
            {showFilters ? <ChevronUp size={18} className="ml-1" /> : <ChevronDown size={18} className="ml-1" />}
          </div>
        </div>
        
        {showFilters && (
          <div className="p-4 border-t space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Office */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Office</label>
                <SelectDropdown
                  options={officeOptions}
                  value={filters.office ? officeOptions.find((o) => o.value === filters.office) || null : null}
                  onChange={(opt) => setFilters((prev) => ({ ...prev, office: opt?.value || "" }))}
                  isClearable
                  placeholder="Select Office"
                />
              </div>

              {/* Vendor */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Vendor</label>
                <SelectDropdown
                  options={vendorOptions}
                  value={filters.vendor ? vendorOptions.find((v) => v.value === filters.vendor) || null : null}
                  onChange={(opt) => setFilters((prev) => ({ ...prev, vendor: opt?.value || "" }))}
                  isClearable
                  placeholder="Select Vendor"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                <select 
                  value={filters.status} 
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))} 
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="WaitingForApproval">Waiting For Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="InReviewByFinance">In Review By Finance</option>
                  <option value="ReadyForPayment">Ready For Payment</option>
                  <option value="Paid">Paid</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                <select 
                  value={filters.category} 
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))} 
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="Travel">Travel</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Software">Software</option>
                  <option value="Services">Services</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date From</label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(v) => setFilters((prev) => ({ ...prev, dateFrom: v }))}
                  inputClassName="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date To</label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(v) => setFilters((prev) => ({ ...prev, dateTo: v }))}
                  inputClassName="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button 
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Expenses Display */}
      {expenses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl shadow-sm border">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms or filters' : 'Get started by adding your first expense'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                const firstSeg = location.pathname.split("/")[1] || "submitter";
                navigate(`/${firstSeg}/createexpense`);
              }}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={18} />
              Add Your First Expense
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View - Your existing card view */
        <div className="space-y-4">
          {expenses.map((exp) => (
            <div
              key={exp._id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300"
              onClick={() => handleViewExpense(exp)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800 truncate text-lg">{exp.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{exp.category}</span>
                      {exp.office && (
                        <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
                          {getOfficeName(exp.office)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Vendor:</span>
                      {getVendorName(exp.vendor)}
                    </span>
                    <span className="hidden sm:block">•</span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Due:</span>
                      {formatDate(exp.dueDate || exp.createdAt)}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-start sm:items-end gap-2 min-w-[120px]">
                  <span className="text-lg font-bold text-gray-900">Rs. {Number(exp.amount).toFixed(2)}</span>
                  <span className={getStatusColor(exp.status || "")}>
                    {(exp.status || "New").replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View - Vendor management style */
        <div className="bg-white rounded-xl shadow-sm border">
          {/* Mobile view */}
          <div className="block md:hidden">
            {expenses.map((exp) => (
              <div key={exp._id} className="p-4 border-b border-gray-200 last:border-b-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{exp.title}</h3>
                    <p className="text-sm text-gray-500">{exp.category}</p>
                    <p className="text-sm text-gray-500">{getVendorName(exp.vendor)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      Rs. {Number(exp.amount).toFixed(2)}
                    </span>
                    <span className={getStatusColor(exp.status || "")}>
                      {(exp.status || "New").replace(/([A-Z])/g, " $1").trim()}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <p>{getOfficeName(exp.office)}</p>
                    <p>Due: {formatDate(exp.dueDate)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewExpense(exp);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditExpense(exp);
                      }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteExpense(exp);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expense Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Office
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{exp.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{exp.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exp.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getVendorName(exp.vendor)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getOfficeName(exp.office)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      Rs. {Number(exp.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusColor(exp.status || "")}>
                        {(exp.status || "New").replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(exp.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewExpense(exp)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditExpense(exp)}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(exp)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {showPagination && expenses.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-700 text-center sm:text-left">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalCount)} of {totalCount} expenses
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                    page === pageNum
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* View Expense Modal */}
      <Modal
        open={viewModalOpen}
        title="Expense Details"
        onClose={() => {
          setViewModalOpen(false);
          setSelectedExpense(null);
        }}
        widthClassName="max-w-2xl"
        footer={
          <button
            onClick={() => {
              setViewModalOpen(false);
              setSelectedExpense(null);
            }}
            className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
          >
            Close
          </button>
        }
      >
        {selectedExpense && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Title</label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedExpense.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Description</label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedExpense.description}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Category</label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedExpense.category}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Vendor</label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">
                  {getVendorName(selectedExpense.vendor)}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600">Office</label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">
                  {getOfficeName(selectedExpense.office)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Amount</label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded font-bold">
                  Rs. {Number(selectedExpense.amount).toFixed(2)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Status</label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">
                  <span className={getStatusColor(selectedExpense.status || "")}>
                    {(selectedExpense.status || "New").replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Due Date</label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{formatDate(selectedExpense.dueDate)}</p>
              </div>
            </div>
            
            <div className="md:col-span-2 grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-600">Created At</label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{formatDate(selectedExpense.createdAt)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Updated At</label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{formatDate(selectedExpense.updatedAt)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete Expense"
        message={`Are you sure you want to delete "${selectedExpense?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default MyExpenses;