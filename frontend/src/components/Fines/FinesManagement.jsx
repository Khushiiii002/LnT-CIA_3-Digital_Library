import React, { useState, useEffect } from 'react';
import { api, extractArray } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { CircleDollarSign, ShieldAlert, CreditCard, Plus, CheckCircle2 } from 'lucide-react';

export const FinesManagement = ({ setToast }) => {
  const { isLibrarian, user } = useAuth();
  const [fines, setFines] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Issue fine modal state
  const [showIssueFineModal, setShowIssueFineModal] = useState(false);
  const [issueFineData, setIssueFineData] = useState({
    memberId: '',
    amount: '',
    reason: 'Damaged book cover / Late return fee',
  });

  // Waive fine modal state
  const [selectedTxForWaive, setSelectedTxForWaive] = useState(null);
  const [selectedFineForWaive, setSelectedFineForWaive] = useState(null);
  const [waiveReason, setWaiveReason] = useState('');

  const fetchFinesData = async () => {
    setLoading(true);
    try {
      let resFines, resTx, resUsers;
      if (isLibrarian) {
        [resFines, resTx, resUsers] = await Promise.all([
          api.getAllFines(),
          api.getAllTransactions(),
          api.getUsers(),
        ]);
        setUsers(extractArray(resUsers, 'users'));
      } else {
        [resFines, resTx] = await Promise.all([
          api.getMemberFines(user._id || user.id),
          api.getMemberTransactions(user._id || user.id),
        ]);
      }

      setFines(extractArray(resFines, 'payments'));
      setTransactions(extractArray(resTx, 'transactions'));
    } catch (err) {
      console.error('Failed to load fines:', err);
      setToast({ type: 'error', message: err.message || 'Failed to load fine records' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinesData();
  }, [isLibrarian, user]);

  const handleIssueFineSubmit = async (e) => {
    e.preventDefault();
    if (!issueFineData.memberId || !issueFineData.amount) {
      setToast({ type: 'error', message: 'Please select a member and enter an amount.' });
      return;
    }

    try {
      const res = await api.issueFine(issueFineData);
      if (res.success) {
        setToast({ type: 'success', message: res.message || 'Fine issued to member!' });
        setShowIssueFineModal(false);
        setIssueFineData({ memberId: '', amount: '', reason: 'Damaged book cover / Late return fee' });
        fetchFinesData();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to issue fine' });
    }
  };

  const handlePayFineDirect = async (fineId, amount) => {
    try {
      const res = await api.payFine({ fineId });
      if (res.success) {
        setToast({ type: 'success', message: 'Fine payment recorded!' });
        fetchFinesData();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Payment failed' });
    }
  };

  const handleWaiveFine = async (e) => {
    e.preventDefault();
    try {
      const payload = { reason: waiveReason || 'Librarian discretion' };
      if (selectedTxForWaive) payload.transactionId = selectedTxForWaive._id;
      if (selectedFineForWaive) payload.fineId = selectedFineForWaive._id;

      const res = await api.waiveFine(payload);
      if (res.success) {
        setToast({ type: 'success', message: 'Fine waived successfully!' });
        setSelectedTxForWaive(null);
        setSelectedFineForWaive(null);
        setWaiveReason('');
        fetchFinesData();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to waive fine' });
    }
  };

  const pendingFineTransactions = transactions.filter(t => t.fine > 0 && !t.finePaid);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CircleDollarSign className="w-6 h-6 text-amber-600" /> Fine Tracking & Assessment Counter
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isLibrarian
              ? 'Issue fines to students/faculty, collect payments, and manage fee waivers'
              : 'View your fine history and pending payments'}
          </p>
        </div>

        {isLibrarian && (
          <button
            onClick={() => setShowIssueFineModal(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Issue Fine to Student / Faculty
          </button>
        )}
      </div>

      {/* Outstanding Transaction Fines Table */}
      {pendingFineTransactions.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" /> Overdue Book Transaction Fines
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                  <th className="pb-3 px-3">Book Title</th>
                  <th className="pb-3 px-3">Member</th>
                  <th className="pb-3 px-3">Due Date</th>
                  <th className="pb-3 px-3">Fine Amount</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingFineTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-slate-900">
                      {tx.bookId?.title || tx.bookTitle || 'Book'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 font-medium">
                      {tx.memberId?.name || tx.memberName || 'Member'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">
                      {new Date(tx.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-rose-600">
                      ${tx.fine}
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-2">
                      {isLibrarian && (
                        <button
                          onClick={() => setSelectedTxForWaive(tx)}
                          className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-xl text-xs border border-amber-200 transition-colors"
                        >
                          Waive Fine
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fine Assessment & Payment History */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-600" /> Member Fines & Payment Records
        </h3>

        {fines.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-sm">No fine records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                  <th className="pb-3 px-3">Member</th>
                  <th className="pb-3 px-3">Reason</th>
                  <th className="pb-3 px-3">Amount</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fines.map((fine) => (
                  <tr key={fine._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-slate-800">
                      {fine.memberId?.name || 'Member'}
                      <span className="block text-[10px] text-slate-400">
                        {fine.memberId?.membershipId || fine.memberId?.email} ({fine.memberId?.memberType || 'student'})
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 max-w-xs truncate">
                      {fine.reason || fine.transactionId?.bookTitle || 'Fine penalty'}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      ${fine.amount}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-0.5 font-semibold rounded-full capitalize ${
                          fine.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : fine.status === 'waived'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {fine.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">
                      {new Date(fine.paidAt || fine.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-2">
                      {fine.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handlePayFineDirect(fine._id, fine.amount)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-colors"
                          >
                            Mark Paid
                          </button>
                          {isLibrarian && (
                            <button
                              onClick={() => setSelectedFineForWaive(fine)}
                              className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-xl text-xs border border-amber-200 transition-colors"
                            >
                              Waive
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Issue Fine directly to Student / Faculty */}
      {showIssueFineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" /> Issue Fine to Student / Faculty
            </h3>

            <form onSubmit={handleIssueFineSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Select Student / Faculty Member
                </label>
                <select
                  value={issueFineData.memberId}
                  onChange={(e) => setIssueFineData({ ...issueFineData, memberId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                  required
                >
                  <option value="">-- Choose Member --</option>
                  {users.filter(u => u.isActive !== false).map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.membershipId || u.email}) - {u.memberType || u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Fine Amount ($)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={issueFineData.amount}
                  onChange={(e) => setIssueFineData({ ...issueFineData, amount: e.target.value })}
                  placeholder="e.g. 10.00"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Reason for Fine
                </label>
                <input
                  type="text"
                  value={issueFineData.reason}
                  onChange={(e) => setIssueFineData({ ...issueFineData, reason: e.target.value })}
                  placeholder="e.g. Damaged book page / Late penalty"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowIssueFineModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl shadow"
                >
                  Issue Fine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Waive Fine Modal */}
      {(selectedTxForWaive || selectedFineForWaive) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" /> Waive Fine Fee
            </h3>

            <form onSubmit={handleWaiveFine} className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold text-sm text-amber-950">
                  Fine Amount: ${selectedTxForWaive?.fine || selectedFineForWaive?.amount}
                </div>
                <div>Member: {selectedTxForWaive?.memberName || selectedFineForWaive?.memberId?.name}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Reason for Fee Waiver
                </label>
                <input
                  type="text"
                  value={waiveReason}
                  onChange={(e) => setWaiveReason(e.target.value)}
                  placeholder="e.g. Medical certificate provided"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTxForWaive(null);
                    setSelectedFineForWaive(null);
                  }}
                  className="px-4 py-2 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-xl shadow"
                >
                  Confirm Waive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
