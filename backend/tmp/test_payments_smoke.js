const request = require('supertest');
const app = require('../src/index');
const { db, clear, seed } = require('../src/db/inmemory');
const { createAccessToken } = require('../src/middleware/auth');
(async () => {
  try {
    clear(); seed();
    db.cartItems.push({ id: 'cart-1', user_id: 'user-1', product_id: 'prod-1', quantity: 1 });
    const token = createAccessToken({ user_id: 'user-1' });
    console.log('token len', token.length);
    const res = await request(app).post('/api/payments/bkash/create-payment').set('Authorization', `Bearer ${token}`).timeout({ response: 5000, deadline: 10000 });
    console.log('create status', res.statusCode, res.body);
    const { order_id, merchant_invoice } = res.body;
    const payload = { event: 'payment.success', paymentID: `mock_${Math.random().toString(36).slice(2)}`, merchantInvoiceNumber: merchant_invoice, status: 'success' };
    const r2 = await request(app).post('/api/payments/bkash/webhook').send(payload).timeout({ response: 5000, deadline: 10000 });
    console.log('webhook status', r2.statusCode);
    const r3 = await request(app).get('/api/orders').set('Authorization', `Bearer ${token}`);
    console.log('orders', r3.body);
  } catch (e) {
    console.error('ERROR', e && e.message ? e.message : e);
  }
  process.exit(0);
})();