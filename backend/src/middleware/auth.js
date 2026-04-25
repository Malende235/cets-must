const { verifyToken } = require('../config/jwt');
const pool = require('../config/db');

// Authenticate – reads JWT from Authorization: Bearer header OR httpOnly cookie
const authenticate = async (req, res, next) => {
  try {
    // Prefer Authorization header (works cross-device over HTTP)
    let token = null;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else {
      token = req.cookies?.token;
    }

    if (!token) return res.status(401).json({ message: 'Unauthorized – no token' });

    const decoded = verifyToken(token);
    const result = await pool.query(
      `SELECT "userID", "fullName", email, role, "accountStatus" FROM users WHERE "userID" = $1`,
      [decoded.userID]
    );

    if (!result.rows.length)
      return res.status(401).json({ message: 'Unauthorized – user not found' });

    const user = result.rows[0];
    if (user.accountStatus === 'Suspended')
      return res.status(403).json({ message: 'Account suspended. Contact admin.' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized – invalid token' });
  }
};

// Role guard factory
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: `Access denied – requires role: ${roles.join(' or ')}` });
  next();
};

module.exports = { authenticate, requireRole };
