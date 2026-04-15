const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { signToken } = require('../utils/jwt');

async function register(req, res) {
  const { name, email, password } = req.body;

  const errors = {};
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.name = 'Name is required';
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Valid email is required';
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'validation failed', fields: errors });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return res.status(400).json({ error: 'validation failed', fields: { email: 'Email already in use' } });
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name: name.trim(), email: email.toLowerCase(), password: hashed },
    select: { id: true, name: true, email: true, created_at: true },
  });

  const token = signToken({ user_id: user.id, email: user.email });
  return res.status(201).json({ token, user });
}

async function login(req, res) {
  const { email, password } = req.body;

  const errors = {};
  if (!email || typeof email !== 'string') errors.email = 'Email is required';
  if (!password || typeof password !== 'string') errors.password = 'Password is required';
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'validation failed', fields: errors });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const token = signToken({ user_id: user.id, email: user.email });
  const { password: _, ...safeUser } = user;
  return res.json({ token, user: safeUser });
}

module.exports = { register, login };
