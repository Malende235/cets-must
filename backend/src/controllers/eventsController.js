const pool = require('../config/db');

// GET /api/events
const getEvents = async (req, res, next) => {
  try {
    const { search, category, date, price, status = 'Upcoming', page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    let conditions = [`e.status != 'Cancelled'`];
    let params = [];
    let idx = 1;

    if (status && status !== 'all') { conditions.push(`e.status = $${idx}`); params.push(status); idx++; }
    if (search) { conditions.push(`(e.title ILIKE $${idx} OR e.description ILIKE $${idx} OR e.location ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
    if (category) { conditions.push(`c.name ILIKE $${idx}`); params.push(`%${category}%`); idx++; }
    if (date) { conditions.push(`e."eventDate" = $${idx}`); params.push(date); idx++; }
    if (price === 'free') { conditions.push(`e."ticketPrice" = 0`); }
    if (price === 'paid') { conditions.push(`e."ticketPrice" > 0`); }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM events e JOIN categories c ON e."categoryID"=c."categoryID" ${where}`, params
    );
    const total = parseInt(countRes.rows[0].count);

    params.push(limit, offset);
    const result = await pool.query(
      `SELECT e.*, c.name AS "categoryName", u."fullName" AS "organizerName"
       FROM events e
       JOIN categories c ON e."categoryID"=c."categoryID"
       JOIN users u ON e."organizerID"=u."userID"
       ${where}
       ORDER BY e."eventDate" ASC, e."eventTime" ASC
       LIMIT $${idx} OFFSET $${idx+1}`,
      params
    );

    res.json({ events: result.rows, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// GET /api/events/:id
const getEvent = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT e.*, c.name AS "categoryName", u."fullName" AS "organizerName", u.email AS "organizerEmail"
       FROM events e
       JOIN categories c ON e."categoryID"=c."categoryID"
       JOIN users u ON e."organizerID"=u."userID"
       WHERE e."eventID"=$1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Event not found' });
    res.json({ event: result.rows[0] });
  } catch (err) { next(err); }
};

// GET /api/events/categories
const getCategories = async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT * FROM categories ORDER BY name`);
    res.json({ categories: result.rows });
  } catch (err) { next(err); }
};

// POST /api/events  (Organizer)
const createEvent = async (req, res, next) => {
  try {
    const { title, description, categoryID, eventDate, eventTime, location, ticketPrice, totalCapacity } = req.body;
    if (!title || !categoryID || !eventDate || !eventTime || !location)
      return res.status(400).json({ message: 'Missing required fields' });

    const bannerImage = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO events ("organizerID","categoryID",title,description,"eventDate","eventTime",location,"ticketPrice","totalCapacity","bannerImage")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [req.user.userID, categoryID, title, description || '', eventDate, eventTime, location,
       ticketPrice || 0, totalCapacity || 100, bannerImage]
    );
    res.status(201).json({ message: 'Event created', event: result.rows[0] });
  } catch (err) { next(err); }
};

// PUT /api/events/:id  (Organizer – own events only)
const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await pool.query(`SELECT * FROM events WHERE "eventID"=$1`, [id]);
    if (!existing.rows.length) return res.status(404).json({ message: 'Event not found' });

    const event = existing.rows[0];
    if (event.organizerID !== req.user.userID && req.user.role !== 'Administrator')
      return res.status(403).json({ message: 'Not authorized to edit this event' });

    const { title, description, categoryID, eventDate, eventTime, location, ticketPrice, totalCapacity, status } = req.body;
    const bannerImage = req.file ? `/uploads/${req.file.filename}` : event.bannerImage;

    const result = await pool.query(
      `UPDATE events SET title=COALESCE($1,title), description=COALESCE($2,description),
       "categoryID"=COALESCE($3,"categoryID"), "eventDate"=COALESCE($4,"eventDate"),
       "eventTime"=COALESCE($5,"eventTime"), location=COALESCE($6,location),
       "ticketPrice"=COALESCE($7,"ticketPrice"), "totalCapacity"=COALESCE($8,"totalCapacity"),
       status=COALESCE($9,status), "bannerImage"=COALESCE($10,"bannerImage")
       WHERE "eventID"=$11 RETURNING *`,
      [title, description, categoryID, eventDate, eventTime, location, ticketPrice, totalCapacity, status, bannerImage, id]
    );
    res.json({ message: 'Event updated', event: result.rows[0] });
  } catch (err) { next(err); }
};

// PATCH /api/events/:id/cancel
const cancelEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await pool.query(`SELECT * FROM events WHERE "eventID"=$1`, [id]);
    if (!existing.rows.length) return res.status(404).json({ message: 'Event not found' });

    const event = existing.rows[0];
    if (event.organizerID !== req.user.userID && req.user.role !== 'Administrator')
      return res.status(403).json({ message: 'Not authorized to cancel this event' });

    await pool.query(`UPDATE events SET status='Cancelled' WHERE "eventID"=$1`, [id]);
    // Cancel all valid tickets for this event
    await pool.query(`UPDATE tickets SET "ticketStatus"='Cancelled' WHERE "eventID"=$1 AND "ticketStatus"='Valid'`, [id]);

    res.json({ message: 'Event cancelled successfully' });
  } catch (err) { next(err); }
};

// DELETE /api/events/:id  (Admin only)
const deleteEvent = async (req, res, next) => {
  try {
    const result = await pool.query(`DELETE FROM events WHERE "eventID"=$1 RETURNING "eventID"`, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) { next(err); }
};

// GET /api/events/my  (Organizer)
const getMyEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const countRes = await pool.query(`SELECT COUNT(*) FROM events WHERE "organizerID"=$1`, [req.user.userID]);
    const total = parseInt(countRes.rows[0].count);

    const result = await pool.query(
      `SELECT e.*, c.name AS "categoryName"
       FROM events e JOIN categories c ON e."categoryID"=c."categoryID"
       WHERE e."organizerID"=$1
       ORDER BY e."createdDate" DESC LIMIT $2 OFFSET $3`,
      [req.user.userID, limit, offset]
    );
    res.json({ events: result.rows, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

module.exports = { getEvents, getEvent, getCategories, createEvent, updateEvent, cancelEvent, deleteEvent, getMyEvents };
