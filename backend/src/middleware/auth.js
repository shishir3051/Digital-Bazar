const jwt = require('jsonwebtoken');
const adapter = require('../db/adapter');
const SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function authMiddleware(req, res, next) {
  const h = req.headers['authorization'];
  if (!h) return res.status(401).json({ detail: 'Missing Authorization header' });
  const parts = h.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ detail: 'Bad Authorization header' });
  try {
    const payload = jwt.verify(parts[1], SECRET);
    const user = await adapter.getUserById(payload.user_id);
    if (!user) return res.status(404).json({ detail: 'User not found' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ detail: 'Invalid token' });
  }
}

function createAccessToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '8d' });
}

module.exports = { authMiddleware, createAccessToken };
