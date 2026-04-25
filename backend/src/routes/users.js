const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const auditLog = require('../middleware/auditLog');
const { getAllUsers, updateUserStatus, deleteUser } = require('../controllers/usersController');

router.use(authenticate, requireRole('Administrator'));
router.get('/', getAllUsers);
router.patch('/:id/status', auditLog('ADMIN_UPDATE_USER_STATUS'), updateUserStatus);
router.delete('/:id',       auditLog('ADMIN_DELETE_USER'),         deleteUser);

module.exports = router;
