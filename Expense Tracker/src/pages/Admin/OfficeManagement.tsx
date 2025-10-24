import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  Building2,
  Edit3,
  Search
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import type { RootState } from '../../app/store';
import { fetchOffices, addOffice, removeOffice, updateOffice } from '../../redux/admin/adminSlice';
import ConfirmDialog from '../../components/ConfirmDialog';
import Modal from '../../components/Modal';
import { useToast, formatApiError } from '../../components/Toast';

const OfficeManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { offices, loading } = useAppSelector((s: RootState) => s.admin);

  // Form states
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | undefined>(undefined);

  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit/Delete states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => { dispatch(fetchOffices()); }, [dispatch]);

  // Filter offices based on search term
  const filteredOffices = offices?.filter(office =>
    office.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleAdd = () => {
    if (!name.trim()) { setNameError('Office name is required'); return; }
    dispatch(addOffice({ name }))
      .unwrap()
      .then(() => {
        showToast({ type: 'success', message: 'Office added successfully' });
        setName('');
        setNameError(undefined);
        setShowAddModal(false);
      })
      .catch((e: any) => showToast({ type: 'error', message: formatApiError(e) }));
  };

  // const requestDelete = (id: string) => {
  //   setPendingDeleteId(id);
  //   setConfirmOpen(true);
  // };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  const confirmDelete = () => {
    if (pendingDeleteId) {
      dispatch(removeOffice(pendingDeleteId))
        .unwrap()
        .then(() => showToast({ type: 'success', message: 'Office deleted successfully' }))
        .catch((e: Error) => showToast({ type: 'error', message: formatApiError(e) }));
    }
    cancelDelete();
  };

  const openEdit = (_id: string, currentName: string) => {
    setEditId(_id);
    setEditName(currentName);
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditId(null);
    setEditName('');
  };

  const saveEdit = () => {
    if (editId && editName.trim()) {
      dispatch(updateOffice({ id: editId, payload: { name: editName.trim() } }))
        .unwrap()
        .then(() => {
          showToast({ type: 'success', message: 'Office updated successfully' });
          closeEdit();
        })
        .catch((e: any) => showToast({ type: 'error', message: formatApiError(e) }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile App-like Header - Enhanced Responsive */}
      <div className="bg-white border-b border-gray-200 ">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-12 xs:h-14 sm:h-16">
            <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-4 flex-1 min-w-0">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-auto md:h-auto md:gap-2 md:px-3 md:py-2 text-gray-600 bg-gray-50 md:bg-white rounded-full md:rounded-lg border-0 md:border md:border-gray-200 hover:bg-gray-100 md:hover:bg-gray-50 transition-all duration-200 active:scale-95 touch-manipulation"
              >
                <ChevronLeft className="w-4 h-4 xs:w-5 xs:h-5 md:w-4 md:h-4" />
                <span className="hidden md:inline text-sm">Back</span>
              </button>

              <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-blue-100 rounded-md sm:rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm xs:text-base sm:text-lg font-semibold text-gray-900 truncate leading-tight">Office Management</h1>
                  <p className="text-xs sm:text-sm text-gray-500 truncate hidden sm:block leading-tight">Manage office locations</p>
                </div>
              </div>
            </div>

            {/* <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-auto md:h-auto md:gap-2 md:px-4 md:py-2 bg-blue-600 text-white rounded-full md:rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm active:scale-95 touch-manipulation ml-1 xs:ml-2"
            >
              <Plus className="w-4 h-4 xs:w-5 xs:h-5 md:w-4 md:h-4" />
              <span className="hidden md:inline text-sm font-medium">Add Office</span>
            </button> */}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">

          {/* Mobile App-like Search Section */}
          <div className="bg-white rounded-xl sm:rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-3 sm:p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search offices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-2.5 bg-gray-50 sm:bg-white border-0 sm:border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white sm:focus:border-blue-500 transition-all duration-200 text-sm sm:text-base placeholder-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Offices Content */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600">Loading offices...</p>
                </div>
              </div>
            ) : filteredOffices.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12">
                <Building2 className="text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No offices found</h3>
                <p className="text-gray-600 text-center mb-4">
                  {searchTerm ? 'No offices match your search criteria.' : 'Get started by adding your first office location.'}
                </p>
                {/* {!searchTerm && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Plus size={18} />
                    Add Office
                  </button>
                )} */}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredOffices.map((office: { _id: string; name: string }) => (
                  <div key={office._id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{office.name}</h3>
                        <p className="text-sm text-gray-600">Office Location</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(office._id, office.name)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
                      >
                        <Edit3 size={14} />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      {/* <button
                        onClick={() => requestDelete(office._id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-200"
                      >
                        <Trash2 size={14} />
                        <span className="hidden sm:inline">Delete</span>
                      </button> */}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Office Modal */}
          <Modal
            open={showAddModal}
            title="Add New Office"
            onClose={() => {
              setShowAddModal(false);
              setName('');
              setNameError(undefined);
            }}
            footer={(
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setName('');
                    setNameError(undefined);
                  }}
                  className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                >
                  Add Office
                </button>
              </div>
            )}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Office Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError(undefined);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${nameError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="Enter office name"
                />
                {nameError && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    {nameError}
                  </p>
                )}
              </div>
            </div>
          </Modal>

          {/* Edit Office Modal */}
          <Modal
            open={editOpen}
            title="Edit Office"
            onClose={closeEdit}
            footer={(
              <div className="flex gap-3">
                <button
                  onClick={closeEdit}
                  className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="flex-1 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                >
                  Save Changes
                </button>
              </div>
            )}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Office Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter office name"
                />
              </div>
            </div>
          </Modal>

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            open={confirmOpen}
            title="Delete Office"
            message="Are you sure you want to delete this office? This action cannot be undone and may affect related data."
            confirmText="Delete Office"
            cancelText="Cancel"
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default OfficeManagement;
