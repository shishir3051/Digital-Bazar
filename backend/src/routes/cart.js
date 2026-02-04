const express = require('express');
const router = express.Router();
const adapter = require('../db/adapter');

router.get('/', async (req, res) => {
  const items = await adapter.getCartByUser(req.user.id);
  res.json(items);
});

router.post('/', async (req, res) => {
  const { product_id, quantity } = req.body;
  if (!product_id || !quantity) return res.status(400).json({ detail: 'Missing product_id or quantity' });
  const item = await adapter.addCartItem(req.user.id, product_id, quantity);
  res.json(item);
});

router.delete('/', async (req, res) => {
  const deleted = await adapter.deleteCartItemsByUser(req.user.id);
  res.json({ deleted });
});

module.exports = router;
