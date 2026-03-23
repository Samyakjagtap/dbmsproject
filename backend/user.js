const router = require('express').Router();
const db     = require('./db')
const authRoute = require('./auth');
const auth = authRoute.authMiddleware;
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Configure multer for avatar uploads
const uploadsDir = path.join(__dirname, 'uploads', 'avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.userId}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// ── Categories (Global - shared by all users) ─────────────────

// GET /api/categories - returns global categories (user_id = 1)
router.get('/categories', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, type, icon, color FROM categories WHERE user_id = 1 ORDER BY type, name'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categories - adds to global categories
router.post('/categories', auth, async (req, res) => {
  const { name, type = 'expense', icon = 'tag', color = '#6366f1' } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ error: 'type must be income or expense' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO categories (user_id, name, type, icon, color) VALUES (1, ?, ?, ?, ?)',
      [name, type, icon, color]
    );
    res.status(201).json({ id: result.insertId, name, type, icon, color });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/categories/:id - deletes from global categories
router.delete('/categories/:id', auth, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM categories WHERE id = ? AND user_id = 1',
      [req.params.id]
    );
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── User Profile & Balance ─────────────────────────────────────

// GET /api/user/profile
router.get('/user/profile', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, avatar_url, balance_limit FROM users WHERE id = ?',
      [req.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/user/profile  – update name, avatar, balance_limit
router.put('/user/profile', auth, async (req, res) => {
  const { name, avatar_url, balance_limit } = req.body;
  try {
    await db.query(
      'UPDATE users SET name=COALESCE(?,name), avatar_url=COALESCE(?,avatar_url), balance_limit=COALESCE(?,balance_limit) WHERE id=?',
      [name || null, avatar_url || null, balance_limit || null, req.userId]
    );
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/user/balance  – current balance + low-balance alert flag
router.get('/user/balance', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT balance, total_income, total_expenses, balance_limit FROM user_balance WHERE user_id = ?',
      [req.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    const data = rows[0];
    res.json({
      ...data,
      lowBalanceAlert: Number(data.balance) < Number(data.balance_limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/user/dashboard  – summary stats for the dashboard
router.get('/user/dashboard', auth, async (req, res) => {
  try {
    const [balance] = await db.query(
      'SELECT balance, total_income, total_expenses, balance_limit FROM user_balance WHERE user_id = ?',
      [req.userId]
    );

    const [recentTx] = await db.query(`
      SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
      FROM transactions t
      LEFT JOIN categories c ON c.id = t.category_id
      WHERE t.user_id = ?
      ORDER BY t.date DESC, t.created_at DESC
      LIMIT 5
    `, [req.userId]);

    const [categoryBreakdown] = await db.query(`
      SELECT c.name, c.color, SUM(t.amount) AS total
      FROM transactions t
      JOIN categories c ON c.id = t.category_id
      WHERE t.user_id = ? AND t.type = 'expense'
      GROUP BY c.id, c.name, c.color
      ORDER BY total DESC
    `, [req.userId]);

    const b = balance[0] || { balance: 0, total_income: 0, total_expenses: 0, balance_limit: 1000 };
    res.json({
      balance:          Number(b.balance),
      total_income:     Number(b.total_income),
      total_expenses:   Number(b.total_expenses),
      balance_limit:    Number(b.balance_limit),
      lowBalanceAlert:  Number(b.balance) < Number(b.balance_limit),
      recent_transactions: recentTx,
      category_breakdown:  categoryBreakdown
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/user/avatar  – upload profile avatar
router.post('/user/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Delete old avatar if exists
    const [oldRows] = await db.query('SELECT avatar_url FROM users WHERE id = ?', [req.userId]);
    if (oldRows.length && oldRows[0].avatar_url) {
      const oldPath = path.join(__dirname, oldRows[0].avatar_url.replace('/uploads/', 'uploads/'));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const avatar_url = `/uploads/avatars/${req.file.filename}`;
    await db.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatar_url, req.userId]);

    res.json({ avatar_url, message: 'Avatar uploaded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
