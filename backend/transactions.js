const router = require('express').Router();
const db     = require('./db')
const auth   = require('./auth')

// GET /api/transactions  – all transactions for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
      FROM transactions t
      LEFT JOIN categories c ON c.id = t.category_id
      WHERE t.user_id = ?
      ORDER BY t.date DESC, t.created_at DESC
    `, [req.userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions  – add new transaction
router.post('/', auth, async (req, res) => {
  const { type, amount, description, date, category_id } = req.body;
  if (!type || !amount || !date)
    return res.status(400).json({ error: 'type, amount and date are required' });

  try {
    const [result] = await db.query(
      'INSERT INTO transactions (user_id, category_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?)',
      [req.userId, category_id || null, type, amount, description || null, date]
    );

    // Fetch updated balance and check low-balance alert
    const [balanceRows] = await db.query(
      'SELECT balance, balance_limit FROM user_balance WHERE user_id = ?',
      [req.userId]
    );
    const { balance, balance_limit } = balanceRows[0];
    const lowBalance = balance < balance_limit;

    res.status(201).json({
      id: result.insertId,
      message: 'Transaction added',
      balance,
      lowBalanceAlert: lowBalance,
      balance_limit
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/transactions/:id  – update a transaction
router.put('/:id', auth, async (req, res) => {
  const { type, amount, description, date, category_id } = req.body;
  try {
    const [check] = await db.query(
      'SELECT id FROM transactions WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (!check.length) return res.status(404).json({ error: 'Transaction not found' });

    await db.query(
      'UPDATE transactions SET type=?, amount=?, description=?, date=?, category_id=? WHERE id=?',
      [type, amount, description, date, category_id || null, req.params.id]
    );
    res.json({ message: 'Transaction updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const [check] = await db.query(
      'SELECT id FROM transactions WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (!check.length) return res.status(404).json({ error: 'Transaction not found' });

    await db.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
