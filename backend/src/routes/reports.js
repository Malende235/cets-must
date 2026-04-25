const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { eventsReport, salesReport, usersReport } = require('../controllers/reportsController');

router.use(authenticate, requireRole('Administrator'));
router.get('/events', eventsReport);
router.get('/sales',  salesReport);
router.get('/users',  usersReport);

module.exports = router;
