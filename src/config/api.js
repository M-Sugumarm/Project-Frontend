// Centralized API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// API endpoints
export const API_ENDPOINTS = {
    // Products
    products: `${API_BASE_URL}/products`,
    productById: (id) => `${API_BASE_URL}/products/${id}`,
    featuredProducts: `${API_BASE_URL}/products/featured`,
    upcomingProducts: `${API_BASE_URL}/products/upcoming`,
    searchProducts: (query) => `${API_BASE_URL}/products/search?q=${query}`,

    // Categories
    categories: `${API_BASE_URL}/categories`,
    categoryById: (id) => `${API_BASE_URL}/categories/${id}`,

    // Orders
    orders: `${API_BASE_URL}/orders`,
    orderById: (id) => `${API_BASE_URL}/orders/${id}`,
    userOrders: (userId) => `${API_BASE_URL}/orders/user/${userId}`,

    // Cart
    cart: (userId) => `${API_BASE_URL}/cart/${userId}`,
    addToCart: `${API_BASE_URL}/cart/add`,

    // Wishlist
    wishlist: (userId) => `${API_BASE_URL}/wishlist/${userId}`,
    addToWishlist: `${API_BASE_URL}/wishlist/add`,

    // Users
    users: `${API_BASE_URL}/users`,
    userById: (id) => `${API_BASE_URL}/users/${id}`,

    // Broadcast
    broadcast: `${API_BASE_URL}/subscribe/broadcast`,
};

// Helper function for API calls
export const apiCall = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
};

export default API_BASE_URL;
