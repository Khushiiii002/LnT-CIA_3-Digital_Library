import React, { useState, useEffect } from 'react';
import { api, extractArray } from '../../api/client';
import { BarChart3, AlertTriangle, TrendingUp, PackageCheck, BellRing, Edit } from 'lucide-react';

export const ReportsView = ({ setToast }) => {
  const [activeReportTab, setActiveReportTab] = useState('inventory'); // 'inventory' | 'overdue' | 'most_borrowed'
  const [inventory, setInventory] = useState([]);
  const [overdueList, setOverdueList] = useState([]);
  const [mostBorrowed, setMostBorrowed] = useState([]);
  const [loading, setLoading] = useState(false);

  // Edit lost/damaged state
  const [selectedBookForCopy, setSelectedBookForCopy] = useState(null);
  const [lostCopies, setLostCopies] = useState(0);
  const [damagedCopies, setDamagedCopies] = useState(0);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [invRes, overdueRes, borrowedRes] = await Promise.all([
        api.getInventoryReport(),
        api.getOverdueReport(),
        api.getMostBorrowedReport(),
      ]);

      setInventory(extractArray(invRes, 'books'));
      setOverdueList(extractArray(overdueRes, 'overdueTransactions'));
      setMostBorrowed(extractArray(borrowedRes, 'mostBorrowed'));
    } catch (err) {
      console.error('Failed to load reports:', err);
      setToast({ type: 'error', message: err.message || 'Failed to fetch management reports' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateOverdueNotifications = async () => {
    try {
      const res = await api.generateOverdueNotifications();
      if (res.success) {
        setToast({ type: 'success', message: res.message || 'Overdue reminder notifications generated!' });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to generate reminders' });
    }
  };

  const handleUpdateCopyStatus = async (e) => {
    e.preventDefault();
    if (!selectedBookForCopy) return;

    try {
      const res = await api.updateCopyStatus(selectedBookForCopy._id, {
        lostCopies: parseInt(lostCopies) || 0,
        damagedCopies: parseInt(damagedCopies) || 0,
      });

      if (res.success) {
        setToast({ type: 'success', message: 'Inventory copy status updated successfully!' });
        setSelectedBookForCopy(null);
        fetchReports();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to update copy status' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-600" /> Management Reports & Inventory Health
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Analyze circulation metrics, overdue items, and physical copy health
          </p>
        </div>

        <button
          onClick={handleGenerateOverdueNotifications}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <BellRing className="w-4 h-4" /> Trigger Overdue Reminders Batch
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveReportTab('inventory')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeReportTab === 'inventory'
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Inventory Health ({inventory.length})
        </button>
        <button
          onClick={() => setActiveReportTab('overdue')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeReportTab === 'overdue'
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Overdue Books ({overdueList.length})
        </button>
        <button
          onClick={() => setActiveReportTab('most_borrowed')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeReportTab === 'most_borrowed'
              ? 'bg-white text-brand-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Most Borrowed Books
        </button>
      </div>

      {/* Report Tab Views */}
      {activeReportTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-600" /> Book Inventory & Copy Status Breakdown
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                  <th className="pb-3 px-3">Title</th>
                  <th className="pb-3 px-3">ISBN</th>
                  <th className="pb-3 px-3">Total Copies</th>
                  <th className="pb-3 px-3">Available</th>
                  <th className="pb-3 px-3">Lost Copies</th>
                  <th className="pb-3 px-3">Damaged Copies</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map((book) => (
                  <tr key={book._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-slate-900">{book.title}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-500">{book.isbn}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-800">{book.totalCopies}</td>
                    <td className="py-3.5 px-3 font-bold text-emerald-600">{book.availableCopies}</td>
                    <td className="py-3.5 px-3 font-bold text-rose-600">{book.lostCopies || 0}</td>
                    <td className="py-3.5 px-3 font-bold text-amber-600">{book.damagedCopies || 0}</td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedBookForCopy(book);
                          setLostCopies(book.lostCopies || 0);
                          setDamagedCopies(book.damagedCopies || 0);
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1 ml-auto"
                      >
                        <Edit className="w-3.5 h-3.5" /> Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReportTab === 'overdue' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" /> Overdue Books & Fine Accumulation
          </h3>

          {overdueList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No overdue transactions found!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                    <th className="pb-3 px-3">Book Title</th>
                    <th className="pb-3 px-3">Member Name</th>
                    <th className="pb-3 px-3">Issue Date</th>
                    <th className="pb-3 px-3">Due Date</th>
                    <th className="pb-3 px-3">Fine Accumulated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overdueList.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 font-semibold text-slate-900">
                        {tx.bookId?.title || tx.bookTitle || 'Book'}
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 font-medium">
                        {tx.memberId?.name || tx.memberName || 'Member'}
                        <span className="block text-[10px] text-slate-400">
                          {tx.memberId?.email || tx.memberId?.membershipId}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500">
                        {new Date(tx.issueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-3 text-rose-600 font-semibold">
                        {new Date(tx.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-rose-600">
                        ${tx.fine || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeReportTab === 'most_borrowed' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" /> Popular Books by Borrow Count
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                  <th className="pb-3 px-3">Rank</th>
                  <th className="pb-3 px-3">Book Title</th>
                  <th className="pb-3 px-3">Author</th>
                  <th className="pb-3 px-3">Category</th>
                  <th className="pb-3 px-3">Total Times Borrowed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mostBorrowed.map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-400">#{idx + 1}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">{item.title || item._id?.title || 'Book'}</td>
                    <td className="py-3.5 px-3 text-slate-600">{item.author || item._id?.author || 'Author'}</td>
                    <td className="py-3.5 px-3 text-slate-500">{item.category || item._id?.category || '-'}</td>
                    <td className="py-3.5 px-3 font-bold text-brand-600 text-sm">{item.count || item.borrowCount || 1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for updating copy status */}
      {selectedBookForCopy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Update Inventory Copy Status</h3>

            <form onSubmit={handleUpdateCopyStatus} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <div className="font-bold text-slate-800">{selectedBookForCopy.title}</div>
                <div className="text-slate-500">Total Copies: {selectedBookForCopy.totalCopies}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Lost Copies
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={lostCopies}
                    onChange={(e) => setLostCopies(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Damaged Copies
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={damagedCopies}
                    onChange={(e) => setDamagedCopies(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedBookForCopy(null)}
                  className="px-4 py-2 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
