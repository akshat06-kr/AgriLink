import api from './api';

// ── Dashboard ──────────────────────────────────────────────────────────────
export const fetchDashboard = () => api.get('/farmers/me/dashboard');

// ── Profile ────────────────────────────────────────────────────────────────
export const fetchProfile = () => api.get('/farmers/me/profile');
export const updateProfile = (data) => api.patch('/farmers/me/profile', data);

// ── Products ───────────────────────────────────────────────────────────────
export const fetchMyProducts = () => api.get('/products/farmer');
export const createProduct = (data) => api.post('/products/', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const updateStock = (id, quantity) => api.patch(`/products/${id}/stock`, null, { params: { quantity } });

// ── Orders ─────────────────────────────────────────────────────────────────
export const fetchFarmerOrders = () => api.get('/orders/farmer');
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, null, { params: { status } });

// ── Expenses ───────────────────────────────────────────────────────────────
export const fetchExpenses = (month, year) => {
  const params = {};
  if (month) params.month = month;
  if (year) params.year = year;
  return api.get('/expenses/', { params });
};
export const createExpense = (data) => api.post('/expenses/', data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
export const fetchExpenseSummary = () => api.get('/expenses/summary');

// ── Notifications ──────────────────────────────────────────────────────────
export const fetchNotifications = () => api.get('/notifications/');
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/read-all');

// ── Reports ────────────────────────────────────────────────────────────────
export const downloadPDF = () =>
  api.get('/reports/pdf', { responseType: 'blob' });

export const downloadCSV = () =>
  api.get('/reports/csv', { responseType: 'blob' });

// ── Helpers ────────────────────────────────────────────────────────────────
export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export const formatPct = (pct) => {
  const n = Number(pct) || 0;
  const sign = n >= 0 ? '↑' : '↓';
  return `${sign} ${Math.abs(n).toFixed(1)}%`;
};
