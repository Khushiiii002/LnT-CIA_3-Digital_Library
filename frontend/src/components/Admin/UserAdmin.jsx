import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Users, UserPlus, Shield, UserX, CheckCircle, Search } from 'lucide-react';

export const UserAdmin = ({ setToast }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddLibrarianModal, setShowAddLibrarianModal] = useState(false);

  const [newLibrarian, setNewLibrarian] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers();
      if (res.success) {
        const userList = Array.isArray(res.data) ? res.data : (res.data?.users || []);
        setUsers(userList);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setToast({ type: 'error', message: err.message || 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user account?')) return;
    try {
      const res = await api.deactivateUser(userId);
      if (res.success) {
        setToast({ type: 'success', message: 'User deactivated successfully' });
        fetchUsers();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to deactivate user' });
    }
  };

  const handleCreateLibrarian = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createLibrarian(newLibrarian);
      if (res.success) {
        setToast({ type: 'success', message: 'Librarian account created!' });
        setShowAddLibrarianModal(false);
        setNewLibrarian({ name: '', email: '', password: '', phone: '' });
        fetchUsers();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to create librarian' });
    }
  };

  const filteredUsers = users.filter(
    u =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.membershipId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" /> User Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage system accounts, deactivate members, and provision staff
          </p>
        </div>

        <button
          onClick={() => setShowAddLibrarianModal(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Provision Librarian Account
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name, email, or membership ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                  <th className="pb-3 px-3">Name</th>
                  <th className="pb-3 px-3">Email / ID</th>
                  <th className="pb-3 px-3">Role</th>
                  <th className="pb-3 px-3">Type</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {u.email}
                      {u.membershipId && (
                        <span className="block font-mono text-[10px] text-slate-400">{u.membershipId}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 font-semibold rounded-full capitalize ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : u.role === 'librarian'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 capitalize">{u.memberType || '-'}</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 font-semibold rounded-full ${
                          u.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {u.role !== 'admin' && u.isActive !== false && (
                        <button
                          onClick={() => handleDeactivate(u._id)}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-xs border border-rose-200 transition-colors"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Librarian Modal */}
      {showAddLibrarianModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" /> Create Librarian Account
            </h3>

            <form onSubmit={handleCreateLibrarian} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={newLibrarian.name}
                  onChange={(e) => setNewLibrarian({ ...newLibrarian, name: e.target.value })}
                  placeholder="e.g. Staff Member"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
                <input
                  type="email"
                  value={newLibrarian.email}
                  onChange={(e) => setNewLibrarian({ ...newLibrarian, email: e.target.value })}
                  placeholder="e.g. staff@library.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Password</label>
                <input
                  type="password"
                  value={newLibrarian.password}
                  onChange={(e) => setNewLibrarian({ ...newLibrarian, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddLibrarianModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl shadow"
                >
                  Create Librarian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
