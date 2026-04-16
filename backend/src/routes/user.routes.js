const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const prisma = require('../utils/prisma');

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  });
  res.json({ users });
});

module.exports = router;
