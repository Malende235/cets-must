const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { generateToken, COOKIE_OPTIONS } = require('../config/jwt');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password || !role)
      return res.status(400).json({ message: 'All fields are required' });

    const allowedRoles = ['Student', 'Organizer'];
    if (!allowedRoles.includes(role))
      return res.status(400).json({ message: 'Role must be Student or Organizer' });

    const exists = await pool.query('SELECT "userID" FROM users WHERE email = $1', [email]);
    if (exists.rows.length)
      return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users ("fullName", email, "passwordHash", role) VALUES ($1,$2,$3,$4) RETURNING "userID","fullName",email,role,"accountStatus","registrationDate"`,
      [fullName, email, passwordHash, role]
    );

    const user = result.rows[0];
    const token = generateToken({ userID: user.userID, role: user.role });
    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(201).json({ message: 'Registration successful', user, token });
  } catch (err) { next(err); }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    if (!result.rows.length)
      return res.status(401).json({ message: 'Invalid credentials' });

    const user = result.rows[0];
    if (user.accountStatus === 'Suspended')
      return res.status(403).json({ message: 'Account suspended. Contact administrator.' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken({ userID: user.userID, role: user.role });
    res.cookie('token', token, COOKIE_OPTIONS);

    const { passwordHash, ...safeUser } = user;
    res.json({ message: 'Login successful', user: safeUser, token });
  } catch (err) { next(err); }
};

// POST /api/auth/logout
const logout = (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
  res.json({ message: 'Logged out successfully' });
};

// GET /api/auth/me
const me = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT "userID","fullName",email,role,"accountStatus","registrationDate" FROM users WHERE "userID"=$1`,
      [req.user.userID]
    );
    res.json({ user: result.rows[0] });
  } catch (err) { next(err); }
};

module.exports = { register, login, logout, me };
