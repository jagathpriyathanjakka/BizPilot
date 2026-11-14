const BASE_URL = '/api';

export function getToken() {
  return localStorage.getItem('bizpilot_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('bizpilot_token', token);
  } else {
    localStorage.removeItem('bizpilot_token');
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth
  signInWithGoogle: (payload) => apiRequest('/auth/google', { method: 'POST', body: JSON.stringify(payload) }),
  requestCode: (payload) => apiRequest('/auth/request-code', { method: 'POST', body: JSON.stringify(payload) }),
  signUp: (payload) => apiRequest('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  verifyEmail: (payload) => apiRequest('/auth/verify', { method: 'POST', body: JSON.stringify(payload) }),
  resendVerificationCode: (payload) => apiRequest('/auth/resend-code', { method: 'POST', body: JSON.stringify(payload) }),
  signIn: (payload) => apiRequest('/auth/signin', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => apiRequest('/auth/me'),

  // Onboarding
  getCategories: () => apiRequest('/onboarding/categories'),
  completeOnboarding: (payload) => apiRequest('/onboarding', { method: 'POST', body: JSON.stringify(payload) }),

  // Business
  getBusinesses: () => apiRequest('/business'),
  switchBusiness: (businessId) => apiRequest('/business/switch', { method: 'POST', body: JSON.stringify({ businessId }) }),

  // Dashboard
  getDashboard: (businessId) => apiRequest(`/dashboard${businessId ? `?businessId=${businessId}` : ''}`),

  // Products
  getProducts: (businessId, query = {}) => {
    const params = new URLSearchParams({ ...(businessId ? { businessId } : {}), ...query });
    return apiRequest(`/products?${params.toString()}`);
  },
  createProduct: (payload) => apiRequest('/products', { method: 'POST', body: JSON.stringify(payload) }),
  updateProduct: (id, payload) => apiRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteProduct: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' }),

  // Sales
  getSales: (businessId) => apiRequest(`/sales${businessId ? `?businessId=${businessId}` : ''}`),
  createSale: (payload) => apiRequest('/sales', { method: 'POST', body: JSON.stringify(payload) }),

  // Customers
  getCustomers: (businessId) => apiRequest(`/customers${businessId ? `?businessId=${businessId}` : ''}`),
  createCustomer: (payload) => apiRequest('/customers', { method: 'POST', body: JSON.stringify(payload) }),

  // Suppliers
  getSuppliers: (businessId) => apiRequest(`/suppliers${businessId ? `?businessId=${businessId}` : ''}`),
  createSupplier: (payload) => apiRequest('/suppliers', { method: 'POST', body: JSON.stringify(payload) }),

  // Expenses
  getExpenses: (businessId) => apiRequest(`/expenses${businessId ? `?businessId=${businessId}` : ''}`),
  createExpense: (payload) => apiRequest('/expenses', { method: 'POST', body: JSON.stringify(payload) }),

  // Staff
  getStaff: (businessId) => apiRequest(`/staff${businessId ? `?businessId=${businessId}` : ''}`),
  createStaff: (payload) => apiRequest('/staff', { method: 'POST', body: JSON.stringify(payload) }),

  // Reports
  getReports: (businessId, query = {}) => {
    const params = new URLSearchParams({ ...(businessId ? { businessId } : {}), ...query });
    return apiRequest(`/reports?${params.toString()}`);
  },

  // AI & Approvals
  queryAI: (query, businessId) => apiRequest('/ai/query', { method: 'POST', body: JSON.stringify({ query, businessId }) }),
  getAITasks: (businessId) => apiRequest(`/ai/tasks${businessId ? `?businessId=${businessId}` : ''}`),
  getApprovals: (businessId, status) => {
    const params = new URLSearchParams({ ...(businessId ? { businessId } : {}), ...(status ? { status } : {}) });
    return apiRequest(`/approvals?${params.toString()}`);
  },
  resolveApproval: (id, action) => apiRequest(`/approvals/${id}/resolve`, { method: 'POST', body: JSON.stringify({ action }) }),

  // Specialized operations
  getOrders: (businessId) => apiRequest(`/orders${businessId ? `?businessId=${businessId}` : ''}`),
  updateOrderStatus: (id, status, isPaid) => apiRequest(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, isPaid }) }),
  getAppointments: (businessId) => apiRequest(`/appointments${businessId ? `?businessId=${businessId}` : ''}`),
  getRepairs: (businessId) => apiRequest(`/repairs${businessId ? `?businessId=${businessId}` : ''}`),

  // Demo Switcher
  switchCategoryDemo: (category) => apiRequest('/demo/seed', { method: 'POST', body: JSON.stringify({ category }) }),

  // Audit
  getAuditLogs: (businessId) => apiRequest(`/audit${businessId ? `?businessId=${businessId}` : ''}`),
};
