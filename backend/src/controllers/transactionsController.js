const pool = require('../config/db');

// GET /api/transactions/my
const getMyTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const countRes = await pool.query(`SELECT COUNT(*) FROM transactions WHERE "userID"=$1`, [req.user.userID]);
    const total = parseInt(countRes.rows[0].count);

    const result = await pool.query(
      `SELECT tx.*, e.title AS "eventTitle", e."eventDate"
       FROM transactions tx JOIN events e ON tx."eventID"=e."eventID"
       WHERE tx."userID"=$1
       ORDER BY tx."transactionDate" DESC
       LIMIT $2 OFFSET $3`,
      [req.user.userID, limit, offset]
    );
    res.json({ transactions: result.rows, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// GET /api/transactions  (Admin)
const getAllTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    let where = '', params = [];
    if (status) { where = `WHERE tx."paymentStatus"=$1`; params.push(status); }

    const countRes = await pool.query(`SELECT COUNT(*) FROM transactions tx ${where}`, params);
    const total = parseInt(countRes.rows[0].count);

    params.push(limit, offset);
    const p = params.length;
    const result = await pool.query(
      `SELECT tx.*, e.title AS "eventTitle", u."fullName" AS "userName", u.email
       FROM transactions tx
       JOIN events e ON tx."eventID"=e."eventID"
       JOIN users u ON tx."userID"=u."userID"
       ${where}
       ORDER BY tx."transactionDate" DESC
       LIMIT $${p-1} OFFSET $${p}`,
      params
    );
    res.json({ transactions: result.rows, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

module.exports = { getMyTransactions, getAllTransactions };
