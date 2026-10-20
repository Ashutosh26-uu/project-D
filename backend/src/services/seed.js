const config = require('../config');
const User = require('../models/User');

// Creates the first admin account on an empty database
async function seedAdmin() {
  if (await User.exists({})) return;
  const { username, password } = config.seedAdmin;
  if (password.length < 12) {
    console.warn('No users exist and ADMIN_PASSWORD is unset or shorter than 12 chars; skipping admin seed');
    return;
  }
  await User.create({ username, passwordHash: await User.hashPassword(password), role: 'admin' });
  console.log(`Seeded admin user "${username}"`);
}

module.exports = { seedAdmin };
