import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ShieldCheck,
  UserPlus,
  Trash2,
  LogOut,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { useSettingsStore } from '../../../stores/useSettingsStore';
import { api } from '../../../services/api';
import { User } from '../../../types';

export const AccountTab: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { closeSettings } = useSettingsStore();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);

  // User management state (Admin only)
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  // Load user list if admin
  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const list = await api.listUsers();
      setUsers(list);
    } catch (err: any) {
      console.error('Failed to load users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    setPwdLoading(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setPwdSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwdSuccess(null), 3500);
    } catch (err: any) {
      setPwdError(err.message || 'Failed to change password.');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError(null);

    if (!newUsername.trim() || newUserPassword.length < 6) {
      setAddUserError('Username required and password must be >= 6 characters.');
      return;
    }

    setAddUserLoading(true);
    try {
      await api.createUser(newUsername.trim(), newUserPassword, newUserRole);
      setNewUsername('');
      setNewUserPassword('');
      setShowAddUser(false);
      await loadUsers();
    } catch (err: any) {
      setAddUserError(err.message || 'Failed to create user.');
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return;
    try {
      await api.deleteUser(id);
      await loadUsers();
    } catch (err: any) {
      alert(`Failed to delete user: ${err.message}`);
    }
  };

  const handleSignOut = async () => {
    closeSettings();
    await logout();
  };

  return (
    <div className="space-y-6 max-w-2xl text-xs">
      {/* 1. Profile Overview Header */}
      <section className="p-4 bg-gray-50 dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-[#333333] flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-base flex items-center justify-center uppercase shadow-sm">
            {user?.username ? user.username.slice(0, 2) : 'ME'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                {user?.username || 'Current User'}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                  isAdmin
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300 dark:border-amber-800/40'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40'
                }`}
              >
                {user?.role || 'user'}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Member since:{' '}
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active session'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg transition-colors font-medium"
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </section>

      {/* 2. Change Password Form */}
      <section className="p-4 bg-gray-50/50 dark:bg-[#1e1e1e]/60 rounded-xl border border-gray-200 dark:border-[#333333] space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-[#333333]">
          <KeyRound size={15} className="text-blue-500" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide text-[11px]">
            Security & Password
          </h3>
        </div>

        {pwdError && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 text-xs">
            <AlertCircle size={14} className="shrink-0" />
            <span>{pwdError}</span>
          </div>
        )}

        {pwdSuccess && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 text-xs">
            <Check size={14} className="shrink-0" />
            <span>{pwdSuccess}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-1.5 bg-white dark:bg-[#252526] border border-gray-300 dark:border-[#3c3c3c] rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full px-3 py-1.5 bg-white dark:bg-[#252526] border border-gray-300 dark:border-[#3c3c3c] rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
                className="w-full px-3 py-1.5 bg-white dark:bg-[#252526] border border-gray-300 dark:border-[#3c3c3c] rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={pwdLoading}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {pwdLoading && <Loader2 size={13} className="animate-spin" />}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </section>

      {/* 3. User Management (Admin Only) */}
      {isAdmin && (
        <section className="p-4 bg-gray-50/50 dark:bg-[#1e1e1e]/60 rounded-xl border border-gray-200 dark:border-[#333333] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-[#333333]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-amber-500" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide text-[11px]">
                User Accounts Management
              </h3>
            </div>
            <button
              onClick={() => setShowAddUser(!showAddUser)}
              className="flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              <UserPlus size={13} />
              <span>{showAddUser ? 'Cancel' : 'Add User'}</span>
            </button>
          </div>

          {/* Collapsible Add User Form */}
          {showAddUser && (
            <form
              onSubmit={handleCreateUser}
              className="p-3 bg-white dark:bg-[#252526] rounded-lg border border-gray-200 dark:border-[#3c3c3c] space-y-3 animate-in fade-in"
            >
              <span className="font-semibold text-gray-800 dark:text-gray-200 block text-[11px]">
                Create New User Account
              </span>

              {addUserError && (
                <div className="p-2 rounded bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs">
                  {addUserError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-gray-500 mb-0.5">Username</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. john"
                    required
                    className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-300 dark:border-[#3c3c3c] rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-0.5">Password</label>
                  <input
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder=">= 6 chars"
                    required
                    className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-300 dark:border-[#3c3c3c] rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-0.5">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-300 dark:border-[#3c3c3c] rounded text-xs"
                  >
                    <option value="viewer">Viewer (Read-only)</option>
                    <option value="editor">Editor (Upload / Edit)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="px-3 py-1 rounded border border-gray-300 dark:border-[#3c3c3c] text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addUserLoading}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-50 flex items-center gap-1"
                >
                  {addUserLoading && <Loader2 size={12} className="animate-spin" />}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          )}

          {/* User List Table */}
          {usersLoading ? (
            <div className="flex items-center justify-center py-6 text-gray-400">
              <Loader2 size={18} className="animate-spin mr-2" />
              <span>Loading users...</span>
            </div>
          ) : (
            <div className="border border-gray-200 dark:border-[#333333] rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-100/70 dark:bg-[#1e1e1e] text-gray-500 uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2 font-medium">User</th>
                    <th className="px-3 py-2 font-medium">Role</th>
                    <th className="px-3 py-2 font-medium hidden sm:table-cell">Created</th>
                    <th className="px-3 py-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-[#333333]">
                  {users.map((u) => {
                    const isSelf = u.id === user?.id;
                    return (
                      <tr key={u.id} className="hover:bg-gray-100/50 dark:hover:bg-[#252526]">
                        <td className="px-3 py-2.5 font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-[#333333] flex items-center justify-center text-[10px] font-bold uppercase text-gray-600 dark:text-gray-300">
                            {u.username.slice(0, 2)}
                          </div>
                          <span>{u.username}</span>
                          {isSelf && (
                            <span className="text-[10px] text-blue-500 font-normal">(You)</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${
                              u.role === 'admin'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-gray-400 hidden sm:table-cell">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            disabled={isSelf}
                            title={isSelf ? 'Cannot delete your own account' : 'Delete user'}
                            className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors rounded"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
