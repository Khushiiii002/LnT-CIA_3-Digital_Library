import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, ArrowLeft } from 'lucide-react';

export const RegisterForm = ({ onSwitchToLogin, setToast }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    memberType: 'student',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setToast({ type: 'error', message: 'Name, email, and password are required.' });
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      setToast({ type: 'success', message: 'Registration successful! Welcome to the library.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Registration failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-3 shadow-inner">
          <UserPlus className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Member Registration</h2>
        <p className="text-sm text-slate-500 mt-1">Create a new library account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Alice Johnson"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. alice@student.com"
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
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm transition-all"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Member Type
            </label>
            <select
              name="memberType"
              value={formData.memberType}
              onChange={handleChange}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm transition-all bg-white"
            >
              <option value="student">Student (Max 3 books)</option>
              <option value="faculty">Faculty (Max 10 books)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="1234567890"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register Account'}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-brand-600 font-semibold hover:underline flex items-center gap-1 mx-auto mt-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </button>
      </div>
    </div>
  );
};
