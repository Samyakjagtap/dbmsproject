-- ============================================================
--  EXPENSE TRACKER - MySQL Database Schema
--  Run this file in your MySQL client to set up the database
--    mysql -u root -p < database/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS expense_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE expense_tracker;

-- ─── USERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)        NOT NULL,
  email         VARCHAR(150)        NOT NULL UNIQUE,
  password_hash VARCHAR(255)        NOT NULL,
  avatar_url    VARCHAR(500)        DEFAULT NULL,
  balance_limit DECIMAL(12, 2)      NOT NULL DEFAULT 1000.00,
  created_at    TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP           DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── CATEGORIES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT           NOT NULL,
  name       VARCHAR(100)  NOT NULL,
  icon       VARCHAR(50)   DEFAULT 'tag',
  color      VARCHAR(20)   DEFAULT '#6366f1',
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── TRANSACTIONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT               NOT NULL,
  category_id   INT               DEFAULT NULL,
  type          ENUM('income','expense') NOT NULL,
  amount        DECIMAL(12, 2)    NOT NULL,
  description   VARCHAR(255)      DEFAULT NULL,
  date          DATE              NOT NULL,
  created_at    TIMESTAMP         DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP         DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ─── BALANCE VIEW ─────────────────────────────────────────────
CREATE OR REPLACE VIEW user_balance AS
  SELECT
    u.id                                                    AS user_id,
    u.name,
    u.balance_limit,
    COALESCE(SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS total_expenses,
    COALESCE(SUM(CASE WHEN t.type = 'income'  THEN  t.amount
                      WHEN t.type = 'expense' THEN -t.amount
                      ELSE 0 END), 0)                       AS balance
  FROM users u
  LEFT JOIN transactions t ON t.user_id = u.id
  GROUP BY u.id, u.name, u.balance_limit;

-- ─── SEED: Demo user ──────────────────────────────────────────
INSERT IGNORE INTO users (id, name, email, password_hash, balance_limit)
VALUES (1, 'Demo User', 'demo@example.com',
        '$2b$10$examplehashedpassword',
        1000.00);

-- ─── SEED: Default categories ─────────────────────────────────
INSERT IGNORE INTO categories (id, user_id, name, icon, color) VALUES
  (1, 1, 'Food & Dining',  'utensils',    '#f59e0b'),
  (2, 1, 'Transport',      'car',         '#3b82f6'),
  (3, 1, 'Shopping',       'shopping-bag','#8b5cf6'),
  (4, 1, 'Entertainment',  'film',        '#ec4899'),
  (5, 1, 'Health',         'heart',       '#10b981'),
  (6, 1, 'Utilities',      'zap',         '#6366f1'),
  (7, 1, 'Salary',         'briefcase',   '#22c55e'),
  (8, 1, 'Freelance',      'laptop',      '#14b8a6');

-- ─── SEED: Sample transactions ────────────────────────────────
INSERT IGNORE INTO transactions (user_id, category_id, type, amount, description, date) VALUES
  (1, 7, 'income',  5000.00, 'Monthly Salary',        DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
  (1, 1, 'expense',  120.00, 'Groceries',              DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
  (1, 2, 'expense',   45.00, 'Uber ride',              DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
  (1, 4, 'expense',   15.00, 'Netflix subscription',   CURDATE()),
  (1, 8, 'income',  1200.00, 'Freelance project',      CURDATE());
