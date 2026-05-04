const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { getAuditLogs, getMyNotifications, markAllRead, getAdminStats, getOrganizerStats, getOrganizerAuditLogs } = require('../controllers/miscController');

// Audit logs – admin only
router.get('/audit-logs', authenticate, requireRole('Administrator'), getAuditLogs);

// Stats
router.get('/admin/stats',        authenticate, requireRole('Administrator'), getAdminStats);
router.get('/organizer/stats',    authenticate, requireRole('Organizer','Administrator'), getOrganizerStats);
router.get('/organizer/audit-logs', authenticate, requireRole('Organizer','Administrator'), getOrganizerAuditLogs);

// Notifications
router.get('/notifications/my',       authenticate, getMyNotifications);
router.patch('/notifications/read-all', authenticate, markAllRead);

module.exports = router;
