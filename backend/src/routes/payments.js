const express = require('express');
const router = express.Router();
const adapter = require('../db/adapter');
const { v4: uuidv4 } = require('uuid');

async function get_bkash_token() {
  const base = process.env.BKASH_BASE_URL || 'https://token.sandbox.bkash.com';
  const key = process.env.BKASH_APP_KEY || '';
  const secret = process.env.BKASH_APP_SECRET || '';
  if (!base || !key || !secret) return { id_token: 'mock-id-token', statusCode: '0000' };
  // For full implementation, call out to bkash; for now we keep sandbox behaviour
  return { id_token: 'mock-id-token', statusCode: '0000' };
}

// create payment from cart
router.post('/bkash/create-payment', require('../middleware/auth').authMiddleware, async (req, res) => {
  const user = req.user;
  const cart_items = await adapter.getCartByUser(user.id);
  if (!cart_items || cart_items.length === 0) return res.status(400).json({ detail: 'Cart is empty' });

  let usd_total = 0;
  const order_items = [];
  for (const item of cart_items) {
    const product = await adapter.findProductById(item.product_id);
    if (product) {
      const item_total = product.price * item.quantity;
      usd_total += item_total;
      order_items.push({ product_id: item.product_id, product_name: product.name, quantity: item.quantity, price: product.price, total: item_total });
    }
  }

  const rate = parseFloat(process.env.USD_TO_BDT_RATE || '108.0');
  const bdt_total = Math.round(usd_total * rate * 100) / 100;

  const merchant_invoice = uuidv4();
  const order_doc = { id: uuidv4(), user_id: user.id, items: order_items, total_amount: Math.round(usd_total * 100) / 100, total_amount_bdt: bdt_total, status: 'pending', payment_method: 'bKash', merchant_invoice };
  await adapter.createOrder(order_doc);

  const token = await get_bkash_token();
  if (token.id_token === 'mock-id-token') {
    const paymentId = `mock_${uuidv4().replace(/-/g,'')}`;
    const approvalUrl = `https://sandbox.bkash.com/mock/approve/${paymentId}`;
    return res.json({ paymentId, approvalUrl, amount_bdt: bdt_total, order_id: order_doc.id, merchant_invoice });
  }

  return res.json({ paymentId: 'real-token-flow-not-implemented', approvalUrl: null, amount_bdt: bdt_total, order_id: order_doc.id, merchant_invoice });
});

// execute payment
router.post('/bkash/execute-payment', async (req, res) => {
  const body = req.body;
  const paymentId = body.paymentId;
  const payerReference = body.payerReference;
  const orderId = body.orderId;
  const merchantInvoice = body.merchantInvoice;

  if (!paymentId || !payerReference) return res.status(400).json({ detail: 'Missing paymentId or payerReference' });

  let order = null;
  if (orderId) order = await adapter.findOrderById(orderId);
  if (!order && merchantInvoice) order = await adapter.findOrderByMerchantInvoice(merchantInvoice);

  const token = await get_bkash_token();
  if (token.id_token === 'mock-id-token') {
    if (order) {
      await adapter.updateOrderById(order.id, { status: 'paid', payment_id: paymentId, payment_info: { payerReference }, payment_confirmed_at: new Date().toISOString() });
      await adapter.deleteCartItemsByUser(order.user_id);
      return res.json({ status: 'success', order_id: order.id });
    }
    return res.json({ status: 'success', paymentId });
  }

  res.status(400).json({ detail: 'Real bKash flow not implemented in mock' });
});

// public webhook
router.post('/bkash/webhook', async (req, res) => {
  const payload = req.body;
  const payment_id = payload.paymentID || payload.paymentId;
  const merchant_invoice = payload.merchantInvoiceNumber || payload.merchantInvoiceNumber;

  let order = null;
  if (merchant_invoice) order = await adapter.findOrderByMerchantInvoice(merchant_invoice);
  if (!order && payment_id) order = await adapter.findOrderByPaymentId(payment_id);

  if (order && (payload.event === 'payment.success' || payload.status === 'success')) {
    await adapter.updateOrderById(order.id, { status: 'paid', payment_id, payment_info: payload, payment_confirmed_at: new Date().toISOString() });
    await adapter.deleteCartItemsByUser(order.user_id);
    return res.sendStatus(200);
  }

  return res.sendStatus(200);
});

module.exports = router;
