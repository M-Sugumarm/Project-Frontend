import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://project-backend-x4r5.onrender.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Products API
export const productsApi = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    getFeatured: () => api.get('/products/featured'),
    getUpcoming: () => api.get('/products/upcoming'),
    getByCategory: (categoryId) => api.get(`/products/category/${categoryId}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
};

// Categories API
export const categoriesApi = {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
};

// Reviews API
export const reviewsApi = {
    getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
    addReview: (data) => api.post('/reviews', data),
};

// Bundles API
export const bundlesApi = {
    getAll: () => api.get('/bundles'),
    getById: (id) => api.get(`/bundles/${id}`),
    create: (data) => api.post('/bundles', data),
    update: (id, data) => api.put(`/bundles/${id}`, data),
    delete: (id) => api.delete(`/bundles/${id}`),
};

// Cart API
export const cartApi = {
    get: () => api.get('/cart'),
    add: (productId, quantity) => api.post('/cart/add', { productId, quantity }),
    update: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
    remove: (itemId) => api.delete(`/cart/${itemId}`),
    clear: () => api.delete('/cart'),
};

// Orders API
export const ordersApi = {
    getAll: () => api.get('/orders'),
    getById: (id) => api.get(`/orders/${id}`),
    create: (data) => api.post('/orders', data),
    updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
    getAllAdmin: () => api.get('/orders/admin'),
};

// Payments API
export const paymentsApi = {
    createIntent: (amount) => api.post('/payment/create-intent', { amount }),
    confirm: (paymentIntentId) => api.post('/payment/confirm', { paymentIntentId }),
};

// Analytics API
export const analyticsApi = {
    getOverview: () => api.get('/analytics/overview'),
    getSales: (period) => api.get('/analytics/sales', { params: { period } }),
    getTopProducts: () => api.get('/analytics/top-products'),
    getRevenueChart: () => api.get('/analytics/revenue-chart'),
};

// User API
export const userApi = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    getAll: () => api.get('/users'),
};

// Broadcast API
export const broadcastApi = {
    send: (data) => api.post('/subscribe/broadcast', data),
};

export default api;
