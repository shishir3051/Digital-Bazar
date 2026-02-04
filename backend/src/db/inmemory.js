const { v4: uuidv4 } = require('uuid');

const db = {
  users: [],
  user_passwords: [],
  products: [],
  cartItems: [],
  orders: [],
  wishlistItems: []
};

// Seed default user and product for tests/dev
function seed() {
  db.users.push({ id: 'user-1', username: 'test', email: 't@t.com', full_name: 'Test User', is_admin: false, created_at: new Date().toISOString() });
  db.user_passwords.push({ user_id: 'user-1', password_hash: null });
  db.products.push({ id: 'prod-1', name: 'Widget', price: 10.0 });
}

function clear() {
  db.users.length = 0;
  db.user_passwords.length = 0;
  db.products.length = 0;
  db.cartItems.length = 0;
  db.orders.length = 0;
  db.wishlistItems.length = 0;
}

module.exports = { db, seed, clear };
