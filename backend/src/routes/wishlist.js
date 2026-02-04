const express = require('express');
const router = express.Router();
const adapter = require('../db/adapter');
const { authMiddleware } = require('../middleware/auth');

// Get wishlist (enriched with product details)
router.get('/', authMiddleware, async (req, res) => {
  const items = await adapter.getWishlistByUser(req.user.id);
  const enriched = [];
  for (const item of items) {
    const product = await adapter.findProductById(item.product_id);
    if (product) enriched.push({ wishlist_item: item, product });
  }
  res.json(enriched);
});

// Toggle wishlist item
router.post('/toggle', authMiddleware, async (req, res) => {
  const { product_id } = req.body;
  if (!product_id) return res.status(400).json({ detail: 'product_id required' });
  // check product exists
  const product = await adapter.findProductById(product_id);
  if (!product) return res.status(404).json({ detail: 'Product not found' });
  const r = await adapter.toggleWishlistItem(req.user.id, product_id);
  if (r.status === 'added') return res.json({ status: 'added', item: r.item });
  return res.json({ status: 'removed' });
});

// Remove from wishlist by id
router.delete('/:item_id', authMiddleware, async (req, res) => {
  const ok = await adapter.deleteWishlistItemById(req.params.item_id, req.user.id);
  if (!ok) return res.status(404).json({ detail: 'Wishlist item not found' });
  res.json({ message: 'Item removed from wishlist' });
});

module.exports = router;