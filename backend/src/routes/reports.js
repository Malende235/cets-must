const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { eventsReport, salesReport, usersReport, orgEventsReport, orgSalesReport } = require('../controllers/reportsController');

// Admin-only reports
router.get('/events', authenticate, requireRole('Administrator'), eventsReport);
router.get('/sales',  authenticate, requireRole('Administrator'), salesReport);
router.get('/users',  authenticate, requireRole('Administrator'), usersReport);

// Organizer-scoped reports
router.get('/organizer/events', authenticate, requireRole('Organizer','Administrator'), orgEventsReport);
router.get('/organizer/sales',  authenticate, requireRole('Organizer','Administrator'), orgSalesReport);

module.exports = router;
