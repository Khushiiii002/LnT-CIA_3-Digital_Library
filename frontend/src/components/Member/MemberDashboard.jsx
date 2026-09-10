import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, extractArray } from '../../api/client';
import {
  BookOpen,
  Clock,
  CircleDollarSign,
  CheckCircle,
  AlertTriangle,
  History,
  CreditCard,
  RotateCcw,
  X
} from 'lucide-react';

export const MemberDashboard = ({ setToast }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [holds, setHolds] = useState([]);
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingFineTransaction, setPayingFineTransaction] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const memberId = user?._id || user?.id;

  const fetchData = async () => {
    if (!memberId) return;
    setLoading(true);
    try {
      const [txRes, holdsRes, finesRes] = await Promise.all([
        api.getMemberTransactions(memberId),
        api.getMemberHolds(memberId),
        api.getMemberFines(memberId),
      ]);

      setTransactions(extractArray(txRes, 'transactions'));
      setHolds(extractArray(holdsRes, 'holds'));
      setFines(extractArray(finesRes, 'payments'));
    } catch (err) {
      console.error('Failed to load member dashboard data:', err);
      setToast({ type: 'error', message: err.message || 'Failed to load dashboard data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [memberId]);

  const activeLoans = transactions.filter(t => t.status === 'issued' || t.status === 'overdue');
  const overdueLoans = transactions.filter(t => t.status === 'overdue');
  const unpaidFinesTotal = transactions.reduce((acc, t) => {
    if (t.fine > 0 && !t.finePaid) return acc + t.fine;
    return acc;
  }, 0);

  const handleReturnBook = async (transactionId) => {
    try {
      const res = await api.returnBook(transactionId);
      if (res.success) {
        const fineMsg = res.data?.fine > 0 ? ` Fine calculated: $${res.data.fine}` : '';
        setToast({ type: 'success', message: `Book returned successfully!${fineMsg}` });
        fetchData();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to return book' });
    }
  };

  const handlePayFine = async (e) => {
    e.preventDefault();
    if (!payingFineTransaction) return;

    try {
      const res = await api.payFine({
        transactionId: payingFineTransaction._id,
        amount: parseFloat(paymentAmount) || payingFineTransaction.fine,
      });

      if (res.success) {
        setToast({ type: 'success', message: 'Fine payment processed successfully!' });
        setPayingFineTransaction(null);
        fetchData();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Payment failed' });
    }
  };

  const handleCancelHold = async (holdId) => {
    try {
      const res = await api.cancelHold(holdId);
      if (res.success) {
        setToast({ type: 'success', message: 'Hold reservation cancelled.' });
        fetchData();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to cancel hold' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Active Loans</span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{activeLoans.length}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Overdue Items</span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{overdueLoans.length}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
            <CircleDollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Unpaid Fines</span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">${unpaidFinesTotal.toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Active Holds</span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{holds.length}</div>
          </div>
        </div>
      </div>

      {/* Currently Borrowed Books */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-600" /> Currently Borrowed Books
        </h3>

        {activeLoans.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-sm bg-slate-50 rounded-2xl border border-slate-100">
            You have no active book loans at the moment.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activeLoans.map((tx) => {
              const dueDate = new Date(tx.dueDate);
              const isOverdue = tx.status === 'overdue' || dueDate < new Date();
              return (
                <div key={tx._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900">{tx.bookId?.title || tx.bookTitle || 'Book'}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">by {tx.bookId?.author || 'Author'}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-slate-400">Issued: {new Date(tx.issueDate).toLocaleDateString()}</span>
                      <span className={`font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>
                        Due: {dueDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isOverdue && (
                      <span className="px-3 py-1 bg-rose-100 text-rose-700 font-semibold text-xs rounded-full">
                        Overdue (${tx.fine || 0} Fine)
                      </span>
                    )}
                    <button
                      onClick={() => handleReturnBook(tx._id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Return Book
                    </button>
                    {tx.fine > 0 && !tx.finePaid && (
                      <button
                        onClick={() => {
                          setPayingFineTransaction(tx);
                          setPaymentAmount(tx.fine);
                        }}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow transition-colors"
                      >
                        Pay Fine (${tx.fine})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Holds Queue */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-600" /> My Hold Reservations
        </h3>

        {holds.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-sm bg-slate-50 rounded-2xl border border-slate-100">
            No active holds or reservations.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {holds.map((hold) => (
              <div key={hold._id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-800">{hold.bookId?.title || 'Book Title'}</h4>
                  <p className="text-slate-400 mt-0.5">Requested on {new Date(hold.requestedAt).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-semibold rounded-full border border-purple-100 capitalize">
                    {hold.status}
                  </span>
                  {hold.status === 'pending' && (
                    <button
                      onClick={() => handleCancelHold(hold._id)}
                      className="px-3 py-1 border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold rounded-xl transition-colors"
                    >
                      Cancel Hold
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Borrowing History */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-slate-600" /> Complete Borrowing History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                <th className="pb-3 px-2">Book Title</th>
                <th className="pb-3 px-2">Issue Date</th>
                <th className="pb-3 px-2">Return Date</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2">Fine Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-2 font-medium text-slate-800">{tx.bookId?.title || tx.bookTitle || 'Book'}</td>
                  <td className="py-3 px-2 text-slate-500">{new Date(tx.issueDate).toLocaleDateString()}</td>
                  <td className="py-3 px-2 text-slate-500">
                    {tx.returnDate ? new Date(tx.returnDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-2 py-0.5 font-semibold rounded-full ${
                        tx.status === 'returned'
                          ? 'bg-emerald-50 text-emerald-700'
                          : tx.status === 'overdue'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-medium text-slate-700">
                    {tx.fine > 0 ? `$${tx.fine} (${tx.finePaid ? 'Paid' : 'Unpaid'})` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fine Payment Modal */}
      {payingFineTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-600" /> Fine Payment Processing
            </h3>

            <form onSubmit={handlePayFine} className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 space-y-1">
                <div className="font-semibold text-sm">Overdue Fine</div>
                <div>Book: {payingFineTransaction.bookId?.title || payingFineTransaction.bookTitle}</div>
                <div>Calculated Fine: ${payingFineTransaction.fine}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Payment Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayingFineTransaction(null)}
                  className="px-4 py-2 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
