import React, { useState, useEffect } from 'react';
import { api, extractArray } from '../../api/client';
import { ArrowRightLeft, BookOpen, User, Calendar, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';

export const IssueReturnWorkflow = ({ setToast }) => {
  const [activeTab, setActiveTab] = useState('issue'); // 'issue' | 'return'
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Issue Form State
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [customDueDate, setCustomDueDate] = useState('');

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [booksRes, usersRes, txRes] = await Promise.all([
        api.getBooks({ limit: 100 }),
        api.getUsers(),
        api.getAllTransactions(),
      ]);

      setBooks(extractArray(booksRes, 'books'));
      setUsers(extractArray(usersRes, 'users'));
      setTransactions(extractArray(txRes, 'transactions'));
    } catch (err) {
      console.error('Failed to load workflow data:', err);
      setToast({ type: 'error', message: err.message || 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleIssueBook = async (e) => {
    e.preventDefault();
    if (!selectedMemberId || !selectedBookId) {
      setToast({ type: 'error', message: 'Please select both a member and a book.' });
      return;
    }

    try {
      const payload = {
        memberId: selectedMemberId,
        bookId: selectedBookId,
      };
      if (customDueDate) payload.dueDate = customDueDate;

      const res = await api.issueBook(payload);
      if (res.success) {
        setToast({ type: 'success', message: 'Book issued successfully!' });
        setSelectedBookId('');
        setSelectedMemberId('');
        fetchInitialData();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to issue book' });
    }
  };

  const handleReturnBook = async (transactionId) => {
    try {
      const res = await api.returnBook(transactionId);
      if (res.success) {
        const fineMsg = res.fine > 0 ? ` Returned with a $${res.fine} fine.` : '';
        setToast({ type: 'success', message: `Book returned successfully!${fineMsg}` });
        fetchInitialData();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to return book' });
    }
  };

  const activeIssuedLoans = transactions.filter(t => t.status === 'issued' || t.status === 'overdue');
  const availableBooks = books.filter(b => b.availableCopies > 0);
  const memberUsers = users.filter(u => u.isActive !== false);

  return (
    <div className="space-y-6">
      {/* Header & Sub-nav */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-brand-600" /> Book Issue & Return Counter
          </h2>
          <p className="text-xs text-slate-500 mt-1">Manage physical book borrowing and returns</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('issue')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'issue'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Issue Book
          </button>
          <button
            onClick={() => setActiveTab('return')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === 'return'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Process Return ({activeIssuedLoans.length})
          </button>
        </div>
      </div>

      {activeTab === 'issue' ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" /> Issue a Book to Member
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a member and an available copy from catalog
            </p>
          </div>

          <form onSubmit={handleIssueBook} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Select Library Member
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm bg-white outline-none focus:ring-2 focus:ring-brand-500"
                required
              >
                <option value="">-- Choose Member --</option>
                {memberUsers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.membershipId || u.email}) - {u.memberType || 'Student'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Select Book from Catalog
              </label>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm bg-white outline-none focus:ring-2 focus:ring-brand-500"
                required
              >
                <option value="">-- Choose Available Book --</option>
                {availableBooks.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.title} by {b.author} ({b.availableCopies} available)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                Custom Due Date (Optional - defaults to Plan duration)
              </label>
              <input
                type="date"
                value={customDueDate}
                onChange={(e) => setCustomDueDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-5 h-5" /> Complete Book Issue
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-blue-600" /> Active Loans Pending Return
          </h3>

          {activeIssuedLoans.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No books currently on loan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                    <th className="pb-3 px-3">Book Title</th>
                    <th className="pb-3 px-3">Member</th>
                    <th className="pb-3 px-3">Issue Date</th>
                    <th className="pb-3 px-3">Due Date</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeIssuedLoans.map((tx) => {
                    const isOverdue = tx.status === 'overdue' || new Date(tx.dueDate) < new Date();
                    return (
                      <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-3 font-semibold text-slate-900">
                          {tx.bookId?.title || tx.bookTitle || 'Book'}
                        </td>
                        <td className="py-3.5 px-3 text-slate-700 font-medium">
                          {tx.memberId?.name || tx.memberName || 'Member'}
                          <span className="block text-[10px] text-slate-400 font-mono">
                            {tx.memberId?.membershipId || tx.memberId?.email}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-500">
                          {new Date(tx.issueDate).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-3 font-medium text-slate-700">
                          {new Date(tx.dueDate).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2.5 py-0.5 font-semibold rounded-full ${
                              isOverdue
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {isOverdue ? 'Overdue' : 'Issued'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => handleReturnBook(tx._id)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-colors"
                          >
                            Receive Return
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
