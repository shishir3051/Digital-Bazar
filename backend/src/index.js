require('dotenv').config();
const express = require('express');
const bodyParser = require('express').json;
const products = require('./routes/products');
const cart = require('./routes/cart');
const orders = require('./routes/orders');
const payments = require('./routes/payments');
const auth = require('./routes/auth');
const admin = require('./routes/admin');
const wishlist = require('./routes/wishlist');
const { seed } = require('./db/inmemory');
const { authMiddleware } = require('./middleware/auth');

const app = express();
app.use(bodyParser());

// seed data
seed();

app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'Digital Bazar Node API' }));

app.use('/api/auth', auth);
app.use('/api/products', products);
app.use('/api/cart', authMiddleware, cart);
app.use('/api/orders', authMiddleware, orders);
// Mount payments without global auth; individual payment routes protect themselves where needed
app.use('/api/payments', payments);
app.use('/api/admin', admin);
app.use('/api/wishlist', wishlist);

// Export app for testing
module.exports = app;

// Start server if invoked directly
if (require.main === module) {
  const port = process.env.PORT || 8000;
  app.listen(port, () => console.log(`Backend listening on http://localhost:${port}`));
}
