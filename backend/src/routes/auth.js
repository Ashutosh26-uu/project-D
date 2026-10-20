const express = require('express');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const User = require('../models/User');
const { signUserToken, requireAuth } = require('../middleware/auth');
const { HttpError } = require('../middleware/errors');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many login attempts, try again later' },
});

const loginSchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(256),
});

router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = loginSchema.parse(req.body);
  const user = await User.findOne({ username: username.toLowerCase() }).select('+passwordHash');
  if (!user || !(await user.verifyPassword(password))) {
    throw new HttpError(401, 'Invalid username or password');
  }
  res.json({ token: signUserToken(user), user });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
