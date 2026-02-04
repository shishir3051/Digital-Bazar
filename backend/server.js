require('dotenv').config();
const Fastify = require('fastify');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const app = Fastify({ logger: true });

app.register(require('@fastify/cors'), {
  origin: true
});

/* =====================
   ENV
===================== */
const {
  MONGO_URL,
  DB_NAME,
  JWT_SECRET = 'change-this-in-production',
  PORT = 8000
} = process.env;

/* =====================
   MongoDB
===================== */
mongoose.connect(MONGO_URL, {
  dbName: DB_NAME
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection failed', err);
  process.exit(1);
});

/* =====================
   Schemas
===================== */
const UserSchema = new mongoose.Schema({
  id: String,
  username: String,
  email: String,
  full_name: String,
  is_admin: { type: Boolean, default: false },
  created_at: Date
}, { versionKey: false });

const UserPasswordSchema = new mongoose.Schema({
  user_id: String,
  password_hash: String
}, { versionKey: false });

const ProductSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  price: Number,
  category: String,
  image_url: String,
  stock: Number,
  created_at: Date
}, { versionKey: false });

const CartItemSchema = new mongoose.Schema({
  id: String,
  user_id: String,
  product_id: String,
  quantity: Number,
  created_at: Date
}, { versionKey: false });

const OrderSchema = new mongoose.Schema({
  id: String,
  user_id: String,
  items: Array,
  total_amount: Number,
  status: String,
  shipping_address: String,
  created_at: Date
}, { versionKey: false });

/* =====================
   Models
===================== */
const User = mongoose.model('User', UserSchema);
const UserPassword = mongoose.model('UserPassword', UserPasswordSchema);
const Product = mongoose.model('Product', ProductSchema);
const CartItem = mongoose.model('CartItem', CartItemSchema);
const Order = mongoose.model('Order', OrderSchema);

/* =====================
   Auth helpers
===================== */
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });
}

async function authGuard(request, reply) {
  const header = request.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return reply.code(401).send({ detail: 'Unauthorized' });
  }

  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ id: payload.user_id }).lean();

    if (!user) {
      return reply.code(401).send({ detail: 'User not found' });
    }

    request.user = user;
  } catch {
    return reply.code(401).send({ detail: 'Invalid token' });
  }
}

/* =====================
   AUTH
===================== */
app.post('/api/auth/register', async (req, reply) => {
  const { username, email, full_name, password } = req.body;

  const exists = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (exists) {
    return reply.code(400).send({ detail: 'Username or email already exists' });
  }

  const user = {
    id: uuidv4(),
    username,
    email,
    full_name,
    is_admin: false,
    created_at: new Date()
  };

  const hash = await bcrypt.hash(password, 10);

  await User.create(user);
  await UserPassword.create({
    user_id: user.id,
    password_hash: hash
  });

  const token = signToken({ user_id: user.id });
  reply.send({ token, user });
});

app.post('/api/auth/login', async (req, reply) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username }).lean();
  if (!user) {
    return reply.code(400).send({ detail: 'Invalid username or password' });
  }

  const pw = await UserPassword.findOne({ user_id: user.id });
  if (!pw || !(await bcrypt.compare(password, pw.password_hash))) {
    return reply.code(400).send({ detail: 'Invalid username or password' });
  }

  const token = signToken({ user_id: user.id });
  reply.send({ token, user });
});

app.get('/api/auth/me', { preHandler: authGuard }, async (req) => {
  return req.user;
});

/* =====================
   PRODUCTS
===================== */
app.get('/api/products', async (req) => {
  const query = req.query.category ? { category: req.query.category } : {};
  return Product.find(query).lean();
});

app.get('/api/products/:id', async (req, reply) => {
  const product = await Product.findOne({ id: req.params.id }).lean();
  if (!product) {
    return reply.code(404).send({ detail: 'Product not found' });
  }
  return product;
});

app.post('/api/products', { preHandler: authGuard }, async (req, reply) => {
  if (!req.user.is_admin) {
    return reply.code(403).send({ detail: 'Admin access required' });
  }

  const product = {
    id: uuidv4(),
    ...req.body,
    created_at: new Date()
  };

  await Product.create(product);
  reply.send(product);
});

/* =====================
   CART
===================== */
app.get('/api/cart', { preHandler: authGuard }, async (req) => {
  const items = await CartItem.find({ user_id: req.user.id }).lean();
  const result = [];

  for (const item of items) {
    const product = await Product.findOne({ id: item.product_id }).lean();
    if (product) {
      result.push({ cart_item: item, product });
    }
  }

  return result;
});

app.post('/api/cart/add', { preHandler: authGuard }, async (req, reply) => {
  const { product_id, quantity } = req.body;

  const product = await Product.findOne({ id: product_id });
  if (!product) {
    return reply.code(404).send({ detail: 'Product not found' });
  }

  const existing = await CartItem.findOne({
    user_id: req.user.id,
    product_id
  });

  if (existing) {
    existing.quantity += quantity;
    await existing.save();
    return existing.toObject();
  }

  const item = {
    id: uuidv4(),
    user_id: req.user.id,
    product_id,
    quantity,
    created_at: new Date()
  };

  await CartItem.create(item);
  return item;
});

/* =====================
   ORDERS
===================== */
app.post('/api/orders', { preHandler: authGuard }, async (req, reply) => {
  const cart = await CartItem.find({ user_id: req.user.id }).lean();
  if (!cart.length) {
    return reply.code(400).send({ detail: 'Cart is empty' });
  }

  let total = 0;
  const items = [];

  for (const c of cart) {
    const p = await Product.findOne({ id: c.product_id }).lean();
    if (p) {
      const sum = p.price * c.quantity;
      total += sum;
      items.push({
        product_id: p.id,
        product_name: p.name,
        quantity: c.quantity,
        price: p.price,
        total: sum
      });
    }
  }

  const order = {
    id: uuidv4(),
    user_id: req.user.id,
    items,
    total_amount: total,
    status: 'pending',
    shipping_address: req.body.shipping_address,
    created_at: new Date()
  };

  await Order.create(order);
  await CartItem.deleteMany({ user_id: req.user.id });

  reply.send(order);
});

/* =====================
   HEALTH
===================== */
app.get('/api/health', async () => {
  return { status: 'healthy', service: 'E-Commerce API' };
});

/* =====================
   START
===================== */
app.listen({ port: PORT, host: '0.0.0.0' })
  .then(() => console.log(`Server running on port ${PORT}`));
