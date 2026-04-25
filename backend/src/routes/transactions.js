const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { getMyTransactions, getAllTransactions } = require('../controllers/transactionsController');

router.use(authenticate);
router.get('/my', getMyTransactions);
router.get('/',   requireRole('Administrator'), getAllTransactions);

module.exports = router;
