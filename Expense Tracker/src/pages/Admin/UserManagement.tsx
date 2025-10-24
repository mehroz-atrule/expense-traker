import React, { useEffect, useState } from 'react'
import {
  ChevronLeft,
  Plus,
  Users,
  Edit3,
  Trash2,
  Search,
  Mail,
  Shield,
  Building2
} from 'lucide-react'
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

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('submitter');
  const [officeId, setOfficeId] = useState('');
  const [addErrors, setAddErrors] = useState<{ username?: string; email?: string; officeId?: string }>({});

  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => { dispatch(fetchUsers()); dispatch(fetchOffices()); }, [dispatch]);

  // Filter users based on search term
  const filteredUsers = users?.filter((user: any) =>
    (user.name || user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
        setUsername('');
        setEmail('');
        setPassword('');
        setRole('submitter');
        setOfficeId('');
        setAddErrors({});
        setShowAddModal(false);
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

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'finance': return 'bg-green-100 text-green-800'
      case 'operations': return 'bg-blue-100 text-blue-800'
      case 'submitter': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return <Shield className="w-4 h-4" />
      case 'finance': return <Building2 className="w-4 h-4" />
      case 'operations': return <Users className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile App-like Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:gap-2 sm:px-3 sm:py-2 text-gray-600 bg-gray-50 sm:bg-white rounded-full sm:rounded-lg border-0 sm:border sm:border-gray-200 hover:bg-gray-100 sm:hover:bg-gray-50 transition-colors duration-200 active:scale-95"
              >
                <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4" />
                {/* <span className="hidden sm:inline text-sm">Back</span> */}
              </button>

              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">User Management</h1>
                  <p className="text-xs sm:text-sm text-gray-500 truncate hidden sm:block">Manage users and permissions</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:gap-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-full sm:rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm active:scale-95"
            >
              <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline text-sm font-medium">Add User</span>
            </button>
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
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-2.5 bg-gray-50 sm:bg-white border-0 sm:border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white sm:focus:border-blue-500 transition-all duration-200 text-sm sm:text-base placeholder-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Users Content */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600">Loading users...</p>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <Users className="text-gray-400 w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-sm">
                  {searchTerm ? 'No users match your search criteria. Try adjusting your search.' : 'Get started by adding your first user to the system.'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all duration-200 shadow-sm text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add User
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100 sm:divide-gray-200">
                {filteredUsers.map((user: any) => (
                  <div key={user._id} className="group p-3 sm:p-4 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full sm:rounded-xl flex items-center justify-center shadow-sm">
                          <Users className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {user.name || user.username}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium self-start ${getRoleColor(user.role)}`}>
                            {getRoleIcon(user.role)}
                            <span className="capitalize">{user.role || 'submitter'}</span>
                          </span>
                        </div>

                        <div className="space-y-1 sm:space-y-0 sm:flex sm:items-center sm:gap-4 text-xs sm:text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          {user.officeId && offices?.find(o => o._id === user.officeId) && (
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">{offices.find(o => o._id === user.officeId)?.name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0">
                        <button
                          onClick={() => openEdit(user)}
                          className="inline-flex items-center justify-center gap-1 w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 text-blue-600 bg-blue-50 rounded-lg sm:rounded-md hover:bg-blue-100 active:scale-95 transition-all duration-200 shadow-sm group-hover:shadow"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span className="hidden sm:inline text-sm font-medium">Edit</span>
                        </button>
                        <button
                          onClick={() => requestDelete(user._id)}
                          className="inline-flex items-center justify-center gap-1 w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 text-red-600 bg-red-50 rounded-lg sm:rounded-md hover:bg-red-100 active:scale-95 transition-all duration-200 shadow-sm group-hover:shadow"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline text-sm font-medium">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add User Modal */}
          <Modal
            open={showAddModal}
            title="Add New User"
            onClose={() => {
              setShowAddModal(false);
              setUsername('');
              setEmail('');
              setPassword('');
              setRole('submitter');
              setOfficeId('');
              setAddErrors({});
            }}
            footer={(
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setUsername('');
                    setEmail('');
                    setPassword('');
                    setRole('submitter');
                    setOfficeId('');
                    setAddErrors({});
                  }}
                  className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                >
                  Add User
                </button>
              </div>
            )}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (addErrors.username) setAddErrors(p => ({ ...p, username: undefined }));
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${addErrors.username ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="Enter username"
                  />
                  {addErrors.username && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (addErrors.email) setAddErrors(p => ({ ...p, email: undefined }));
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${addErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="Enter email address"
                  />
                  {addErrors.email && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="submitter">Submitter</option>
                    <option value="operations">Operations</option>
                    <option value="finance">Finance</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <OfficeSelect
                  value={officeId}
                  onChange={(v) => {
                    setOfficeId(v);
                    if (addErrors.officeId) setAddErrors(p => ({ ...p, officeId: undefined }));
                  }}
                  offices={offices}
                />
                {addErrors.officeId && (
                  <p className="text-sm text-red-600 mt-1">{addErrors.officeId}</p>
                )}
              </div>
            </div>
          </Modal>

          {/* Edit User Modal */}
          <Modal
            open={editOpen}
            title="Edit User"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-username" className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    id="edit-username"
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    id="edit-email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  id="edit-role"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="submitter">Submitter</option>
                  <option value="operations">Operations</option>
                  <option value="finance">Finance</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Office</label>
                <OfficeSelect value={editOfficeId} onChange={setEditOfficeId} offices={offices} />
              </div>
            </div>
          </Modal>

          {/* Delete Confirmation Dialog */}
          <ConfirmDialog
            open={confirmOpen}
            title="Delete User"
            message="Are you sure you want to delete this user? This action cannot be undone and may affect related data."
            confirmText="Delete User"
            cancelText="Cancel"
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          />
        </div>
      </div>
    </div>
  )
}

export default UserManagement
