const express = require('express');
const router = express.Router();
const adapter = require('../db/adapter');
const { authMiddleware } = require('../middleware/auth');

// simple admin check middleware
function adminOnly(req, res, next) {
  if (!req.user || !req.user.is_admin) return res.status(403).json({ detail: 'Admin access required' });
  next();
}

// List all orders
router.get('/orders', authMiddleware, adminOnly, async (req, res) => {
  const orders = await adapter.getAllOrders();
  res.json(orders);
});

// Update order status
router.put('/orders/:order_id/status', authMiddleware, adminOnly, async (req, res) => {
  const orderId = req.params.order_id;
  const { status } = req.body;
  if (!status) return res.status(400).json({ detail: 'Missing status' });
  const ok = await adapter.updateOrderById(orderId, { status });
  if (!ok) return res.status(404).json({ detail: 'Order not found' });
  res.json({ message: 'Order status updated' });
});

// Create a product
router.post('/products', authMiddleware, adminOnly, async (req, res) => {
  const p = req.body;
  if (!p.name || typeof p.price === 'undefined') return res.status(400).json({ detail: 'Missing product name or price' });
  const prod = await adapter.insertProduct(p);
  res.json(prod);
});

// Initialize sample products if none exist
router.post('/init-products', authMiddleware, adminOnly, async (req, res) => {
  const count = await adapter.countProducts();
  if (count > 0) return res.json({ message: 'Products already initialized' });

  const sample = [
    { name: 'Wireless Headphones', description: 'High-quality wireless headphones with noise cancellation', price: 199.99, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661', stock: 50 },
    { name: 'Smart Circuit Board', description: 'Advanced circuit board for electronics projects', price: 89.99, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1562408590-e32931084e23', stock: 25 },
    { name: 'Colorful T-Shirt Collection', description: 'Premium cotton t-shirts in various colors', price: 29.99, category: 'Clothing', image_url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68', stock: 100 }
  ];

  const inserted = await adapter.insertProducts(sample);
  res.json({ message: `Initialized ${inserted.length} sample products` });
});

module.exports = router;