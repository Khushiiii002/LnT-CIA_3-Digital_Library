import React, { useState, useEffect } from 'react';
import { api, extractArray } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Clock, CheckCircle2, XCircle, User, BookOpen } from 'lucide-react';

export const HoldsManagement = ({ setToast }) => {
  const { isLibrarian, user } = useAuth();
  const [holds, setHolds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHolds = async () => {
    setLoading(true);
    try {
      let res;
      if (isLibrarian) {
        res = await api.getAllHolds();
      } else {
        res = await api.getMemberHolds(user._id || user.id);
      }
      setHolds(extractArray(res, 'holds'));
    } catch (err) {
      console.error('Failed to load holds:', err);
      setToast({ type: 'error', message: err.message || 'Failed to fetch hold requests' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolds();
    const interval = setInterval(fetchHolds, 5000);
    return () => clearInterval(interval);
  }, [isLibrarian, user]);

  const handleCancelHold = async (holdId) => {
    try {
      const res = await api.cancelHold(holdId);
      if (res.success) {
        setToast({ type: 'success', message: 'Hold reservation cancelled.' });
        fetchHolds();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to cancel hold' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-purple-600" /> Book Reservation & Hold Queue
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isLibrarian ? 'Manage member reservation queues across catalog items' : 'Track your active hold requests'}
          </p>
        </div>

        <span className="px-3 py-1 bg-purple-50 text-purple-700 font-bold text-xs rounded-full border border-purple-100">
          {holds.length} Total Holds
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading hold queue...</div>
        ) : holds.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No reservations in queue.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                  <th className="pb-3 px-3">Book Title</th>
                  <th className="pb-3 px-3">Member</th>
                  <th className="pb-3 px-3">Requested At</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {holds.map((hold) => (
                  <tr key={hold._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-slate-900">
                      {hold.bookId?.title || 'Book Title'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 font-medium">
                      {hold.memberId?.name || 'Member'}
                      <span className="block text-[10px] text-slate-400">
                        {hold.memberId?.email || hold.memberId?.membershipId}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">
                      {new Date(hold.requestedAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-0.5 font-semibold rounded-full capitalize ${
                          hold.status === 'fulfilled'
                            ? 'bg-emerald-100 text-emerald-700'
                            : hold.status === 'cancelled'
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {hold.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {hold.status === 'pending' && (
                        <button
                          onClick={() => handleCancelHold(hold._id)}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-xs border border-rose-200 transition-colors"
                        >
                          Cancel Hold
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
    </div>
  );
};
