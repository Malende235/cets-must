const pool = require('../config/db');

const auditLog = (action) => async (req, res, next) => {
  // Store original json to intercept after response
  const originalJson = res.json.bind(res);
  res.json = async (body) => {
    try {
      const userID = req.user?.userID || null;
      const details = JSON.stringify({
        method: req.method,
        path: req.path,
        params: req.params,
        body: req.body ? { ...req.body, password: undefined, passwordHash: undefined } : {},
      });
      await pool.query(
        `INSERT INTO audit_logs ("userID", action, details, "ipAddress") VALUES ($1, $2, $3, $4)`,
        [userID, action, details, req.ip]
      );
    } catch (e) {
      console.error('Audit log error:', e.message);
    }
    return originalJson(body);
  };
  next();
};

module.exports = auditLog;
