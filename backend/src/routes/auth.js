const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const adapter = require('../db/adapter');
const { createAccessToken } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  const { username, email, password, full_name } = req.body;
  if (!username || !email || !password) return res.status(400).json({ detail: 'username, email and password are required' });

  const existing = await adapter.getUserByUsername(username) || await adapter.getUserByUsername(email);
  if (existing) return res.status(400).json({ detail: 'Username or email already exists' });

  const id = `user-${Date.now()}`;
  const user = { id, username, email, full_name: full_name || '', is_admin: false, created_at: new Date().toISOString() };
  const passwordHash = bcrypt.hashSync(password, 10);
  await adapter.createUser(user, passwordHash);

  const token = createAccessToken({ user_id: user.id });
  res.json({ token, user });
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ detail: 'username and password required' });

  const user = await adapter.getUserByUsername(username);
  if (!user) return res.status(400).json({ detail: 'Invalid username or password' });

  const pwHash = await adapter.getUserPasswordHash(user.id);
  if (!pwHash || !bcrypt.compareSync(password, pwHash)) return res.status(400).json({ detail: 'Invalid username or password' });

  const token = createAccessToken({ user_id: user.id });
  res.json({ token, user });
});

module.exports = router;
