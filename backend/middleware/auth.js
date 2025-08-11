const prisma = require('../utils/database');
const { verifyToken } = require('../utils/jwt');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = verifyToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        userType: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Token verification failed' });
  }
};

const requireAuthor = (req, res, next) => {
  if (req.user.userType !== 'author') {
    return res.status(403).json({ error: 'Author access required' });
  }
  next();
};

const requireReader = (req, res, next) => {
  if (req.user.userType !== 'reader') {
    return res.status(403).json({ error: 'Reader access required' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAuthor,
  requireReader
};
