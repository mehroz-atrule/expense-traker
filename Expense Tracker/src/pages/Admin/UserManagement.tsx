import React, { useEffect, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import type { RootState } from '../../app/store'
import { fetchUsers, addUser, removeUser, updateUser, fetchOffices } from '../../redux/admin/adminSlice'
import ConfirmDialog from '../../components/ConfirmDialog'
import Modal from '../../components/Modal'

const UserManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, loading, offices } = useAppSelector((s: RootState) => s.admin);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('submitter');
  const [officeId, setOfficeId] = useState('');

  useEffect(() => { dispatch(fetchUsers()); dispatch(fetchOffices()); }, [dispatch]);

  const handleAdd = () => {
  if (!email || !name) return;
  dispatch(addUser({ name, email, password, role, officeId: officeId || undefined }));
    setName(''); setEmail(''); setPassword(''); setOfficeId('');
  };

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editRole, setEditRole] = useState('submitter')
  const [editOfficeId, setEditOfficeId] = useState('')

  const requestDelete = (id: string) => {
    setPendingDeleteId(id)
    setConfirmOpen(true)
  }

  const cancelDelete = () => {
    setConfirmOpen(false)
    setPendingDeleteId(null)
  }

  const confirmDelete = () => {
    if (pendingDeleteId) {
      dispatch(removeUser(pendingDeleteId))
    }
    cancelDelete()
  }

  const openEdit = (user: { id: string; name: string; email?: string; role?: string; officeId?: string }) => {
    setEditId(user.id)
    setEditName(user.name)
    setEditEmail(user.email || '')
    setEditRole(user.role || 'submitter')
    setEditOfficeId(user.officeId || '')
    setEditOpen(true)
  }

  const closeEdit = () => {
    setEditOpen(false)
    setEditId(null)
    setEditName('')
    setEditEmail('')
    setEditRole('submitter')
    setEditOfficeId('')
  }

  const saveEdit = () => {
    if (!editId) return
    const payload: { name?: string; email?: string; role?: string; officeId?: string } = {}
    if (editName.trim()) payload.name = editName.trim()
    if (editEmail.trim()) payload.email = editEmail.trim()
    if (editRole) payload.role = editRole
    if (editOfficeId) payload.officeId = editOfficeId
    dispatch(updateUser({ id: editId, payload }))
    closeEdit()
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mb-3">
        <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-sm text-gray-600">
          <ChevronLeft size={16} /> Back
        </button>
      </div>
      <h2 className="text-lg font-semibold mb-4">User Management</h2>

      <div className="mb-6 grid grid-cols-2 gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="border p-2 rounded" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border p-2 rounded" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="border p-2 rounded" />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="border p-2 rounded">
          <option value="submitter">Submitter</option>
          <option value="operations">Operations</option>
          <option value="finance">Finance</option>
          <option value="admin">Admin</option>
        </select>
        <select value={officeId} onChange={(e) => setOfficeId(e.target.value)} className="border p-2 rounded">
          <option value="">Select Office (optional)</option>
          {offices?.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded">Add User</button>
      </div>

      <div className="bg-white rounded shadow-sm">
        {loading ? (<div className="p-4">Loading...</div>) : (
          <ul>
            {users?.map((u: { id: string; name: string; email?: string; role?: string }) => (
              <li key={u.id} className="flex items-center justify-between px-4 py-3 border-b hover:bg-gray-50">
                <div>
                  <div className="font-semibold">{u.name}</div>
                  <div className="text-sm text-gray-500">{u.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => openEdit(u)} className="text-sm text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => requestDelete(u.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Modal
        open={editOpen}
        title="Edit User"
        onClose={closeEdit}
        footer={(
          <>
            <button onClick={closeEdit} className="px-3 py-2 text-sm rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
            <button onClick={saveEdit} className="px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700">Save</button>
          </>
        )}
      >
        <div className="grid grid-cols-1 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">Name</label>
            <input value={editName} onChange={(e) => setEditName(e.target.value)} className="border p-2 rounded" placeholder="Name" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">Email</label>
            <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="border p-2 rounded" placeholder="Email" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">Role</label>
            <select value={editRole} onChange={(e) => setEditRole(e.target.value)} className="border p-2 rounded">
              <option value="submitter">Submitter</option>
              <option value="operations">Operations</option>
              <option value="finance">Finance</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">Office</label>
            <select value={editOfficeId} onChange={(e) => setEditOfficeId(e.target.value)} className="border p-2 rounded">
              <option value="">Select Office (optional)</option>
              {offices?.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  )
}

export default UserManagement
