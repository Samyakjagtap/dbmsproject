# Expense Tracker — MySQL Backend Integration

## What's included

```
expense-tracker-backend/
├── database/
│   └── schema.sql               ← Run this to create your MySQL DB
├── src/
│   ├── server.js                ← Express entry point
│   ├── config/db.js             ← MySQL connection pool
│   ├── middleware/auth.js       ← JWT auth guard
│   └── routes/
│       ├── auth.js              ← POST /api/auth/register|login
│       ├── transactions.js      ← GET/POST/PUT/DELETE /api/transactions
│       └── user.js              ← /api/categories  /api/user/*
├── frontend-integration/
│   └── src/app/
│       ├── services/api.ts      ← Drop into your Figma Make project
│       ├── components/LowBalanceAlert.tsx
│       ├── pages/add-transaction.tsx
│       └── pages/dashboard.tsx
├── .env.example
└── package.json
```

---

## Step 1 — Set up the MySQL database

```bash
# In MySQL client or terminal:
mysql -u root -p < database/schema.sql
```

This creates:
- `expense_tracker` database
- `users`, `categories`, `transactions` tables
- `user_balance` view (auto-computes balance)
- Seed data (demo user + default categories)

---

## Step 2 — Configure the backend

```bash
cd expense-tracker-backend
cp .env.example .env
# Edit .env and fill in your MySQL credentials + JWT secret
npm install
npm run dev      # starts on http://localhost:5000
```

---

## Step 3 — Connect the frontend (Figma Make)

1. Copy `frontend-integration/src/app/services/api.ts` into your project
2. Copy `frontend-integration/src/app/components/LowBalanceAlert.tsx`
3. Replace your `pages/add-transaction.tsx` with the new version
4. Replace your `pages/dashboard.tsx` with the new version
5. Add to your Figma Make project's `.env` (or `vite.config`):
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

---

## API Reference

| Method | Endpoint                  | Auth | Description                          |
|--------|---------------------------|------|--------------------------------------|
| POST   | /api/auth/register        | ✗    | Create account                       |
| POST   | /api/auth/login           | ✗    | Login → returns JWT                  |
| GET    | /api/transactions         | ✓    | List all transactions                |
| POST   | /api/transactions         | ✓    | Add transaction (returns balance)    |
| PUT    | /api/transactions/:id     | ✓    | Update transaction                   |
| DELETE | /api/transactions/:id     | ✓    | Delete transaction                   |
| GET    | /api/categories           | ✓    | List categories                      |
| POST   | /api/categories           | ✓    | Create category                      |
| DELETE | /api/categories/:id       | ✓    | Delete category                      |
| GET    | /api/user/profile         | ✓    | Get user profile                     |
| PUT    | /api/user/profile         | ✓    | Update name / balance_limit          |
| GET    | /api/user/balance         | ✓    | Current balance + lowBalanceAlert    |
| GET    | /api/user/dashboard       | ✓    | Full dashboard stats                 |

---

## Low Balance Alert

- Each user has a `balance_limit` (default ₹1,000, configurable from Profile page)
- Every time a transaction is added, the API returns `lowBalanceAlert: true/false`
- The `<LowBalanceAlert />` component shows a slide-in popup in the top-right corner
- The alert auto-dismisses when the user clicks ✕ and reappears if balance changes again
