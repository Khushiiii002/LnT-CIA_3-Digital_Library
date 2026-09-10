import React, { useState, useEffect } from 'react';
import { api, extractArray } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, Plus, Edit3, Trash2, CheckCircle2 } from 'lucide-react';

export const MembershipPlansView = ({ setToast }) => {
  const { isAdmin } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    memberType: 'student',
    maxBooksAllowed: 3,
    loanDurationDays: 14,
    finePerDay: 2,
  });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.getMembershipPlans();
      setPlans(extractArray(res, 'plans'));
    } catch (err) {
      console.error('Failed to load membership plans:', err);
      setToast({ type: 'error', message: err.message || 'Failed to fetch membership plans' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createMembershipPlan(formData);
      if (res.success) {
        setToast({ type: 'success', message: 'Membership plan created!' });
        setShowAddModal(false);
        fetchPlans();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to create plan' });
    }
  };

  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    if (!selectedPlanForEdit) return;

    try {
      const res = await api.updateMembershipPlan(selectedPlanForEdit._id, formData);
      if (res.success) {
        setToast({ type: 'success', message: 'Membership plan updated!' });
        setSelectedPlanForEdit(null);
        fetchPlans();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to update plan' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-brand-600" /> Membership Plans & Loan Rules
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure borrowing limits, loan durations, and per-day fine rates per member tier
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setFormData({
                name: '',
                memberType: 'student',
                maxBooksAllowed: 3,
                loanDurationDays: 14,
                finePerDay: 2,
              });
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Create New Plan
          </button>
        )}
      </div>

      {/* Plans Cards */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-sm">Loading plans...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-lg">{plan.name}</h3>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 uppercase">
                    {plan.memberType}
                  </span>
                </div>

                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Max Books Allowed:</span>
                    <span className="font-bold text-slate-900">{plan.maxBooksAllowed} Books</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Loan Duration:</span>
                    <span className="font-bold text-slate-900">{plan.loanDurationDays} Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Overdue Daily Fine:</span>
                    <span className="font-bold text-rose-600">${plan.finePerDay}/day</span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedPlanForEdit(plan);
                      setFormData({
                        name: plan.name,
                        memberType: plan.memberType,
                        maxBooksAllowed: plan.maxBooksAllowed,
                        loanDurationDays: plan.loanDurationDays,
                        finePerDay: plan.finePerDay,
                      });
                    }}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Rules
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal for creating / editing plans */}
      {(showAddModal || selectedPlanForEdit) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {selectedPlanForEdit ? 'Edit Membership Plan' : 'Create New Membership Plan'}
            </h3>

            <form onSubmit={selectedPlanForEdit ? handleUpdatePlan : handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Plan Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Postgraduate Plan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Member Category</label>
                <select
                  value={formData.memberType}
                  onChange={(e) => setFormData({ ...formData, memberType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Max Books</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxBooksAllowed}
                    onChange={(e) => setFormData({ ...formData, maxBooksAllowed: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.loanDurationDays}
                    onChange={(e) => setFormData({ ...formData, loanDurationDays: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Fine ($/day)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.finePerDay}
                    onChange={(e) => setFormData({ ...formData, finePerDay: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedPlanForEdit(null);
                  }}
                  className="px-4 py-2 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
