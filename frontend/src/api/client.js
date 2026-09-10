const BASE_URL = '/api';

export const getAuthToken = () => localStorage.getItem('library_token');

export const extractArray = (res, key) => {
  if (!res || !res.success) return [];
  if (Array.isArray(res.data)) return res.data;
  if (res.data && key && Array.isArray(res.data[key])) return res.data[key];
  if (key && Array.isArray(res[key])) return res[key];
  return [];
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, config);
  } catch (netErr) {
    const error = new Error("Cannot connect to backend server. Please make sure the backend ('npm start' or 'node server.js') is running on port 5000.");
    error.status = 0;
    throw error;
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = { success: false, message: 'Server returned an invalid JSON response' };
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('library_token');
      localStorage.removeItem('library_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    const errorMessage = data.message || data.error || (data.errors && data.errors[0]?.msg) || `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// API Services mapping
export const api = {
  // Auth
  login: (credentials) => apiFetch('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => apiFetch('/auth/register', { method: 'POST', body: userData }),
  getProfile: () => apiFetch('/auth/profile'),
  getUsers: () => apiFetch('/auth/users?limit=100'),
  deactivateUser: (userId) => apiFetch(`/auth/users/${userId}/deactivate`, { method: 'PUT' }),
  createLibrarian: (data) => apiFetch('/auth/librarian', { method: 'POST', body: data }),

  // Books
  getBooks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/books${query ? `?${query}` : ''}`);
  },
  searchBooks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/books/search${query ? `?${query}` : ''}`);
  },
  getBookById: (id) => apiFetch(`/books/${id}`),
  addBook: (bookData) => apiFetch('/books', { method: 'POST', body: bookData }),
  updateBook: (id, bookData) => apiFetch(`/books/${id}`, { method: 'PUT', body: bookData }),
  deleteBook: (id) => apiFetch(`/books/${id}`, { method: 'DELETE' }),

  // Transactions
  issueBook: (data) => apiFetch('/transactions/issue', { method: 'POST', body: data }),
  returnBook: (transactionId) => apiFetch(`/transactions/${transactionId}/return`, { method: 'PUT' }),
  getMemberTransactions: (memberId) => apiFetch(`/transactions/member/${memberId}`),
  getAllTransactions: () => apiFetch('/transactions'),

  // Holds / Reservations
  placeHold: (data) => apiFetch('/holds', { method: 'POST', body: data }),
  cancelHold: (holdId) => apiFetch(`/holds/${holdId}/cancel`, { method: 'PUT' }),
  getMemberHolds: (memberId) => apiFetch(`/holds/member/${memberId}`),
  getBookHolds: (bookId) => apiFetch(`/holds/book/${bookId}`),
  getAllHolds: () => apiFetch('/holds'),

  // Fines
  issueFine: (data) => apiFetch('/fines/issue', { method: 'POST', body: data }),
  payFine: (data) => apiFetch('/fines/pay', { method: 'POST', body: data }),
  waiveFine: (data) => apiFetch('/fines/waive', { method: 'POST', body: data }),
  getMemberFines: (memberId) => apiFetch(`/fines/member/${memberId}`),
  getAllFines: () => apiFetch('/fines'),

  // Notifications
  generateOverdueNotifications: () => apiFetch('/notifications/generate-overdue', { method: 'POST' }),
  getMemberNotifications: (memberId) => apiFetch(`/notifications/member/${memberId}`),
  markNotificationRead: (id) => apiFetch(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => apiFetch('/notifications/read-all', { method: 'PUT' }),

  // Memberships
  getMembershipPlans: () => apiFetch('/memberships'),
  createMembershipPlan: (data) => apiFetch('/memberships', { method: 'POST', body: data }),
  updateMembershipPlan: (id, data) => apiFetch(`/memberships/${id}`, { method: 'PUT', body: data }),
  deleteMembershipPlan: (id) => apiFetch(`/memberships/${id}`, { method: 'DELETE' }),

  // Reports
  getOverdueReport: () => apiFetch('/admin/reports/overdue'),
  getMostBorrowedReport: () => apiFetch('/admin/reports/most-borrowed'),
  getInventoryReport: () => apiFetch('/admin/reports/inventory'),
  updateCopyStatus: (bookId, data) => apiFetch(`/admin/reports/inventory/${bookId}/copy-status`, { method: 'PUT', body: data }),
};
