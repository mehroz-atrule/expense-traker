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
import Pagination from "../../components/Pagination";
import ImageModal from "../../components/ImageViewModal";

const MyExpenses: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  // Image modal states
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentImageTitle, setCurrentImageTitle] = useState("");

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

  // Use the data from your API response
  const { expenses = [], total = 0 } = useAppSelector((s) => s.submitter);


  // Calculate total pages
  const totalPages = Math.ceil(total / limit);

  // Show pagination only when there are items and multiple pages
  const showPagination = total > limit;

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

  // Image click handler function
  const handleImageClick = (imageUrl: string | null, title: string) => {
    if (!imageUrl) return;
    
    setCurrentImage(imageUrl);
    setCurrentImageTitle(title);
    setImageModalOpen(true);
  };

  // Modal close handler
  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setCurrentImage(null);
    setCurrentImageTitle("");
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleViewExpense = (expense: any) => {
    setSelectedExpense(expense);
    setViewModalOpen(true);
  };

  const handleEditExpense = (expense: any) => {
    const firstSeg = location.pathname.split("/")[1] || "submitter";
    navigate(`/${firstSeg}/vendor/create-expense?id=${expense._id}`, { state: { expense: expense } });
  };

  const handleDeleteExpense = (expense: any) => {
    setSelectedExpense(expense);
    setConfirmDeleteOpen(true);
  };  

  const confirmDelete = () => {
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
      ReviewedByFinance: "bg-purple-100 text-purple-800",
      ReviewedByFinance: "bg-purple-100 text-purple-800",
      Readyforpayment: "bg-indigo-100 text-indigo-800",
      Preparing: "bg-orange-100 text-orange-800",
      Paid: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
    };
    return `px-3 py-1 rounded-full text-xs font-medium ${
      status && STATUS_CLASSES[status] ? STATUS_CLASSES[status] : "bg-gray-100 text-gray-800"
    }`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 ">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-12 xs:h-14 sm:h-16">
            <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-4 flex-1 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-auto md:h-auto md:gap-2 md:px-3 md:py-2 text-gray-600 bg-gray-50 md:bg-white rounded-full md:rounded-lg border-0 md:border md:border-gray-200 hover:bg-gray-100 md:hover:bg-gray-50 transition-all duration-200 active:scale-95 touch-manipulation"
              >
                <ChevronLeft className="w-4 h-4 xs:w-5 xs:h-5 md:w-4 md:h-4" />
                <span className="hidden md:inline text-sm">Back</span>
              </button>
              
              <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-blue-100 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                  <List className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm xs:text-base sm:text-lg font-semibold text-gray-900 truncate leading-tight">My Expenses</h1>
                  <p className="text-xs sm:text-sm text-gray-500 truncate hidden sm:block leading-tight">Track and manage your expenses</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-md sm:rounded-lg p-0.5 sm:p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1 xs:p-1.5 sm:p-2 rounded-sm sm:rounded-md transition-colors touch-manipulation ${
                    viewMode === 'table' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Table View"
                >
                  <List className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 xs:p-1.5 sm:p-2 rounded-sm sm:rounded-md transition-colors touch-manipulation ${
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
                onClick={() => {
                  const firstSeg = location.pathname.split("/")[1] || "submitter";
                  navigate(`/${firstSeg}/createexpense`);
                }}
                className="inline-flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-auto md:h-auto md:gap-2 md:px-4 md:py-2 bg-blue-600 text-white rounded-full md:rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm active:scale-95 touch-manipulation ml-1"
              >
                <Plus className="w-4 h-4 xs:w-5 xs:h-5 md:w-4 md:h-4" />
                <span className="hidden md:inline text-sm font-medium">Add Expense</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">

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
                      <option value="ReviewedByFinance">Reviewed By Finance</option>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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
            /* Grid View */
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
            /* Table View - UPDATED */
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

              {/* Desktop view - UPDATED */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expense Details
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
                            {/* Category moved here under title */}
                            <div className="text-xs text-gray-500 mt-1">
                              <span className="inline-block bg-gray-100 px-2 py-1 rounded-full">
                                {exp.category}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getVendorName(exp.vendor)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getOfficeName(exp.office)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          Rs. {Number(exp.amountAfterTax??exp.amount).toFixed(2)}
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

          {/* Pagination Component */}
          {showPagination && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}

          {/* View Expense Modal - UPDATED WITH IMAGES */}
          <Modal
            open={viewModalOpen}
            title="Expense Details"
            onClose={() => {
              setViewModalOpen(false);
              setSelectedExpense(null);
            }}
            widthClassName="max-w-4xl"
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
              <div className="space-y-6">
                {/* Images Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Documents & Receipts</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Expense Receipt */}
                    {selectedExpense.image && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-600">Expense Receipt</label>
                        <div
                          onClick={() => handleImageClick(selectedExpense.image, "Expense Receipt")}
                          className="relative w-full h-32 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                        >
                          <img
                            src={selectedExpense.image}
                            alt="Expense Receipt"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 rounded-full p-2">
                              <Eye className="w-4 h-4 text-gray-700" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cheque Image */}
                    {selectedExpense.chequeImage && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-600">Issued Cheque</label>
                        <div
                          onClick={() => handleImageClick(selectedExpense.chequeImage, "Issued Cheque")}
                          className="relative w-full h-32 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all duration-200"
                        >
                          <img
                            src={selectedExpense.chequeImage}
                            alt="Issued Cheque"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 rounded-full p-2">
                              <Eye className="w-4 h-4 text-gray-700" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Slip */}
                    {selectedExpense.paymentSlip && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-600">Payment Receipt</label>
                        <div
                          onClick={() => handleImageClick(selectedExpense.paymentSlip, "Payment Receipt")}
                          className="relative w-full h-32 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
                        >
                          <img
                            src={selectedExpense.paymentSlip}
                            alt="Payment Receipt"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 rounded-full p-2">
                              <Eye className="w-4 h-4 text-gray-700" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expense Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
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
                  
                  <div className="space-y-4">
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
                </div>
              </div>
            )}
          </Modal>

          {/* Image Modal */}
          <ImageModal
            isOpen={imageModalOpen}
            onClose={handleCloseImageModal}
            imageUrl={currentImage || ""}
            title={currentImageTitle}
          />

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
      </div>
    </div>
  );
};

export default MyExpenses;