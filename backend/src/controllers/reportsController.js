const pool = require('../config/db');

// GET /api/reports/events
const eventsReport = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    let cond = '', params = [];
    if (from && to) { cond = `WHERE e."eventDate" BETWEEN $1 AND $2`; params = [from, to]; }
    const result = await pool.query(
      `SELECT e."eventID", e.title, e."eventDate", e.location, e.status,
              e."ticketsSold", e."totalCapacity", e."ticketPrice",
              (e."ticketsSold" * e."ticketPrice") AS revenue,
              c.name AS "categoryName", u."fullName" AS "organizerName"
       FROM events e
       JOIN categories c ON e."categoryID"=c."categoryID"
       JOIN users u ON e."organizerID"=u."userID"
       ${cond}
       ORDER BY e."eventDate" DESC`,
      params
    );
    const summary = {
      totalEvents: result.rows.length,
      totalRevenue: result.rows.reduce((s, r) => s + parseFloat(r.revenue || 0), 0),
      totalTicketsSold: result.rows.reduce((s, r) => s + parseInt(r.ticketsSold || 0), 0),
      byStatus: result.rows.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {}),
    };
    res.json({ events: result.rows, summary });
  } catch (err) { next(err); }
};

// GET /api/reports/sales
const salesReport = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    let cond = `WHERE tx."paymentStatus"='Success'`;
    let params = [];
    if (from && to) { cond += ` AND tx."transactionDate" BETWEEN $1 AND $2`; params = [from, to]; }

    const result = await pool.query(
      `SELECT DATE(tx."transactionDate") AS date, SUM(tx."amountPaid") AS revenue,
              COUNT(*) AS transactions, SUM(tx.quantity) AS ticketsSold
       FROM transactions tx ${cond}
       GROUP BY DATE(tx."transactionDate")
       ORDER BY date DESC`,
      params
    );

    const totals = await pool.query(
      `SELECT SUM("amountPaid") AS "totalRevenue", COUNT(*) AS "totalTransactions", SUM(quantity) AS "totalTickets"
       FROM transactions ${cond.replace('tx.', '')}`,
      params
    );

    res.json({ salesByDay: result.rows, summary: totals.rows[0] });
  } catch (err) { next(err); }
};

// GET /api/reports/users
const usersReport = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    let cond = '', params = [];
    if (from && to) { cond = `WHERE "registrationDate" BETWEEN $1 AND $2`; params = [from, to]; }

    const result = await pool.query(
      `SELECT DATE("registrationDate") AS date, role, COUNT(*) AS count
       FROM users ${cond}
       GROUP BY DATE("registrationDate"), role
       ORDER BY date DESC`,
      params
    );

    const totals = await pool.query(
      `SELECT role, COUNT(*) AS count, "accountStatus"
       FROM users GROUP BY role, "accountStatus" ORDER BY role`
    );

    res.json({ registrationsByDay: result.rows, byRoleAndStatus: totals.rows });
  } catch (err) { next(err); }
};

// GET /api/reports/organizer/events  (Organizer)
const orgEventsReport = async (req, res, next) => {
  try {
    const uid = req.user.userID;
    const { from, to } = req.query;
    let cond = `WHERE e."organizerID"=$1`;
    let params = [uid];
    if (from && to) { cond += ` AND e."eventDate" BETWEEN $2 AND $3`; params.push(from, to); }
    const result = await pool.query(
      `SELECT e."eventID", e.title, e."eventDate", e.location, e.status,
              e."ticketsSold", e."totalCapacity", e."ticketPrice",
              (e."ticketsSold" * e."ticketPrice") AS revenue,
              c.name AS "categoryName"
       FROM events e
       JOIN categories c ON e."categoryID"=c."categoryID"
       ${cond}
       ORDER BY e."eventDate" DESC`,
      params
    );
    const summary = {
      totalEvents: result.rows.length,
      totalRevenue: result.rows.reduce((s, r) => s + parseFloat(r.revenue || 0), 0),
      totalTicketsSold: result.rows.reduce((s, r) => s + parseInt(r.ticketsSold || 0), 0),
      byStatus: result.rows.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {}),
    };
    res.json({ events: result.rows, summary });
  } catch (err) { next(err); }
};

// GET /api/reports/organizer/sales  (Organizer)
const orgSalesReport = async (req, res, next) => {
  try {
    const uid = req.user.userID;
    const { from, to } = req.query;
    let cond = `WHERE e."organizerID"=$1 AND tx."paymentStatus"='Success'`;
    let params = [uid];
    if (from && to) { cond += ` AND tx."transactionDate" BETWEEN $2 AND $3`; params.push(from, to); }

    const result = await pool.query(
      `SELECT DATE(tx."transactionDate") AS date, SUM(tx."amountPaid") AS revenue,
              COUNT(*) AS transactions, SUM(tx.quantity) AS "ticketsSold"
       FROM transactions tx
       JOIN events e ON tx."eventID"=e."eventID"
       ${cond}
       GROUP BY DATE(tx."transactionDate")
       ORDER BY date DESC`,
      params
    );

    const totals = await pool.query(
      `SELECT COALESCE(SUM(tx."amountPaid"),0) AS "totalRevenue",
              COUNT(*) AS "totalTransactions",
              COALESCE(SUM(tx.quantity),0) AS "totalTickets"
       FROM transactions tx
       JOIN events e ON tx."eventID"=e."eventID"
       ${cond}`,
      params
    );

    res.json({ salesByDay: result.rows, summary: totals.rows[0] });
  } catch (err) { next(err); }
};

module.exports = { eventsReport, salesReport, usersReport, orgEventsReport, orgSalesReport };
