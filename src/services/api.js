const TOKEN_STORAGE_KEY = 'aura_auth_token';

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota / SSR errors
  }
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  const resolvedToken = token ?? getAuthToken();
  if (resolvedToken) {
    headers.Authorization = `Bearer ${resolvedToken}`;
  }

  let payload;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const response = await fetch(path, { method, headers, body: payload });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || `Request failed (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const authApi = {
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
  googleSignIn: (payload) => request('/api/auth/google', { method: 'POST', body: payload }),
  me: () => request('/api/auth/me'),
  updateProfile: (payload) => request('/api/auth/profile', { method: 'PUT', body: payload }),
  forgotPassword: (email) => request('/api/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (payload) => request('/api/auth/reset-password', { method: 'POST', body: payload }),
  getAddresses: () => request('/api/addresses'),
  addAddress: (payload) => request('/api/addresses', { method: 'POST', body: payload }),
  updateAddress: (id, payload) => request(`/api/addresses/${id}`, { method: 'PUT', body: payload }),
  deleteAddress: (id) => request(`/api/addresses/${id}`, { method: 'DELETE' })
};

export const storefrontApi = {
  getSettings: () => request('/api/settings'),
  getCategories: () => request('/api/categories'),
  getProducts: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    });
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return request(`/api/products${suffix}`);
  },
  getProductDetail: (idOrSlug) => request(`/api/products/${encodeURIComponent(idOrSlug)}`),
  submitReview: (idOrSlug, payload) =>
    request(`/api/products/${encodeURIComponent(idOrSlug)}/reviews`, { method: 'POST', body: payload }),
  getCustomConfig: () => request('/api/custom-orders/config'),
  uploadCustomReference: (file) => {
    const form = new FormData();
    form.append('image', file);
    return request('/api/upload/custom-reference', { method: 'POST', body: form });
  },
  submitCustomOrder: (payload) => request('/api/custom-orders', { method: 'POST', body: payload }),
  getMyCustomOrders: () => request('/api/custom-orders/my'),
  trackCustomOrder: (code) => request(`/api/custom-orders/track/${encodeURIComponent(code)}`),
  validateCoupon: (code, subtotal, shippingFee = 0) =>
    request(
      `/api/coupons/validate?code=${encodeURIComponent(code)}&subtotal=${Number(subtotal || 0)}&shippingFee=${Number(shippingFee || 0)}`
    ),
  previewOrderTotals: (payload) => request('/api/orders/preview', { method: 'POST', body: payload }),
  createRazorpayOrder: (payload) => request('/api/payments/razorpay/order', { method: 'POST', body: payload }),
  placeOrder: (payload) => request('/api/orders', { method: 'POST', body: payload }),
  getMyOrders: () => request('/api/orders/my'),
  trackOrder: (orderNumber) => request(`/api/orders/track/${encodeURIComponent(orderNumber)}`),
  subscribeNewsletter: (email, source = 'newsletter') =>
    request('/api/subscribers', { method: 'POST', body: { email, source } }),
  submitContact: (payload) => request('/api/contact', { method: 'POST', body: payload })
};

export const adminApi = {
  getDashboard: () => request('/api/admin/dashboard'),
  uploadProductImages: (files) => {
    const form = new FormData();
    Array.from(files).forEach((f) => form.append('images', f));
    return request('/api/upload/products', { method: 'POST', body: form });
  },
  getAllProducts: () => request('/api/products?includeInactive=true'),
  createProduct: (payload) => request('/api/admin/products', { method: 'POST', body: payload }),
  updateProduct: (id, payload) => request(`/api/admin/products/${id}`, { method: 'PUT', body: payload }),
  deleteProduct: (id) => request(`/api/admin/products/${id}`, { method: 'DELETE' }),

  getCategories: () => request('/api/admin/categories'),
  createCategory: (payload) => request('/api/admin/categories', { method: 'POST', body: payload }),
  updateCategory: (id, payload) => request(`/api/admin/categories/${id}`, { method: 'PUT', body: payload }),
  deleteCategory: (id) => request(`/api/admin/categories/${id}`, { method: 'DELETE' }),

  getOrders: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v && v !== 'All') qs.set(k, String(v));
    });
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return request(`/api/admin/orders${suffix}`);
  },
  updateOrder: (id, payload) => request(`/api/admin/orders/${id}`, { method: 'PUT', body: payload }),

  getCustomOrders: (status) =>
    request(`/api/admin/custom-orders${status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : ''}`),
  updateCustomOrder: (id, payload) => request(`/api/admin/custom-orders/${id}`, { method: 'PUT', body: payload }),

  getCustomOptions: () => request('/api/admin/custom-options'),
  createCustomOption: (payload) => request('/api/admin/custom-options', { method: 'POST', body: payload }),
  updateCustomOption: (id, payload) => request(`/api/admin/custom-options/${id}`, { method: 'PUT', body: payload }),
  deleteCustomOption: (id) => request(`/api/admin/custom-options/${id}`, { method: 'DELETE' }),

  getCoupons: () => request('/api/admin/coupons'),
  createCoupon: (payload) => request('/api/admin/coupons', { method: 'POST', body: payload }),
  updateCoupon: (id, payload) => request(`/api/admin/coupons/${id}`, { method: 'PUT', body: payload }),
  deleteCoupon: (id) => request(`/api/admin/coupons/${id}`, { method: 'DELETE' }),

  updateSettings: (settings) => request('/api/admin/settings', { method: 'PUT', body: { settings } }),

  getReviews: () => request('/api/admin/reviews'),
  toggleReviewApproval: (id, isApproved) =>
    request(`/api/admin/reviews/${id}`, { method: 'PUT', body: { isApproved } }),
  deleteReview: (id) => request(`/api/admin/reviews/${id}`, { method: 'DELETE' }),

  getSubscribers: () => request('/api/admin/subscribers'),
  broadcastNewsletter: (payload) =>
    request('/api/admin/subscribers/broadcast', { method: 'POST', body: payload }),

  getInquiries: () => request('/api/admin/inquiries'),
  updateInquiry: (id, payload) => request(`/api/admin/inquiries/${id}`, { method: 'PUT', body: payload })
};
