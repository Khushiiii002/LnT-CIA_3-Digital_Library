import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, LogIn, UserCheck, Shield, BookMarked, ArrowRight } from 'lucide-react';

export const LoginForm = ({ onSwitchToRegister, setToast }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setToast({ type: 'error', message: 'Please enter both email and password.' });
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      setToast({ type: 'success', message: 'Logged in successfully!' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Login failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
      setToast({ type: 'success', message: `Logged in as demo user!` });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Demo login failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-brand-50 text-brand-600 rounded-2xl mb-3 shadow-inner">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
        <p className="text-sm text-slate-500 mt-1">Sign in to your Digital Library account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. john@student.com"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm transition-all"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Quick Demo Shortcuts */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
          1-Click Demo Logins
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleDemoLogin('admin@library.com', 'admin123')}
            className="p-2.5 border border-purple-200 bg-purple-50/50 hover:bg-purple-100/70 text-purple-700 rounded-xl text-xs font-medium text-left transition-colors flex items-center gap-2"
          >
            <Shield className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <div className="font-semibold">Admin</div>
              <div className="text-[10px] opacity-75">Full System Access</div>
            </div>
          </button>

          <button
            onClick={() => handleDemoLogin('librarian@library.com', 'lib123')}
            className="p-2.5 border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-blue-700 rounded-xl text-xs font-medium text-left transition-colors flex items-center gap-2"
          >
            <BookMarked className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <div className="font-semibold">Librarian</div>
              <div className="text-[10px] opacity-75">Catalog & Circulation</div>
            </div>
          </button>

          <button
            onClick={() => handleDemoLogin('john@student.com', 'password123')}
            className="p-2.5 border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-700 rounded-xl text-xs font-medium text-left transition-colors flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-semibold">Student</div>
              <div className="text-[10px] opacity-75">John (3 books max)</div>
            </div>
          </button>

          <button
            onClick={() => handleDemoLogin('robert@faculty.com', 'password123')}
            className="p-2.5 border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-amber-700 rounded-xl text-xs font-medium text-left transition-colors flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <div className="font-semibold">Faculty</div>
              <div className="text-[10px] opacity-75">Robert (10 books max)</div>
            </div>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-500">
        Don't have an account?{' '}
        <button
          onClick={onSwitchToRegister}
          className="text-brand-600 font-semibold hover:underline"
        >
          Register as Member
        </button>
      </div>
    </div>
  );
};
