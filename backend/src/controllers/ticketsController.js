const pool = require('../config/db');
const { processPayment } = require('../services/payment');
const { generateQRCode } = require('../services/qrcode');
const { sendTicketConfirmation } = require('../services/email');
const { generateTicketPDF } = require('../services/pdf');

// Generate unique booking reference
const genBookingRef = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref = 'CETS-';
  for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
};

// POST /api/tickets/purchase
const purchaseTicket = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { eventID, quantity = 1, paymentMethod, cardDetails, phone } = req.body;
    if (!eventID || !paymentMethod)
      return res.status(400).json({ message: 'eventID and paymentMethod are required' });

    if (quantity < 1 || quantity > 5)
      return res.status(400).json({ message: 'You can purchase 1–5 tickets at a time' });

    // Lock event row and check capacity
    const eventRes = await client.query(
      `SELECT * FROM events WHERE "eventID"=$1 FOR UPDATE`,
      [eventID]
    );
    if (!eventRes.rows.length) return res.status(404).json({ message: 'Event not found' });

    const event = eventRes.rows[0];
    if (event.status === 'Cancelled') return res.status(400).json({ message: 'Event has been cancelled' });
    if (event.status === 'Completed') return res.status(400).json({ message: 'Event is completed' });
    if ((event.ticketsSold + quantity) > event.totalCapacity)
      return res.status(400).json({ message: 'Not enough seats available' });

    const amountPaid = parseFloat(event.ticketPrice) * quantity;

    // Create pending transaction
    const txRes = await client.query(
      `INSERT INTO transactions ("userID","eventID","amountPaid","paymentMethod","paymentStatus","gatewayReference")
       VALUES ($1,$2,$3,$4,'Pending','PENDING') RETURNING *`,
      [req.user.userID, eventID, amountPaid, paymentMethod]
    );
    const transaction = txRes.rows[0];

    await client.query('COMMIT');

    // Process payment (outside transaction – 2-second delay)
    let paymentResult;
    try {
      paymentResult = await processPayment({ amount: amountPaid, method: paymentMethod, cardDetails, phone });
    } catch (paymentErr) {
      // Update transaction to failed
      await pool.query(
        `UPDATE transactions SET "paymentStatus"='Failed',"gatewayReference"=$1 WHERE "transactionID"=$2`,
        [paymentErr.gatewayReference || 'FAILED', transaction.transactionID]
      );
      return res.status(402).json({ message: paymentErr.message || 'Payment failed. Please try again.' });
    }

    // Payment succeeded – create ticket in a new transaction
    const client2 = await pool.connect();
    try {
      await client2.query('BEGIN');

      // Update transaction to success
      await client2.query(
        `UPDATE transactions SET "paymentStatus"='Success',"gatewayReference"=$1 WHERE "transactionID"=$2`,
        [paymentResult.gatewayReference, transaction.transactionID]
      );

      // Increment ticketsSold
      await client2.query(
        `UPDATE events SET "ticketsSold"="ticketsSold"+$1 WHERE "eventID"=$2`,
        [quantity, eventID]
      );

      // Generate booking reference and QR code
      let bookingRef;
      let attempts = 0;
      do {
        bookingRef = genBookingRef();
        const check = await client2.query(`SELECT 1 FROM tickets WHERE "bookingReference"=$1`, [bookingRef]);
        if (!check.rows.length) break;
        attempts++;
      } while (attempts < 10);

      const qrData = JSON.stringify({ ref: bookingRef, event: eventID, user: req.user.userID });
      const qrCode = await generateQRCode(qrData);

      const ticketRes = await client2.query(
        `INSERT INTO tickets ("userID","eventID","transactionID","bookingReference","ticketStatus","qrCode",quantity)
         VALUES ($1,$2,$3,$4,'Valid',$5,$6) RETURNING *`,
        [req.user.userID, eventID, transaction.transactionID, bookingRef, qrCode, quantity]
      );
      const ticket = ticketRes.rows[0];

      // Log notification
      await client2.query(
        `INSERT INTO notifications ("userID","eventID","notificationType","message","deliveryStatus")
         VALUES ($1,$2,'Confirmation',$3,'Sent')`,
        [req.user.userID, eventID, `Ticket confirmed: ${bookingRef} for ${event.title}`]
      );

      await client2.query('COMMIT');

      // Send email (non-blocking)
      const userRes = await pool.query(`SELECT * FROM users WHERE "userID"=$1`, [req.user.userID]);
      const user = userRes.rows[0];
      sendTicketConfirmation({
        to: user.email,
        fullName: user.fullName,
        bookingRef,
        eventTitle: event.title,
        eventDate: new Date(event.eventDate).toLocaleDateString('en-UG'),
        eventTime: event.eventTime,
        location: event.location,
        qrCode,
        quantity,
      }).catch(console.error);

      res.status(201).json({
        message: 'Ticket purchased successfully',
        ticket,
        transaction: { ...transaction, paymentStatus: 'Success', gatewayReference: paymentResult.gatewayReference },
        bookingRef,
        qrCode,
      });
    } catch (err) {
      await client2.query('ROLLBACK');
      throw err;
    } finally {
      client2.release();
    }
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
  }
};

