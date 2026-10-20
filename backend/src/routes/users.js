const express = require('express');
const { z } = require('zod');
const User = require('../models/User');
const { requireRole } = require('../middleware/auth');
const { HttpError } = require('../middleware/errors');

const router = express.Router();
router.use(requireRole('admin'));

const createSchema = z.object({
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9._-]{3,64}$/, '3-64 chars: letters, digits, . _ -'),
  password: z.string().min(12).max(256),
  role: z.enum(User.ROLES).default('viewer'),
});

const updateSchema = z.object({
  password: z.string().min(12).max(256).optional(),
  role: z.enum(User.ROLES).optional(),
});

router.get('/', async (req, res) => {
  res.json({ users: await User.find().sort({ username: 1 }) });
});

router.post('/', async (req, res) => {
  const { username, password, role } = createSchema.parse(req.body);
  const user = await User.create({ username, role, passwordHash: await User.hashPassword(password) });
  res.status(201).json({ user });
});

router.patch('/:id', async (req, res) => {
  const { password, role } = updateSchema.parse(req.body);
  const user = await User.findById(req.params.id);
  if (!user) throw new HttpError(404, 'User not found');
  if (role && user.id === req.user.id && role !== 'admin') {
    throw new HttpError(400, 'You cannot remove your own admin role');
  }
  if (role) user.role = role;
  if (password) user.passwordHash = await User.hashPassword(password);
  await user.save();
  res.json({ user });
});

router.delete('/:id', async (req, res) => {
  if (req.params.id === req.user.id) throw new HttpError(400, 'You cannot delete yourself');
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new HttpError(404, 'User not found');
  res.status(204).end();
});

module.exports = router;
