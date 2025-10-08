import React, { useEffect, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import type { RootState } from '../../app/store'
import { fetchUsers, addUser, removeUser, updateUser, fetchOffices } from '../../redux/admin/adminSlice'
import ConfirmDialog from '../../components/ConfirmDialog'
import Modal from '../../components/Modal'
import OfficeSelect from '../../components/Forms/OfficeSelect'
import { useToast, formatApiError } from '../../components/Toast'

const UserManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { users, loading, offices } = useAppSelector((s: RootState) => s.admin);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('submitter');
  const [officeId, setOfficeId] = useState('');
  const [addErrors, setAddErrors] = useState<{ username?: string; email?: string; officeId?: string }>({});

  useEffect(() => { dispatch(fetchUsers()); dispatch(fetchOffices()); }, [dispatch]);

  const handleAdd = () => {
  const nextErrors: { username?: string; email?: string; officeId?: string } = {};
  if (!username.trim()) nextErrors.username = 'Username is required';
  if (!email.trim()) nextErrors.email = 'Email is required';
  if (!officeId.trim()) nextErrors.officeId = 'Office is required';
  setAddErrors(nextErrors);
  if (Object.keys(nextErrors).length) return;
  dispatch(addUser({ username, email, password, role, officeId: officeId || undefined }))
    .unwrap()
    .then(() => {
      showToast({ type: 'success', message: 'User added successfully' });
      setUsername(''); setEmail(''); setPassword(''); setOfficeId('');
      setAddErrors({});
    })
    .catch((e: any) => showToast({ type: 'error', message: formatApiError(e) }));
  };

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editUsername, setEditUsername] = useState('')
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
    console.log('Deleting user with id:', pendingDeleteId)
    if (pendingDeleteId) {
      dispatch(removeUser(pendingDeleteId))
        .unwrap()
        .then(() => showToast({ type: 'success', message: 'User deleted' }))
        .catch((e: any) => showToast({ type: 'error', message: formatApiError(e) }))
    }
    cancelDelete()
  }

  const openEdit = (user: { _id: string; name?: string; username?: string; email?: string; role?: string; officeId?: string }) => {
    setEditId(user._id)
    setEditUsername(user.username || user.name || '')
    setEditEmail(user.email || '')
    setEditRole(user.role || 'submitter')
    setEditOfficeId(user.officeId || '')
    setEditOpen(true)
  }

  const closeEdit = () => {
    setEditOpen(false)
    setEditId(null)
    setEditUsername('')
    setEditEmail('')
    setEditRole('submitter')
    setEditOfficeId('')
  }

  const saveEdit = () => {
    if (!editId) return
    const payload: { username?: string; email?: string; role?: string; officeId?: string } = {}
    if (editUsername.trim()) payload.username = editUsername.trim()
    if (editEmail.trim()) payload.email = editEmail.trim()
    if (editRole) payload.role = editRole
    if (editOfficeId) payload.officeId = editOfficeId
    dispatch(updateUser({ id: editId, payload }))
      .unwrap()
      .then(() => {
        showToast({ type: 'success', message: 'User updated' });
        closeEdit();
      })
      .catch((e: any) => showToast({ type: 'error', message: formatApiError(e) }))
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
        <div>
          <input value={username} onChange={(e) => { setUsername(e.target.value); if (addErrors.username) setAddErrors(p => ({ ...p, username: undefined })); }} placeholder="Username" className={`border p-2 rounded w-full ${addErrors.username ? 'border-red-500' : ''}`} />
          {addErrors.username ? <div className="text-xs text-red-600 mt-1">{addErrors.username}</div> : null}
        </div>
        <div>
          <input value={email} onChange={(e) => { setEmail(e.target.value); if (addErrors.email) setAddErrors(p => ({ ...p, email: undefined })); }} placeholder="Email" className={`border p-2 rounded w-full ${addErrors.email ? 'border-red-500' : ''}`} />
          {addErrors.email ? <div className="text-xs text-red-600 mt-1">{addErrors.email}</div> : null}
        </div>
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="border p-2 rounded" />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="border p-2 rounded">
          <option value="submitter">Submitter</option>
          <option value="operations">Operations</option>
          <option value="finance">Finance</option>
          <option value="admin">Admin</option>
        </select>
        <div>
          <OfficeSelect value={officeId} onChange={(v) => { setOfficeId(v); if (addErrors.officeId) setAddErrors(p => ({ ...p, officeId: undefined })); }} offices={offices} />
          {addErrors.officeId ? <div className="text-xs text-red-600 mt-1">{addErrors.officeId}</div> : null}
        </div>
      </div>

      <div className="mb-6">
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded">Add User</button>
      </div>

      <div className="bg-white rounded shadow-sm">
        {loading ? (<div className="p-4">Loading...</div>) : (
          <ul>
            {users?.map((u: { _id: string; name?: string; username?: string; email?: string; role?: string; officeId?: string }) => (
              <li key={u._id} className="flex items-center justify-between px-4 py-3 border-b hover:bg-gray-50">
                <div>
                  <div className="font-semibold">{u.name || u.username}</div>
                  <div className="text-sm text-gray-500">{u.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => openEdit(u)} className="text-sm text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => requestDelete(u._id)} className="text-sm text-red-600 hover:underline">Delete</button>
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
            <label className="text-sm text-gray-700">Username</label>
            <input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} className="border p-2 rounded" placeholder="Username" />
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
          <OfficeSelect value={editOfficeId} onChange={setEditOfficeId} offices={offices} />
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
