const { db: inMemoryDb, seed: inMemorySeed, clear: inMemoryClear } = require('./inmemory');
let mongoClient = null;
let mongoDb = null;
const useMongo = !!process.env.MONGO_URL && process.env.USE_MONGO === '1'; // enable Mongo only when explicit USE_MONGO=1

async function connectMongo() {
  if (!useMongo) return;
  if (mongoDb) return;
  const { MongoClient } = require('mongodb');
  mongoClient = new MongoClient(process.env.MONGO_URL, { maxPoolSize: 10 });
  await mongoClient.connect();
  mongoDb = mongoClient.db(process.env.DB_NAME || 'digital_bazar_test');
  console.log('MongoDB connected to', mongoDb.databaseName);
}

async function seed() {
  if (useMongo) {
    await connectMongo();
    // No-op for now; seeding is done via scripts/seed_products.js
    return;
  }
  return inMemorySeed();
}

async function clear() {
  if (useMongo) {
    await connectMongo();
    await Promise.all([
      mongoDb.collection('users').deleteMany({}),
      mongoDb.collection('user_passwords').deleteMany({}),
      mongoDb.collection('products').deleteMany({}),
      mongoDb.collection('cart_items').deleteMany({}),
      mongoDb.collection('orders').deleteMany({}),
      mongoDb.collection('wishlist_items').deleteMany({})
    ]);
    return;
  }
  return inMemoryClear();
}

async function getProducts() {
  if (useMongo) {
    await connectMongo();
    return mongoDb.collection('products').find().toArray();
  }
  return inMemoryDb.products;
}

async function findProductById(id) {
  if (useMongo) {
    await connectMongo();
    return mongoDb.collection('products').findOne({ id });
  }
  return inMemoryDb.products.find(p => p.id === id);
}

async function insertProduct(product) {
  const toInsert = { ...product };
  if (!toInsert.id) toInsert.id = `prod-${Date.now()}`;
  toInsert.created_at = new Date().toISOString();
  if (useMongo) {
    await connectMongo();
    await mongoDb.collection('products').insertOne(toInsert);
    return toInsert;
  }
  inMemoryDb.products.push(toInsert);
  return toInsert;
}

