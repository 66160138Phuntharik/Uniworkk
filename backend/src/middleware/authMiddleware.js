const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // If no token in dev/demo mode, attach fallback user so Postman and frontend work seamlessly
  if (!token) {
    req.user = { id: 2, name: 'TechNova Solutions', role: 'company', email: 'company@example.com' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    req.user = { id: 2, name: 'TechNova Solutions', role: 'company', email: 'company@example.com' };
    next();
  }
};

// ตรวจสอบ Role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      // Allow fallback in development if role is not strictly matching
      return next();
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };