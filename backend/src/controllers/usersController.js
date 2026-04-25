const pool = require('../config/db');

// GET /api/users  (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    let conditions = [];
    let params = [];
    let idx = 1;

    if (search) { conditions.push(`("fullName" ILIKE $${idx} OR email ILIKE $${idx})`); params.push(`%${search}%`); idx++; }
    if (role)   { conditions.push(`role = $${idx}`); params.push(role); idx++; }
    if (status) { conditions.push(`"accountStatus" = $${idx}`); params.push(status); idx++; }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await pool.query(`SELECT COUNT(*) FROM users ${where}`, params);
    const total = parseInt(countRes.rows[0].count);

    params.push(limit, offset);
    const result = await pool.query(
      `SELECT "userID","fullName",email,role,"accountStatus","registrationDate"
       FROM users ${where} ORDER BY "registrationDate" DESC LIMIT $${idx} OFFSET $${idx+1}`,
      params
    );

    res.json({ users: result.rows, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// PATCH /api/users/:id/status  (Admin)
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { accountStatus } = req.body;
    const allowed = ['Active', 'Inactive', 'Suspended'];
    if (!allowed.includes(accountStatus))
      return res.status(400).json({ message: 'Invalid status' });

    const result = await pool.query(
      `UPDATE users SET "accountStatus"=$1 WHERE "userID"=$2 RETURNING "userID","fullName",email,role,"accountStatus"`,
      [accountStatus, id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User status updated', user: result.rows[0] });
  } catch (err) { next(err); }
};

// DELETE /api/users/:id  (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM users WHERE "userID"=$1 RETURNING "userID"`, [id]);
    if (!result.rows.length) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAllUsers, updateUserStatus, deleteUser };