// GET /api/tickets/my
const getMyTickets = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const countRes = await pool.query(`SELECT COUNT(*) FROM tickets WHERE "userID"=$1`, [req.user.userID]);
    const total = parseInt(countRes.rows[0].count);

    const result = await pool.query(
      `SELECT t.*, e.title AS "eventTitle", e."eventDate", e."eventTime", e.location, e."ticketPrice",
              e.status AS "eventStatus", c.name AS "categoryName"
       FROM tickets t
       JOIN events e ON t."eventID"=e."eventID"
       JOIN categories c ON e."categoryID"=c."categoryID"
       WHERE t."userID"=$1
       ORDER BY t."purchaseTimestamp" DESC
       LIMIT $2 OFFSET $3`,
      [req.user.userID, limit, offset]
    );
    res.json({ tickets: result.rows, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// GET /api/tickets/:id
const getTicket = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT t.*, e.title AS "eventTitle", e."eventDate", e."eventTime", e.location, e.description,
              e."ticketPrice", e."bannerImage", c.name AS "categoryName",
              u."fullName" AS "attendeeName", u.email AS "attendeeEmail"
       FROM tickets t
       JOIN events e ON t."eventID"=e."eventID"
       JOIN categories c ON e."categoryID"=c."categoryID"
       JOIN users u ON t."userID"=u."userID"
       WHERE t."ticketID"=$1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Ticket not found' });
    const ticket = result.rows[0];
    // Check ownership or admin
    if (ticket.userID !== req.user.userID && !['Administrator','Organizer'].includes(req.user.role))
      return res.status(403).json({ message: 'Access denied' });
    res.json({ ticket });
  } catch (err) { next(err); }
};

// PATCH /api/tickets/:id/cancel
const cancelTicket = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT t.*, e."eventDate" FROM tickets t JOIN events e ON t."eventID"=e."eventID" WHERE t."ticketID"=$1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Ticket not found' });
    const ticket = result.rows[0];
    if (ticket.userID !== req.user.userID && req.user.role !== 'Administrator')
      return res.status(403).json({ message: 'Not authorized' });
    if (ticket.ticketStatus !== 'Valid')
      return res.status(400).json({ message: `Ticket is already ${ticket.ticketStatus}` });
    if (new Date(ticket.eventDate) <= new Date())
      return res.status(400).json({ message: 'Cannot cancel ticket for a past event' });

    await pool.query(`UPDATE tickets SET "ticketStatus"='Cancelled' WHERE "ticketID"=$1`, [req.params.id]);
    await pool.query(`UPDATE events SET "ticketsSold"=GREATEST("ticketsSold"-$1,0) WHERE "eventID"=$2`, [ticket.quantity, ticket.eventID]);

    res.json({ message: 'Ticket cancelled successfully' });
  } catch (err) { next(err); }
};

// GET /api/tickets/:id/pdf
const downloadTicketPDF = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT t.*, e.title AS "eventTitle", e."eventDate", e."eventTime", e.location,
              u."fullName" AS "attendeeName"
       FROM tickets t
       JOIN events e ON t."eventID"=e."eventID"
       JOIN users u ON t."userID"=u."userID"
       WHERE t."ticketID"=$1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Ticket not found' });
    const ticket = result.rows[0];

    const pdfBuffer = await generateTicketPDF({
      bookingRef: ticket.bookingReference,
      fullName: ticket.attendeeName,
      eventTitle: ticket.eventTitle,
      eventDate: new Date(ticket.eventDate).toLocaleDateString('en-UG'),
      eventTime: ticket.eventTime,
      location: ticket.location,
      quantity: ticket.quantity,
      qrCodeDataUrl: ticket.qrCode,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ticket-${ticket.bookingReference}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) { next(err); }
};

// GET /api/tickets/event/:eventID  (Organizer)
const getTicketsByEvent = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const eventCheck = await pool.query(`SELECT "organizerID" FROM events WHERE "eventID"=$1`, [req.params.eventID]);
    if (!eventCheck.rows.length) return res.status(404).json({ message: 'Event not found' });
    if (eventCheck.rows[0].organizerID !== req.user.userID && req.user.role !== 'Administrator')
      return res.status(403).json({ message: 'Access denied' });

    const countRes = await pool.query(`SELECT COUNT(*) FROM tickets WHERE "eventID"=$1`, [req.params.eventID]);
    const total = parseInt(countRes.rows[0].count);

    const result = await pool.query(
      `SELECT t.*, u."fullName", u.email
       FROM tickets t JOIN users u ON t."userID"=u."userID"
       WHERE t."eventID"=$1
       ORDER BY t."purchaseTimestamp" DESC
       LIMIT $2 OFFSET $3`,
      [req.params.eventID, limit, offset]
    );
    res.json({ tickets: result.rows, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

module.exports = { purchaseTicket, getMyTickets, getTicket, cancelTicket, downloadTicketPDF, getTicketsByEvent };