async function insertProducts(products) {
  const docs = products.map(p => ({ ...p, id: p.id || `prod-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, created_at: new Date().toISOString() }));
  if (useMongo) {
    await connectMongo();
    await mongoDb.collection('products').insertMany(docs);
    return docs;
  }
  inMemoryDb.products.push(...docs);
  return docs;
}

async function countProducts() {
  if (useMongo) {
    await connectMongo();
    return mongoDb.collection('products').countDocuments();
  }
  return inMemoryDb.products.length;
}

async function getUserById(id) {
  if (useMongo) {
    await connectMongo();
    return mongoDb.collection('users').findOne({ id });
  }
  return inMemoryDb.users.find(u => u.id === id);
}

async function createUser(userDoc, passwordHash) {
  if (useMongo) {
    await connectMongo();
    await mongoDb.collection('users').insertOne(userDoc);
    if (passwordHash) await mongoDb.collection('user_passwords').insertOne({ user_id: userDoc.id, password_hash: passwordHash });
    return userDoc;
  }
  inMemoryDb.users.push(userDoc);
  if (passwordHash) inMemoryDb.user_passwords.push({ user_id: userDoc.id, password_hash: passwordHash });
  return userDoc;
}

async function getUserByUsername(username) {
  if (useMongo) {
    await connectMongo();
    return mongoDb.collection('users').findOne({ $or: [{ username }, { email: username }] });
  }
  return inMemoryDb.users.find(u => u.username === username || u.email === username);
}

async function getUserPasswordHash(user_id) {
  if (useMongo) {
    await connectMongo();
    const r = await mongoDb.collection('user_passwords').findOne({ user_id });
    return r ? r.password_hash : null;
  }
  const r = inMemoryDb.user_passwords.find(p => p.user_id === user_id);
  return r ? r.password_hash : null;
}

async function getCartByUser(user_id) {
  if (useMongo) {
    await connectMongo();
    return mongoDb.collection('cart_items').find({ user_id }).toArray();
  }
  return inMemoryDb.cartItems.filter(i => i.user_id === user_id);
}

async function addCartItem(user_id, product_id, quantity) {
  if (useMongo) {
    await connectMongo();
    const doc = { id: `cart-${Date.now()}`, user_id, product_id, quantity };
    await mongoDb.collection('cart_items').insertOne(doc);
    return doc;
  }
  const item = { id: `cart-${Date.now()}`, user_id, product_id, quantity };
  inMemoryDb.cartItems.push(item);
  return item;
}

async function deleteCartItemsByUser(user_id) {
  if (useMongo) {
    await connectMongo();
    const res = await mongoDb.collection('cart_items').deleteMany({ user_id });
    return res.deletedCount;
  }
  const before = inMemoryDb.cartItems.length;
  for (let i = inMemoryDb.cartItems.length - 1; i >= 0; i--) if (inMemoryDb.cartItems[i].user_id === user_id) inMemoryDb.cartItems.splice(i, 1);
  return before - inMemoryDb.cartItems.length;
}

async function createOrder(order_doc) {
  if (useMongo) {
    await connectMongo();
    await mongoDb.collection('orders').insertOne(order_doc);
    return order_doc;
  }
  inMemoryDb.orders.push(order_doc);
  return order_doc;
}

async function getOrdersByUser(user_id) {
  if (useMongo) {
    await connectMongo();
    return mongoDb.collection('orders').find({ user_id }).toArray();
  }
  return inMemoryDb.orders.filter(o => o.user_id === user_id);
}

async function getAllOrders() {
  if (useMongo) {
    await connectMongo();
    return mongoDb.collection('orders').find().toArray();
  }
  return inMemoryDb.orders;
}

async function updateOrderById(id, update) {
  if (useMongo) {
    await connectMongo();
    const res = await mongoDb.collection('orders').updateOne({ id }, { $set: update });
    return res.matchedCount > 0;
  }
  const ord = inMemoryDb.orders.find(o => o.id === id);
  if (!ord) return false;
  Object.assign(ord, update);
  return true;
}

async function findOrderById(id) {
  if (useMongo) {
    await connectMongo();
    return mongoDb.collection('orders').findOne({ id });
  }
  return inMemoryDb.orders.find(o => o.id === id);
}

async function findOrderByMerchantInvoice(merchant_invoice) {
  if (useMongo) {
    await connectMongo();
    return mongoDb.collection('orders').findOne({ merchant_invoice });
  }
  return inMemoryDb.orders.find(o => o.merchant_invoice === merchant_invoice);
}

async function findOrderByPaymentId(payment_id) {
  if (useMongo) {
    await connectMongo();
    return mongoDb.collection('orders').findOne({ payment_id });
  }
  return inMemoryDb.orders.find(o => o.payment_id === payment_id);
}

// Wishlist functions
async function getWishlistByUser(user_id) {
  if (useMongo) {
    await connectMongo();
    return mongoDb.collection('wishlist_items').find({ user_id }).toArray();
  }
  return (inMemoryDb.wishlistItems || []).filter(i => i.user_id === user_id);
}

async function toggleWishlistItem(user_id, product_id) {
  if (useMongo) {
    await connectMongo();
    const existing = await mongoDb.collection('wishlist_items').findOne({ user_id, product_id });
    if (existing) {
      await mongoDb.collection('wishlist_items').deleteOne({ id: existing.id });
      return { status: 'removed' };
    }
    const item = { id: `wish-${Date.now()}`, user_id, product_id };
    await mongoDb.collection('wishlist_items').insertOne(item);
    return { status: 'added', item };
  }
  inMemoryDb.wishlistItems = inMemoryDb.wishlistItems || [];
  const idx = inMemoryDb.wishlistItems.findIndex(i => i.user_id === user_id && i.product_id === product_id);
  if (idx !== -1) {
    inMemoryDb.wishlistItems.splice(idx, 1);
    return { status: 'removed' };
  }
  const item = { id: `wish-${Date.now()}`, user_id, product_id };
  inMemoryDb.wishlistItems.push(item);
  return { status: 'added', item };
}

async function deleteWishlistItemById(item_id, user_id) {
  if (useMongo) {
    await connectMongo();
    const res = await mongoDb.collection('wishlist_items').deleteOne({ id: item_id, user_id });
    return res.deletedCount > 0;
  }
  inMemoryDb.wishlistItems = inMemoryDb.wishlistItems || [];
  const idx = inMemoryDb.wishlistItems.findIndex(i => i.id === item_id && i.user_id === user_id);
  if (idx === -1) return false;
  inMemoryDb.wishlistItems.splice(idx, 1);
  return true;
}

module.exports = {
  connectMongo,
  seed,
  clear,
  getProducts,
  findProductById,
  insertProduct,
  insertProducts,
  countProducts,
  getUserById,
  createUser,
  getUserByUsername,
  getUserPasswordHash,
  getCartByUser,
  addCartItem,
  deleteCartItemsByUser,
  createOrder,
  getOrdersByUser,
  getAllOrders,
  updateOrderById,
  findOrderById,
  findOrderByMerchantInvoice,
  findOrderByPaymentId,
  getWishlistByUser,
  toggleWishlistItem,
  deleteWishlistItemById
};
