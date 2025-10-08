import React, { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import type { RootState } from '../../app/store';
import { fetchOffices, addOffice, removeOffice, updateOffice } from '../../redux/admin/adminSlice';
import ConfirmDialog from '../../components/ConfirmDialog';
import Modal from '../../components/Modal';

const OfficeManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { offices, loading } = useAppSelector((s: RootState) => s.admin);
  const [name, setName] = useState('');

  useEffect(() => { dispatch(fetchOffices()); }, [dispatch]);

  const handleAdd = () => {
    if (!name.trim()) return;
    dispatch(addOffice({ name }));
    setName('');
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

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
      dispatch(removeOffice(pendingDeleteId));
    }
    cancelDelete();
  };

  const openEdit = (id: string, currentName: string) => {
    setEditId(id);
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
      dispatch(updateOffice({ id: editId, payload: { name: editName.trim() } }));
      closeEdit();
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="mb-3">
        <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-sm text-gray-600">
          <ChevronLeft size={16} /> Back
        </button>
      </div>
      <h2 className="text-lg font-semibold mb-4">Office Management</h2>

      <div className="mb-4 flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} className="border p-2 rounded" placeholder="Office name" />
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
      </div>

      <div className="bg-white rounded shadow-sm">
        {loading ? (<div className="p-4">Loading...</div>) : (
          <ul>
            {offices?.map((o: { id: string; name: string }) => (
              <li key={o.id} className="flex items-center justify-between px-4 py-3 border-b hover:bg-gray-50">
                <div className="font-medium">{o.name}</div>
                <div className="flex items-center gap-3">
                  <button onClick={() => openEdit(o.id, o.name)} className="text-sm text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => requestDelete(o.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Office"
        message="Are you sure you want to delete this office? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <Modal
        open={editOpen}
        title="Edit Office"
        onClose={closeEdit}
        footer={(
          <>
            <button onClick={closeEdit} className="px-3 py-2 text-sm rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
            <button onClick={saveEdit} className="px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700">Save</button>
          </>
        )}
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-700">Office Name</label>
          <input value={editName} onChange={(e) => setEditName(e.target.value)} className="border p-2 rounded" placeholder="Office name" />
        </div>
      </Modal>
    </div>
  );
};

export default OfficeManagement;
