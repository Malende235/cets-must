const pool = require('../config/db');

// GET /api/audit-logs  (Admin)
const getAuditLogs = async (req, res, next) => {
  try {
    const { from, to, userID, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    let conditions = [];
    let params = [];
    let idx = 1;

    if (from && to) { conditions.push(`al.timestamp BETWEEN $${idx} AND $${idx+1}`); params.push(from, to); idx += 2; }
    if (userID)     { conditions.push(`al."userID" = $${idx}`); params.push(userID); idx++; }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await pool.query(`SELECT COUNT(*) FROM audit_logs al ${where}`, params);
    const total = parseInt(countRes.rows[0].count);

    params.push(limit, offset);
    const result = await pool.query(
      `SELECT al.*, u."fullName", u.email, u.role
       FROM audit_logs al LEFT JOIN users u ON al."userID"=u."userID"
       ${where}
       ORDER BY al.timestamp DESC
       LIMIT $${idx} OFFSET $${idx+1}`,
      params
    );
    res.json({ logs: result.rows, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// GET /api/notifications/my
const getMyNotifications = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT n.*, e.title AS "eventTitle"
       FROM notifications n LEFT JOIN events e ON n."eventID"=e."eventID"
       WHERE n."userID"=$1
       ORDER BY n."sentTimestamp" DESC
       LIMIT 20`,
      [req.user.userID]
    );
    res.json({ notifications: result.rows });
  } catch (err) { next(err); }
};

// PATCH /api/notifications/read-all
const markAllRead = async (req, res, next) => {
  try {
    await pool.query(`UPDATE notifications SET "isRead"=TRUE WHERE "userID"=$1`, [req.user.userID]);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};

// GET /api/admin/stats
const getAdminStats = async (req, res, next) => {
  try {
    const [users, events, revenue, tickets] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM users`),
      pool.query(`SELECT COUNT(*) FROM events WHERE status='Upcoming'`),
      pool.query(`SELECT COALESCE(SUM("amountPaid"),0) AS total FROM transactions WHERE "paymentStatus"='Success'`),
      pool.query(`SELECT COUNT(*) FROM tickets WHERE "ticketStatus"='Valid'`),
    ]);
    res.json({
      totalUsers: parseInt(users.rows[0].count),
      activeEvents: parseInt(events.rows[0].count),
      totalRevenue: parseFloat(revenue.rows[0].total),
      activeTickets: parseInt(tickets.rows[0].count),
    });
  } catch (err) { next(err); }
};

// GET /api/organizer/stats
const getOrganizerStats = async (req, res, next) => {
  try {
    const uid = req.user.userID;
    const [totalEvents, activeEvents, revenue, soldTickets] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM events WHERE "organizerID"=$1`, [uid]),
      pool.query(`SELECT COUNT(*) FROM events WHERE "organizerID"=$1 AND status='Upcoming'`, [uid]),
      pool.query(`SELECT COALESCE(SUM(tx."amountPaid"),0) AS total FROM transactions tx JOIN events e ON tx."eventID"=e."eventID" WHERE e."organizerID"=$1 AND tx."paymentStatus"='Success'`, [uid]),
      pool.query(`SELECT COALESCE(SUM("ticketsSold"),0) AS total FROM events WHERE "organizerID"=$1`, [uid]),
    ]);
    res.json({
      totalEvents: parseInt(totalEvents.rows[0].count),
      activeEvents: parseInt(activeEvents.rows[0].count),
      totalRevenue: parseFloat(revenue.rows[0].total),
      totalTicketsSold: parseInt(soldTickets.rows[0].total),
    });
  } catch (err) { next(err); }
};

// GET /api/organizer/audit-logs  (Organizer – own actions only)
const getOrganizerAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const offset = (page - 1) * limit;
    const uid = req.user.userID;

    const countRes = await pool.query(`SELECT COUNT(*) FROM audit_logs WHERE "userID"=$1`, [uid]);
    const total = parseInt(countRes.rows[0].count);

    const result = await pool.query(
      `SELECT al.*, u."fullName", u.email, u.role
       FROM audit_logs al LEFT JOIN users u ON al."userID"=u."userID"
       WHERE al."userID"=$1
       ORDER BY al.timestamp DESC
       LIMIT $2 OFFSET $3`,
      [uid, limit, offset]
    );
    res.json({ logs: result.rows, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

module.exports = { getAuditLogs, getMyNotifications, markAllRead, getAdminStats, getOrganizerStats, getOrganizerAuditLogs };
