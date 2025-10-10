import React, { useEffect, useState } from 'react';
import { ChevronLeft, Search, Plus, Eye, Edit, Trash2, ChevronUp, ChevronDown, Grid3X3, List } from 'lucide-react';
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
  const [userHasInteracted, setUserHasInteracted] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateVendorPayload>({
    vendorName: '',
    location: '',
    customerId: '',
    preferredBankName: '',
    vendorAccountTitle: '',
    vendorIban: '',
    WHT: 0,
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
      Tax: 0, 
    });
  };

  const handleAddVendor = () => {
    setAddModalOpen(true);
    resetForm();
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
      WHT: (vendor as any).WHT ?? (vendor as any).Tax ?? 0,
    });
    setEditModalOpen(true);
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
    setShowValidation(true);
    
    if (!isFormValid()) {
      return; // Don't save if form is invalid
    }
    console.log('Saving vendor with data:', formData);
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
    setUserHasInteracted(false);
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
    <div className="min-h-screen bg-gray-50 py-2">
      {/* Header */}
      <div className="mb-3">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
          <ChevronLeft size={16} /> Back
        </button>
      </div>

      {/* Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Vendor Management</h1>
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
            onClick={handleAddVendor}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
          >
            <Plus size={18} />
            <span className="whitespace-nowrap">Add Vendor</span>
          </button>
        </div>
      </div>

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
      {pagination.totalPages > 1 && (
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
      )}

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
          setUserHasInteracted(false);
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
                setUserHasInteracted(false);
              }}
              className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveVendor}
              disabled={!isFormValid() || loading}
              className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed relative"
              title={!isFormValid() ? 'Please fill all required fields correctly' : ''}
            >
              {loading ? 'Saving...' : (editModalOpen ? 'Update' : 'Create')}
              {!isFormValid() && !loading && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </button>
          </>
        }
      >
        <VendorForm
          formData={formData}
          onChange={(data) => {
            setFormData(data);
            if (!userHasInteracted) {
              setUserHasInteracted(true);
            }
          }}
          isLoading={loading}
          showValidation={showValidation || userHasInteracted}
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
  );
};

export default VendorManagement;