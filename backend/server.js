require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const authRoutes        = require('./auth');
const userRoutes        = require('./user');
const transactionRoutes = require('./transactions');

const app = express();

// ── Middleware ──────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ─────────────────────────────────────────────────────
// Root endpoint
app.get('/', (_, res) => {
  res.json({
    message: 'Expense Tracker API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      transactions: '/api/transactions',
      user: '/api',
      health: '/health'
    }
  });
});

app.use('/api/auth',         authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api',              userRoutes);   // /api/categories, /api/user/*

// ── Health check ───────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// ── Start ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅  Server running on http://localhost:${PORT}`));
