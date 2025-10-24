import React, { useEffect, useState } from 'react';
import { ChevronLeft, Search, Plus, Eye, Edit, Trash2, ChevronUp, ChevronDown, Grid3X3, List, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import type { RootState } from '../../app/store';
import {
  fetchVendors,
  createVendor,
  removeVendor,
  updateVendor,
  setFilters,
  clearFilters,
  setPagination,
  clearError
} from '../../redux/vendor/vendorSlice';
import type { Vendor, CreateVendorPayload, VendorPagination } from '../../types/vendor';
import { isValidVendor } from '../../utils/vendorValidation';
import ConfirmDialog from '../../components/ConfirmDialog';
import Modal from '../../components/Modal';

import VendorCard from '../../components/Vendor/VendorCard';
import VendorForm from '../../components/Vendor/VendorForm';
import VendorSkeleton from '../../components/Vendor/VendorSkeleton';
import Pagination from '../../components/Pagination';

const VendorManagement: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { vendors, loading, error, pagination, filters } = useAppSelector((state: RootState) => state.vendor);

  // Local state for UI
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateVendorPayload>({
    vendorName: '',
    location: '',
    customerId: '',
    preferredBankName: '',
    vendorAccountTitle: '',
    vendorIban: '',
  });

  // Temporary filters for the filter form
  const [tempFilters, setTempFilters] = useState(filters);

  useEffect(() => {
    const params: VendorPagination = {
      page: pagination.page,
      limit: pagination.limit
    };

    // Add search query if exists
    if (filters.search) {
      params.q = filters.search;
    }

    dispatch(fetchVendors(params));
  }, [dispatch, pagination.page, pagination.limit, filters]);

  useEffect(() => {
    if (error) {
      // Auto-clear error after 5 seconds
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleSearch = (value: string) => {
    dispatch(setFilters({ search: value }));
    dispatch(setPagination({ page: 1 })); // Reset to first page when searching
    // Trigger fetch with new search term
    dispatch(fetchVendors({
      page: 1,
      limit: pagination.limit,
      q: value,
      ...filters
    }));
  };

  const handleApplyFilters = () => {
    dispatch(setFilters(tempFilters));
    dispatch(setPagination({ page: 1 }));
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    const resetFilters = { search: '', location: '', bankName: '' };
    setTempFilters(resetFilters);
    dispatch(clearFilters());
    dispatch(setPagination({ page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPagination({ page: newPage }));
  };

  const resetForm = () => {
    setFormData({
      vendorName: '',
      location: '',
      customerId: '',
      preferredBankName: '',
      vendorAccountTitle: '',
      vendorIban: '',
    });
  };

  const handleAddVendor = () => {
    setAddModalOpen(true);
    resetForm();
    setShowValidation(false);
  };

  const handleViewVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setViewModalOpen(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setFormData({
      vendorName: vendor.vendorName,
      location: vendor.location,
      customerId: vendor.customerId,
      preferredBankName: vendor.preferredBankName,
      vendorAccountTitle: vendor.vendorAccountTitle,
      vendorIban: vendor.vendorIban,
    });
    setEditModalOpen(true);
    setShowValidation(false);
  };

  const handleDeleteVendor = (vendor: Vendor) => {
    setPendingDeleteId(vendor._id);
    setSelectedVendor(vendor);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (pendingDeleteId) {
      dispatch(removeVendor(pendingDeleteId));
    }
    setConfirmDeleteOpen(false);
    setPendingDeleteId(null);
    setSelectedVendor(null);
  };

  const cancelDelete = () => {
    setConfirmDeleteOpen(false);
    setPendingDeleteId(null);
    setSelectedVendor(null);
  };

  const handleSaveVendor = () => {
    // Ask child form to display validation
    setShowValidation(true);

    // If invalid, stop here (no API call)
    if (!isFormValid()) return;
    if (editModalOpen && selectedVendor) {
      dispatch(updateVendor({ id: selectedVendor._id, payload: (formData) }));
      setEditModalOpen(false);
    } else {
      dispatch(createVendor(formData));
      setAddModalOpen(false);
    }
    resetForm();
    setSelectedVendor(null);
    setShowValidation(false);
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  // Extract unique locations and bank names for filter options
  const uniqueLocations = Array.from(new Set(vendors.map(v => v.location).filter(Boolean)));
  const uniqueBankNames = Array.from(new Set(vendors.map(v => v.preferredBankName).filter(Boolean)));

  const isFormValid = () => {
    return isValidVendor(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile App-like Header - Enhanced Responsive */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-12 xs:h-14 sm:h-16">
            <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-4 flex-1 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-auto md:h-auto md:gap-2 md:px-3 md:py-2 text-gray-600 bg-gray-50 md:bg-white rounded-full md:rounded-lg border-0 md:border md:border-gray-200 hover:bg-gray-100 md:hover:bg-gray-50 transition-all duration-200 active:scale-95 touch-manipulation"
              >
                <ChevronLeft className="w-4 h-4 xs:w-5 xs:h-5 md:w-4 md:h-4" />
                {/* <span className="hidden md:inline text-sm">Back</span> */}
              </button>

              <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-blue-100 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm xs:text-base sm:text-lg font-semibold text-gray-900 truncate leading-tight">Vendor Management</h1>
                  <p className="text-xs sm:text-sm text-gray-500 truncate hidden sm:block leading-tight">Manage your vendors and suppliers</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-2">
              {/* View Mode Toggle - Responsive */}
              <div className="flex items-center bg-gray-100 rounded-md sm:rounded-lg p-0.5 sm:p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1 xs:p-1.5 sm:p-2 rounded-sm sm:rounded-md transition-colors touch-manipulation ${viewMode === 'table'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                  title="Table View"
                >
                  <List className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 xs:p-1.5 sm:p-2 rounded-sm sm:rounded-md transition-colors touch-manipulation ${viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              <button
                onClick={handleAddVendor}
                className="inline-flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-auto md:h-auto md:gap-2 md:px-4 md:py-2 bg-blue-600 text-white rounded-full md:rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm active:scale-95 touch-manipulation ml-1"
              >
                <Plus className="w-4 h-4 xs:w-5 xs:h-5 md:w-4 md:h-4" />
                <span className="hidden md:inline text-sm font-medium">Add Vendor</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 font-medium">Error loading vendors</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="ml-1 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search vendors by name, location, or customer ID..."
                value={filters.search}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
                    <select
                      value={tempFilters.location}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                    >
                      <option value="">All Locations</option>
                      {uniqueLocations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Bank Name</label>
                    <select
                      value={tempFilters.bankName}
                      onChange={(e) => setTempFilters(prev => ({ ...prev, bankName: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                    >
                      <option value="">All Banks</option>
                      {uniqueBankNames.map(bank => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Vendors Display */}
          {loading ? (
            <VendorSkeleton count={6} viewMode={viewMode} />
          ) : vendors.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl shadow-sm border">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
              <p className="text-gray-500 mb-4">
                {filters.search ? 'Try adjusting your search terms or filters' : 'Get started by adding your first vendor'}
              </p>
              {!filters.search && (
                <button
                  onClick={handleAddVendor}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus size={18} />
                  Add Your First Vendor
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <VendorCard
                  key={vendor._id}
                  vendor={vendor}
                  onView={() => handleViewVendor(vendor)}
                  onEdit={() => handleEditVendor(vendor)}
                  onDelete={() => handleDeleteVendor(vendor)}
                />
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-xl shadow-sm border">
              {/* Mobile view */}
              <div className="block md:hidden">
                {vendors.map((vendor) => (
                  <div key={vendor._id} className="p-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">{vendor.vendorName}</h3>
                        <p className="text-sm text-gray-500">{vendor.location}</p>
                        <p className="text-sm text-gray-500">ID: {vendor.customerId}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewVendor(vendor)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditVendor(vendor)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteVendor(vendor)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><span className="font-medium">Bank:</span> {vendor.preferredBankName}</p>
                      <p><span className="font-medium">Account:</span> {vendor.vendorAccountTitle}</p>
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
                        Vendor Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bank Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vendors.map((vendor) => (
                      <tr key={vendor._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{vendor.vendorName}</div>
                            <div className="text-sm text-gray-500">{vendor.vendorAccountTitle}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vendor.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {vendor.customerId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{vendor.preferredBankName}</div>
                            <div className="text-sm font-mono text-gray-500">{vendor.vendorIban}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(vendor.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleViewVendor(vendor)}
                              className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleEditVendor(vendor)}
                              className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteVendor(vendor)}
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
          {/* {pagination.totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-700 text-center sm:text-left">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} vendors
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = Math.max(1, pagination.page - 2) + i;
              if (page <= pagination.totalPages) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                      page === pagination.page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              }
              return null;
            })}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )} */}

          {<Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />}

          {/* Add/Edit Vendor Modal */}
          <Modal
            open={addModalOpen || editModalOpen}
            title={editModalOpen ? 'Edit Vendor' : 'Add New Vendor'}
            onClose={() => {
              setAddModalOpen(false);
              setEditModalOpen(false);
              resetForm();
              setSelectedVendor(null);
              setShowValidation(false);
            }}
            widthClassName="max-w-4xl"
            footer={
              <>
                <button
                  onClick={() => {
                    setAddModalOpen(false);
                    setEditModalOpen(false);
                    resetForm();
                    setSelectedVendor(null);
                    setShowValidation(false);
                  }}
                  className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveVendor}
                  disabled={loading}
                  className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed relative"
                >
                  {loading ? 'Saving...' : (editModalOpen ? 'Update' : 'Create')}
                </button>
              </>
            }
          >
            <VendorForm
              formData={formData}
              onChange={(data) => { setFormData(data); }}
              isLoading={loading}
              showValidation={showValidation}
            />
          </Modal>

          {/* View Vendor Modal */}
          <Modal
            open={viewModalOpen}
            title="Vendor Details"
            onClose={() => {
              setViewModalOpen(false);
              setSelectedVendor(null);
            }}
            widthClassName="max-w-2xl"
            footer={
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedVendor(null);
                }}
                className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
            }
          >
            {selectedVendor && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Vendor Name</label>
                    <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedVendor.vendorName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">Location</label>
                    <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedVendor.location}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">Customer ID</label>
                    <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded font-mono">{selectedVendor.customerId}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Preferred Bank Name</label>
                    <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedVendor.preferredBankName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">Account Title</label>
                    <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{selectedVendor.vendorAccountTitle}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">IBAN</label>
                    <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded font-mono">{selectedVendor.vendorIban}</p>
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Created At</label>
                    <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{formatDate(selectedVendor.createdAt)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600">Updated At</label>
                    <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{formatDate(selectedVendor.updatedAt)}</p>
                  </div>
                </div>
              </div>
            )}
          </Modal>

          {/* Confirm Delete Dialog */}
          <ConfirmDialog
            open={confirmDeleteOpen}
            title="Delete Vendor"
            message={`Are you sure you want to delete "${selectedVendor?.vendorName}"? This action cannot be undone.`}
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

export default VendorManagement;