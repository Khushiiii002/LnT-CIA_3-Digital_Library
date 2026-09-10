import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { BookOpen, X, Edit3, Trash2, CheckCircle, Clock } from 'lucide-react';

export const BookDetailModal = ({ book, onClose, onRefresh, setToast }) => {
  const { user, isMember, isLibrarian } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: book?.title || '',
    author: book?.author || '',
    isbn: book?.isbn || '',
    category: book?.category || '',
    description: book?.description || '',
    totalCopies: book?.totalCopies || 1,
    availableCopies: book?.availableCopies || 1,
  });
  const [loading, setLoading] = useState(false);

  if (!book) return null;

  const handlePlaceHold = async () => {
    setLoading(true);
    try {
      const res = await api.placeHold({ bookId: book._id });
      if (res.success) {
        setToast({ type: 'success', message: 'Hold placed successfully!' });
        onRefresh();
        onClose();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to place hold' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.updateBook(book._id, formData);
      if (res.success) {
        setToast({ type: 'success', message: 'Book details updated!' });
        onRefresh();
        setIsEditing(false);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to update book' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!window.confirm(`Are you sure you want to delete "${book.title}"?`)) return;
    setLoading(true);
    try {
      await api.deleteBook(book._id);
      setToast({ type: 'success', message: 'Book deleted successfully' });
      onRefresh();
      onClose();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete book' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isEditing ? (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-4 bg-brand-50 text-brand-600 rounded-2xl shrink-0">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1 pr-6">
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {book.category}
                </span>
                <h2 className="text-xl font-bold text-slate-900 leading-snug">{book.title}</h2>
                <p className="text-sm text-slate-600 font-medium">by {book.author}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-semibold">ISBN</span>
                <p className="font-mono text-slate-700 font-semibold mt-0.5">{book.isbn}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-semibold">Availability</span>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${book.availableCopies > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="font-semibold text-slate-800">
                    {book.availableCopies} of {book.totalCopies} copies available
                  </span>
                </div>
              </div>
            </div>

            {book.description && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Description
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  {book.description}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              {isLibrarian && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={handleDeleteBook}
                    className="px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </>
              )}

              {isMember && (
                <button
                  onClick={handlePlaceHold}
                  disabled={loading}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Clock className="w-4 h-4" /> Reserve / Place Hold
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateBook} className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Book Details</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Author</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">ISBN</label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Total Copies</label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalCopies}
                  onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
