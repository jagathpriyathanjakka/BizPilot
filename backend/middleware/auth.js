const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'bizpilot-ultra-secure-jwt-secret-key-2025';

function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.bizpilot_token) {
    token = req.cookies.bizpilot_token;
  }

  // Fallback demo user session for instant local exploration
  if (!token) {
    req.user = {
      userId: 'usr-demo-owner',
      email: 'owner@bizpilot.ai',
      fullName: 'Sunil Kumar',
      role: 'owner',
      orgId: 'org-demo-1',
      activeBusinessId: 'biz-grocery-demo',
    };
    return next();
  }

  const session = verifyToken(token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired authorization token' });
  }

  req.user = session;
  next();
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
}

module.exports = {
  createToken,
  verifyToken,
  authMiddleware,
  requireRole,
};
