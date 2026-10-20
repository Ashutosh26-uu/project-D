const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const config = require('./config');
const ai = require('./services/aiClient');
const { requireAuth } = require('./middleware/auth');
const { notFound, errorHandler } = require('./middleware/errors');

const noopRealtime = { broadcast() {}, disconnectDrone() {} };

function createApp({ realtime = noopRealtime } = {}) {
  const app = express();
  app.locals.realtime = realtime;

  app.disable('x-powered-by');
  app.set('trust proxy', 1); // behind nginx in docker-compose
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins }));
  app.use(express.json({ limit: '100kb' }));
  if (config.env !== 'test') app.use(morgan('tiny'));

  app.get('/api/health', async (req, res) => {
    const mongo = mongoose.connection.readyState === 1;
    const aiOk = await ai.health();
    res.status(mongo ? 200 : 503).json({ status: mongo ? 'ok' : 'degraded', mongo, ai: aiOk });
  });

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/users', requireAuth, require('./routes/users'));
  app.use('/api/drones', requireAuth, require('./routes/drones'));
  app.use('/api/detections', requireAuth, require('./routes/detections'));
  app.use('/api/alerts', requireAuth, require('./routes/alerts'));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
