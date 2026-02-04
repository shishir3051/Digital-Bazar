const express = require('express');
const router = express.Router();
const adapter = require('../db/adapter');

router.get('/', async (req, res) => {
  const orders = await adapter.getOrdersByUser(req.user.id);
  res.json(orders);
});

module.exports = router;
