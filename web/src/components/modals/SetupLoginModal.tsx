import React, { useState } from 'react';
import { X, Lock, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';

export const SetupLoginModal: React.FC = () => {
  const { isAuthModalOpen, setAuthModalOpen, authMode, login, setup, isInitialized } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const isSetupMode = authMode === 'setup' || !isInitialized;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Please fill out all fields');
      return;
    }

    if (isSetupMode) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isSetupMode) {
        await setup(username.trim(), password);
      } else {
        await login(username.trim(), password);
      }
      setAuthModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#252526] w-full max-w-sm rounded-xl shadow-2xl border border-gray-200 dark:border-[#333333] p-6 select-none"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-[#333333]">
          <div className="flex items-center gap-2 font-semibold text-sm text-gray-900 dark:text-gray-100">
            {isSetupMode ? (
              <>
                <ShieldCheck size={18} className="text-blue-500" />
                <span>Initialize Admin Account</span>
              </>
            ) : (
              <>
                <Lock size={18} className="text-blue-500" />
                <span>Sign In to Ola</span>
              </>
            )}
          </div>
          {isInitialized && (
            <button
              onClick={() => setAuthModalOpen(false)}
              className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {isSetupMode && (
          <p className="text-xs text-gray-500 mt-3">
            Welcome to Ola! Please configure your primary administrator credentials to secure this instance.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Username</label>
            <input
              autoFocus
              type="text"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full text-xs p-2.5 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-300 dark:border-gray-700 rounded text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs p-2.5 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-300 dark:border-gray-700 rounded text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {isSetupMode && (
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-300 dark:border-gray-700 rounded text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {error && (
            <div className="text-xs text-red-500 pt-1">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                'Processing...'
              ) : isSetupMode ? (
                <>
                  <UserCheck size={14} />
                  <span>Create Admin & Launch</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
