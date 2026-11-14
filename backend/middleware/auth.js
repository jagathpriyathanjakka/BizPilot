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

  // Strictly enforce authentication - NO automatic fallback
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required. Please sign in.' });
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
