const express = require('express');
const router = express.Router();
const adapter = require('../db/adapter');

router.get('/', async (req, res) => {
  const products = await adapter.getProducts();
  res.json(products);
});

module.exports = router;
