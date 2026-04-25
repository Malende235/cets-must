const express = require('express');
const router = express.Router();
const { register, login, logout, me } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const auditLog = require('../middleware/auditLog');

router.post('/register', auditLog('USER_REGISTER'), register);
router.post('/login',    auditLog('USER_LOGIN'),    login);
router.post('/logout',   authenticate, auditLog('USER_LOGOUT'), logout);
router.get('/me',        authenticate, me);

module.exports = router;
