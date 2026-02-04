require('dotenv').config({ path: './.env' });
const { MongoClient } = require('mongodb');

async function run() {
  let url = process.env.MONGO_URL;
  const dbName = process.env.DB_NAME || 'digital_bazar';
  if (!url) {
    console.error('MONGO_URL not set in .env');
    process.exit(1);
  }

  // Attempt to auto-encode password if connection string contains unescaped characters
  try {
    const client = new MongoClient(url);
    await client.connect();
    await client.close();
  } catch (e) {
    console.warn('Initial connect failed:', e.message);
    // Try to auto-encode password between '//' and '@'
    try {
      const parts = url.split('//');
      if (parts.length === 2 && parts[1].includes('@')) {
        const prefix = parts[0] + '//';
        const rest = parts[1];
        const creds = rest.split('@')[0];
        const after = rest.split('@').slice(1).join('@');
        if (creds.includes(':')) {
          const [user, passRaw] = creds.split(':');
          const passEncoded = encodeURIComponent(passRaw);
          const fixed = prefix + `${user}:${passEncoded}@` + after;
          console.log('Retrying with URL that has encoded password');
          url = fixed;
        }
      }
    } catch (ee) {
      console.error('Auto-encode attempt failed:', ee.message);
    }
  }

  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collections = ['users', 'user_passwords', 'products', 'cart_items', 'orders', 'wishlist_items'];
    console.log(`Connected to ${dbName}`);
    for (const coll of collections) {
      const exists = await db.listCollections({ name: coll }).hasNext();
      if (!exists) {
        console.log(`${coll}: (collection not found)`);
        continue;
      }
      const count = await db.collection(coll).countDocuments();
      console.log(`${coll}: ${count}`);
    }
  } catch (e) {
    console.error('ERROR connecting to MongoDB with possibly-encoded URL:', e.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

run();