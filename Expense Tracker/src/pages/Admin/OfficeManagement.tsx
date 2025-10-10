import React, { useEffect, useState } from 'react';
import { 
  ChevronLeft, 
  Plus, 
  Building2, 
  Edit3, 
  Trash2, 
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

  const requestDelete = (id: string) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

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
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => window.history.back()} 
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
            >
              <ChevronLeft size={16} /> Back
            </button>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Office</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Office Management</h1>
            <p className="text-gray-600 mt-1">Manage your organization's office locations</p>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search offices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
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
              {!searchTerm && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus size={18} />
                  Add Office
                </button>
              )}
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
                    <button
                      onClick={() => requestDelete(office._id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-200"
                    >
                      <Trash2 size={14} />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  nameError ? 'border-red-500 bg-red-50' : 'border-gray-300'
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
  );
};

export default OfficeManagement;
