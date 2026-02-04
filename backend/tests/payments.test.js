const request = require('supertest');
const app = require('../src/index');
const { db, clear, seed } = require('../src/db/inmemory');
const { createAccessToken } = require('../src/middleware/auth');

describe('bKash payment flow', () => {
  beforeEach(() => {
    clear();
    seed();
  });

  test('create and execute payment flow', async () => {
    // Add cart item
    db.cartItems.push({ id: 'cart-1', user_id: 'user-1', product_id: 'prod-1', quantity: 2 });

    const token = createAccessToken({ user_id: 'user-1' });

    const res = await request(app).post('/api/payments/bkash/create-payment').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    const { order_id } = res.body;
    expect(order_id).toBeDefined();

    // verify order saved pending
    const r2 = await request(app).get('/api/orders').set('Authorization', `Bearer ${token}`);
    expect(r2.statusCode).toBe(200);
    const orders = r2.body;
    const found = orders.find(o => o.id === order_id);
    expect(found).toBeDefined();
    expect(found.status).toBe('pending');

    // execute payment
    const payload = { paymentId: `mock_${Math.random().toString(36).slice(2)}`, payerReference: 'PR-1', orderId: order_id };
    const r3 = await request(app).post('/api/payments/bkash/execute-payment').set('Authorization', `Bearer ${token}`).send(payload);
    expect(r3.statusCode).toBe(200);
    expect(r3.body.order_id).toBe(order_id);

    // after execution, order should be paid
    const r4 = await request(app).get('/api/orders').set('Authorization', `Bearer ${token}`);
    const orders2 = r4.body;
    const found2 = orders2.find(o => o.id === order_id);
    expect(found2.status).toBe('paid');

    // cart should be cleared
    const r5 = await request(app).get('/api/cart').set('Authorization', `Bearer ${token}`);
    expect(r5.statusCode).toBe(200);
    expect(r5.body.length).toBe(0);
  });

  test('webhook marks order paid', async () => {
    // Add cart and create payment
    db.cartItems.push({ id: 'cart-1', user_id: 'user-1', product_id: 'prod-1', quantity: 1 });
    const token = createAccessToken({ user_id: 'user-1' });
    const res = await request(app).post('/api/payments/bkash/create-payment').set('Authorization', `Bearer ${token}`);
    const { order_id, merchant_invoice } = res.body;

    const payload = { event: 'payment.success', paymentID: `mock_${Math.random().toString(36).slice(2)}`, merchantInvoiceNumber: merchant_invoice, status: 'success' };
    const r2 = await request(app).post('/api/payments/bkash/webhook').send(payload);
    expect(r2.statusCode).toBe(200);

    const r3 = await request(app).get('/api/orders').set('Authorization', `Bearer ${token}`);
    const orders = r3.body;
    const found = orders.find(o => o.id === order_id);
    expect(found).toBeDefined();
    expect(found.status).toBe('paid');
  });
});
