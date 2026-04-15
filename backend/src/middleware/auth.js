const { verifyToken } = require('../utils/jwt');
const prisma = require('../utils/prisma');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.user_id } });

    if (!user) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'unauthorized' });
  }
}

module.exports = { authenticate };
