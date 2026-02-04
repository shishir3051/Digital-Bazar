import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const productService = {
  getProducts: (category) => api.get('/products', { params: { category } }),
  getProduct: (id) => api.get(`/products/${id}`),
};

export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart/add', data),
  removeFromCart: (id) => api.delete(`/cart/${id}`),
  clearCart: () => api.delete('/cart'),
};

export const orderService = {
  createOrder: (data) => api.post('/orders', data),
  getOrders: () => api.get('/orders'),
};

export const wishlistService = {
  getWishlist: () => api.get('/wishlist'),
  toggleWishlist: (data) => api.post('/wishlist/toggle', data),
  removeFromWishlist: (id) => api.delete(`/wishlist/${id}`),
};

export const paymentsService = {
  getExchangeRate: () => api.get('/payments/exchange-rate'),
  bkashCreatePayment: () => api.post('/payments/bkash/create-payment'),
  bkashExecutePayment: (data) => api.post('/payments/bkash/execute-payment', data),
};

export default api;
