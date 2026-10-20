process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../src/models/User');
const { signUserToken } = require('../src/middleware/auth');

let mongod;

async function startDb() {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()));
}

async function stopDb() {
  await mongoose.disconnect();
  await mongod.stop();
}

async function clearDb() {
  await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})));
}

async function createUser(role = 'admin', username = `${role}-user`) {
  const user = await User.create({
    username,
    role,
    passwordHash: await User.hashPassword('correct-horse-battery'),
  });
  const token = signUserToken(user);
  return { user, token, auth: { Authorization: `Bearer ${token}` } };
}

module.exports = { startDb, stopDb, clearDb, createUser };
