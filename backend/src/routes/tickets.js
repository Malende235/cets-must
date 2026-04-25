const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const auditLog = require('../middleware/auditLog');
const {
  purchaseTicket, getMyTickets, getTicket,
  cancelTicket, downloadTicketPDF, getTicketsByEvent
} = require('../controllers/ticketsController');

router.use(authenticate);

router.post('/purchase',            requireRole('Student'), auditLog('PURCHASE_TICKET'), purchaseTicket);
router.get('/my',                   getMyTickets);
router.get('/event/:eventID',       requireRole('Organizer','Administrator'), getTicketsByEvent);
router.get('/:id',                  getTicket);
router.get('/:id/pdf',              downloadTicketPDF);
router.patch('/:id/cancel',         auditLog('CANCEL_TICKET'), cancelTicket);

module.exports = router;
