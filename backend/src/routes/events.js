const express = require('express');
const multer  = require('multer');
const path    = require('path');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const auditLog = require('../middleware/auditLog');
const {
  getEvents, getEvent, getCategories,
  createEvent, updateEvent, cancelEvent, deleteEvent, getMyEvents
} = require('../controllers/eventsController');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Public
router.get('/categories', getCategories);
router.get('/',      getEvents);
router.get('/my',    authenticate, requireRole('Organizer','Administrator'), getMyEvents);
router.get('/:id',   getEvent);

// Protected
router.post('/',
  authenticate, requireRole('Organizer','Administrator'),
  upload.single('bannerImage'),
  auditLog('CREATE_EVENT'),
  createEvent
);
router.put('/:id',
  authenticate, requireRole('Organizer','Administrator'),
  upload.single('bannerImage'),
  auditLog('UPDATE_EVENT'),
  updateEvent
);
router.patch('/:id/cancel',
  authenticate, requireRole('Organizer','Administrator'),
  auditLog('CANCEL_EVENT'),
  cancelEvent
);
router.delete('/:id',
  authenticate, requireRole('Administrator'),
  auditLog('DELETE_EVENT'),
  deleteEvent
);

module.exports = router;
