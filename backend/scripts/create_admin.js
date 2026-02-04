require('dotenv').config({ path: './.env' });
const adapter = require('../src/db/adapter');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function question(q) {
  return new Promise(resolve => rl.question(q, answer => resolve(answer)));
}

async function run() {
  try {
    const username = (process.env.ADMIN_USERNAME) || await question('Admin username [admin]: ');
    const email = (process.env.ADMIN_EMAIL) || await question('Admin email [admin@digitalbazar.com]: ');
    const password = (process.env.ADMIN_PASSWORD) || await question('Admin password: ');

    if (!password) {
      console.error('Password required');
      process.exit(1);
    }

    await adapter.connectMongo();

    const existing = await adapter.getUserByUsername(username) || await adapter.getUserByUsername(email);
    if (existing) {
      console.error('User already exists');
      process.exit(1);
    }

    const id = `user-${Date.now()}`;
    const user = { id, username: username || 'admin', email: email || 'admin@digitalbazar.com', full_name: 'Administrator', is_admin: true, created_at: new Date().toISOString() };
    const hash = bcrypt.hashSync(password, 10);
    await adapter.createUser(user, hash);
    console.log('Created admin user', user.username);
    process.exit(0);
  } catch (e) {
    console.error('ERROR', e);
    process.exit(1);
  }
}

run();