import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { BookDetailModal } from './BookDetailModal';
import { Search, Plus, BookOpen, Filter, CheckCircle2, AlertCircle, BookmarkPlus } from 'lucide-react';

export const BookCatalog = ({ setToast }) => {
  const { isLibrarian, isMember } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Computer Science',
    description: '',
    totalCopies: 3,
  });

  const categories = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Artificial Intelligence',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Literature',
    'General',
  ];

  const fetchBooks = async () => {
    setLoading(true);
    try {
      let res;
      if (searchQuery || selectedCategory || availableOnly) {
        const params = {};
        if (searchQuery) params.q = searchQuery;
        if (selectedCategory) params.category = selectedCategory;
        if (availableOnly) params.available = 'true';
        res = await api.searchBooks(params);
      } else {
        res = await api.getBooks({ limit: 50 });
      }

      if (res.success) {
        const bookList = Array.isArray(res.data) ? res.data : (res.data?.books || []);
        setBooks(bookList);
      } else {
        setBooks([]);
      }
    } catch (err) {
      console.error('Error fetching catalog:', err);
      setToast({ type: 'error', message: err.message || 'Failed to load catalog' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, availableOnly]);

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addBook(newBook);
      if (res.success) {
        setToast({ type: 'success', message: 'Book added to catalog!' });
        setShowAddModal(false);
        setNewBook({
          title: '',
          author: '',
          isbn: '',
          category: 'Computer Science',
          description: '',
          totalCopies: 3,
        });
        fetchBooks();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to add book' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-600" /> Book Catalog
          </h2>
          <p className="text-xs text-slate-500 mt-1">Browse, search, and reserve library books</p>
        </div>

        {isLibrarian && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-brand-500/20 flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add New Book
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none bg-slate-50 px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
            Available Only
          </label>
        </div>
      </div>

      {/* Book Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading catalog...</div>
      ) : books.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-700">No books found</h3>
          <p className="text-xs text-slate-400">Try adjusting your search query or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {books.map((book) => (
            <div
              key={book._id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {book.category}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full flex items-center gap-1 ${
                      book.availableCopies > 0
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {book.availableCopies > 0 ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {book.availableCopies} available
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        Out of stock
                      </>
                    )}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">by {book.author}</p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl">
                  {book.description || 'No description available for this catalog item.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">ISBN: {book.isbn}</span>
                <button
                  onClick={() => setSelectedBook(book)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book Details Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onRefresh={fetchBooks}
          setToast={setToast}
        />
      )}

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-600" /> Add New Book to Catalog
            </h3>

            <form onSubmit={handleAddBook} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Title</label>
                <input
                  type="text"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  placeholder="e.g. Clean Code"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Author</label>
                  <input
                    type="text"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    placeholder="e.g. Robert C. Martin"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={newBook.category}
                    onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">ISBN</label>
                  <input
                    type="text"
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                    placeholder="978-0132350884"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Total Copies</label>
                  <input
                    type="number"
                    min="1"
                    value={newBook.totalCopies}
                    onChange={(e) => setNewBook({ ...newBook, totalCopies: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  value={newBook.description}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  placeholder="Brief synopsis of the book..."
                  rows="3"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-brand-500/20"
                >
                  Add Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
