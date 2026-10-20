const http = require('http');
const mongoose = require('mongoose');
const config = require('./config');
const { createApp } = require('./app');
const { createRealtime } = require('./realtime');
const { seedAdmin } = require('./services/seed');

async function main() {
  await mongoose.connect(config.mongoUri);
  console.log('MongoDB connected');
  await seedAdmin();

  const app = createApp();
  const server = http.createServer(app);
  const realtime = createRealtime(server);
  app.locals.realtime = realtime;

  server.listen(config.port, () => {
    console.log(`API and WebSocket (/ws) listening on :${config.port}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close();
    await realtime.close();
    await mongoose.disconnect();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
