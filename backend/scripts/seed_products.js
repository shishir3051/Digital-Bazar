require('dotenv').config({ path: './.env' });
const adapter = require('../src/db/adapter');

const sampleProducts = [
  { name: 'Wireless Headphones', description: 'High-quality wireless headphones with noise cancellation', price: 199.99, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661', stock: 50 },
  { name: 'Smart Circuit Board', description: 'Advanced circuit board for electronics projects', price: 89.99, category: 'Electronics', image_url: 'https://images.unsplash.com/photo-1562408590-e32931084e23', stock: 25 },
  { name: 'Colorful T-Shirt Collection', description: 'Premium cotton t-shirts in various colors', price: 29.99, category: 'Clothing', image_url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68', stock: 100 },
  { name: 'Modern Home Decor Set', description: 'Elegant home decor for contemporary living spaces', price: 129.99, category: 'Home Decor', image_url: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45', stock: 35 }
];

async function run() {
  try {
    await adapter.connectMongo();
    const count = await adapter.countProducts();
    if (count > 0) {
      console.log('Products already present, skipping seed.');
      process.exit(0);
    }
    const docs = await adapter.insertProducts(sampleProducts);
    console.log('Inserted', docs.length, 'products');
    process.exit(0);
  } catch (e) {
    console.error('SEED_ERROR', e);
    process.exit(1);
  }
}

run();