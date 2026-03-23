# Complete MySQL Database Setup Guide for Expense Tracker

## 🎯 Quick Overview
Your project is **already configured** for MySQL. This guide will walk you through final setup steps to get everything working.

---

## ✅ Phase 1: Database Setup

### Step 1: Install MySQL (if not already installed)
- Download from: https://dev.mysql.com/downloads/mysql/
- Or use WSL: `wsl apt install mysql-server`

### Step 2: Start MySQL Service
**Windows:**
```bash
# Start MySQL service
net start MySQL80
```

**WSL/Linux:**
```bash
sudo service mysql start
```

### Step 3: Create Database & Tables
Run this command in your terminal:
```bash
cd backend
mysql -u root -p < schema.sql
```
- Enter password: `sanskar@4343` (from `.env`)
- This creates: `expense_tracker` database with all tables

### Step 4: Verify Database Setup
```bash
mysql -u root -p
```
Then in MySQL:
```sql
USE expense_tracker;
SHOW TABLES;
SELECT * FROM users;
```

---

## ✅ Phase 2: Backend Setup

### Step 5: Install Node Dependencies
```bash
cd backend
npm install
```

### Step 6: Verify `.env` Configuration
File: `backend/.env`
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sanskar@4343
DB_NAME=expense_tracker
JWT_SECRET=your_super_secret_jwt_key_change_this
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### Step 7: Start Backend Server
```bash
cd backend
npm run dev
```
You should see: `✅ Server running on http://localhost:5000`

### Step 8: Test Backend Connection
```bash
curl http://localhost:5000/health
```
Expected response: `{"status":"ok"}`

---

## ✅ Phase 3: Frontend Setup

### Step 9: Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Step 10: Create Frontend `.env` (if needed)
File: `frontend/.env` or `.env.local`
```
VITE_API_URL=http://localhost:5000/api
```

### Step 11: Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Open: http://localhost:5173

---

## ✅ Phase 4: Test Complete Flow

### Step 12: Register a New User
1. Go to http://localhost:5173
2. Click "Register"
3. Fill in: Name, Email, Password, Balance Limit
4. Submit
5. You should be redirected to dashboard

### Step 13: Add a Transaction
1. On dashboard, click "Add Transaction"
2. Fill in:
   - Type: Income or Expense
   - Amount: Any number
   - Category: Select from dropdown
   - Date: Pick a date
   - Description: (optional)
3. Submit
4. Should see transaction appear in list

### Step 14: Verify Database
In MySQL:
```sql
USE expense_tracker;
SELECT * FROM users;
SELECT * FROM transactions;
```

---

## 📋 API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/change-password` - Change password

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Add transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Add category
- `DELETE /api/categories/:id` - Delete category

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `POST /api/user/avatar` - Upload avatar
- `GET /api/user/balance` - Get balance info
- `GET /api/user/dashboard` - Get dashboard data

---

## 🔧 Environment Variables

### Backend (.env)
| Variable | Value | Purpose |
|----------|-------|---------|
| DB_HOST | localhost | MySQL host |
| DB_PORT | 3306 | MySQL port |
| DB_USER | root | MySQL username |
| DB_PASSWORD | sanskar@4343 | MySQL password |
| DB_NAME | expense_tracker | Database name |
| JWT_SECRET | your_secret_key | Token signing key |
| PORT | 5000 | Backend server port |
| FRONTEND_URL | http://localhost:5173 | CORS origin |

### Frontend (.env or .env.local)
| Variable | Value | Purpose |
|----------|-------|---------|
| VITE_API_URL | http://localhost:5000/api | Backend API URL |

---

## 🐛 Troubleshooting

### ❌ "Connection refused" or "ECONNREFUSED"
- [ ] Check MySQL is running: `net start MySQL80` (Windows)
- [ ] Verify credentials in `.env`
- [ ] Check DB_HOST is correct (usually `localhost`)

### ❌ "Table doesn't exist"
- [ ] Run schema.sql again: `mysql -u root -p < schema.sql`
- [ ] Verify database was created: `SHOW DATABASES;`

### ❌ "CORS Error"
- [ ] Check `FRONTEND_URL` in backend `.env`
- [ ] Should be `http://localhost:5173` for local dev

### ❌ "Invalid token" or 401 errors
- [ ] Check JWT_SECRET is the same in backend `.env`
- [ ] Verify token is sent in Authorization header: `Bearer <token>`

### ❌ Frontend doesn't connect to backend
- [ ] Check `VITE_API_URL` in frontend `.env`
- [ ] Verify backend is running on port 5000
- [ ] Check browser network tab for failed requests

---

## 📦 Project Structure
```
dbmsproject/
├── backend/
│   ├── .env              # Database credentials
│   ├── db.js             # MySQL connection pool
│   ├── server.js         # Express server
│   ├── schema.sql        # Database schema
│   ├── auth.js           # Auth routes
│   ├── transactions.js   # Transaction routes
│   ├── user.js           # User routes
│   └── package.json
└── frontend/
    ├── src/
    │   └── app/services/api.ts    # API client
    └── package.json
```

---

## ✨ How It Works (Architecture)

```
Browser (Frontend)
    ↓ HTTP Request
Frontend (React/Vite) at :5173
    ↓ Fetch to /api endpoints
Backend (Express) at :5000
    ↓ Query with mysql2/promise
MySQL Database
    ↓ Returns results
Backend
    ↓ JSON response
Frontend
    ↓ Display data
Browser
```

---

## 🚀 Next Steps
1. ✅ Database is set up (run schema.sql)
2. ✅ Backend API is configured (uses mysql2)
3. ✅ Frontend is configured (api.ts has correct BASE_URL)
4. ✅ Authentication works (JWT tokens)
5. ✅ All endpoints are ready

**Just run:**
```bash
# Terminal 1 - Backend
cd backend && npm install && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm install && npm run dev
```

Then visit: http://localhost:5173 🎉
