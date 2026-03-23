# How Your Website Connects to MySQL Database

## 🎯 The Connection Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    WEB BROWSER                              │
│  Your website runs here at http://localhost:5173            │
└──────────────────────────┬──────────────────────────────────┘
                           │ User clicks "Login"
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (React/TypeScript)                    │
│  src/app/services/api.ts sends HTTP request                │
│  POST http://localhost:5000/api/auth/login                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ Network Request
                           ↓
┌─────────────────────────────────────────────────────────────┐
│           BACKEND (Express.js on port 5000)                 │
│  - Receives request at /api/auth/login                      │
│  - Validates email & password                               │
│  - Queries MySQL database                                   │
└──────────────────────────┬──────────────────────────────────┘
                           │ SQL Query
                           ↓
┌─────────────────────────────────────────────────────────────┐
│          MYSQL DATABASE (Port 3306)                         │
│  - Database: expense_tracker                                │
│  - Table: users                                             │
│  - Executes: SELECT * FROM users WHERE email=?             │
│  - Returns: User data (if found)                            │
└──────────────────────────┬──────────────────────────────────┘
                           │ Query Result
                           ↓
┌─────────────────────────────────────────────────────────────┐
│           BACKEND (Processes result)                        │
│  - Checks password match with bcryptjs                      │
│  - Creates JWT token                                        │
│  - Sends JSON response                                      │
└──────────────────────────┬──────────────────────────────────┘
                           │ JSON Response
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (React app)                           │
│  - Saves token to localStorage                              │
│  - Redirects to dashboard                                   │
│  - Stores user data in state                                │
└──────────────────────────┬──────────────────────────────────┘
                           │ Render Dashboard
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    WEB BROWSER                              │
│  Dashboard displays with user's transactions                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Key Files Involved

### 1. **Frontend** (`frontend/src/app/services/api.ts`)
```typescript
// This file talks to your backend
const BASE_URL = 'http://localhost:5000/api';

// When you log in, this function runs:
authApi.login('user@example.com', 'password')
  // Makes HTTP POST to: http://localhost:5000/api/auth/login
```

### 2. **Backend** (`backend/auth.js`)
```javascript
// This file receives the login request
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Query the database
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  
  // Return token and user data
});
```

### 3. **Database Connection** (`backend/db.js`)
```javascript
// This file connects to MySQL
const pool = mysql.createPool({
  host: 'localhost',          // MySQL server location
  port: 3306,                 // MySQL port (default)
  user: 'root',               // MySQL username
  password: 'sanskar@4343',   // MySQL password (from .env)
  database: 'expense_tracker' // Database name
});
```

### 4. **MySQL Database** (`backend/schema.sql`)
```sql
-- This creates the actual database structure
CREATE DATABASE expense_tracker;
CREATE TABLE users (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(150),
  password_hash VARCHAR(255)
);
```

---

## 🔄 Example: Adding a Transaction

### What Happens When You Click "Add Transaction"

**Step 1: Frontend**
```typescript
// User fills form and clicks "Add"
const response = await transactionsApi.add({
  type: 'expense',
  amount: 50,
  category_id: 1,
  date: '2024-03-23',
  description: 'Lunch'
});
// Sends HTTP POST to: http://localhost:5000/api/transactions
```

**Step 2: Backend Receives Request**
```javascript
// backend/transactions.js
router.post('/', auth, async (req, res) => {
  const { type, amount, category_id, date, description } = req.body;
  
  // Save to database
  await db.query(
    'INSERT INTO transactions (...) VALUES (...)',
    [req.userId, category_id, type, amount, description, date]
  );
});
```

**Step 3: MySQL Stores Data**
```sql
-- Query runs in MySQL
INSERT INTO transactions 
(user_id, category_id, type, amount, description, date) 
VALUES (1, 1, 'expense', 50, 'Lunch', '2024-03-23');

-- New row is created in transactions table
```

**Step 4: Backend Responds**
```javascript
res.status(201).json({
  id: 123,
  message: 'Transaction added',
  balance: 4950,
  lowBalanceAlert: false
});
```

**Step 5: Frontend Updates Display**
```typescript
// Response received
// Frontend updates the transaction list
// User sees new transaction immediately
```

---

## 🛠️ Tech Stack Breakdown

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **UI** | React + TypeScript | User interface |
| **Communication** | Fetch API + HTTP | Browser ↔ Backend |
| **Backend** | Express.js + Node.js | API server |
| **Database Driver** | mysql2/promise | Connect Node to MySQL |
| **Database** | MySQL 8.0 | Store data |
| **Authentication** | JWT + bcryptjs | Secure user sessions |

---

## 🔐 Security Features

Your setup includes:

1. **Password Hashing** - Passwords stored as bcrypt hashes (not plain text)
2. **JWT Tokens** - Sessions are secure tokens, not cookies
3. **CORS** - Only your frontend can access the API
4. **SQL Injection Protection** - Using parameterized queries (?)
5. **User Isolation** - Each user only sees their own data

---

## 📊 Database Schema

```
users (1)
  ├─ id (PRIMARY KEY)
  ├─ name
  ├─ email (UNIQUE)
  ├─ password_hash
  ├─ avatar_url
  ├─ balance_limit
  └─ created_at

categories (many to 1 user)
  ├─ id (PRIMARY KEY)
  ├─ user_id (FOREIGN KEY → users.id)
  ├─ name
  ├─ icon
  ├─ color
  └─ created_at

transactions (many to 1 user, many to 1 category)
  ├─ id (PRIMARY KEY)
  ├─ user_id (FOREIGN KEY → users.id)
  ├─ category_id (FOREIGN KEY → categories.id)
  ├─ type (income/expense)
  ├─ amount
  ├─ description
  ├─ date
  └─ created_at
```

---

## ✅ Setup Checklist

- [ ] MySQL server installed and running
- [ ] Database created with `mysql -u root -p < schema.sql`
- [ ] Backend dependencies installed: `cd backend && npm install`
- [ ] Backend started: `npm run dev` (should say ✅ Server running)
- [ ] Frontend dependencies installed: `cd frontend && npm install`
- [ ] Frontend started: `npm run dev` (should open http://localhost:5173)
- [ ] Both servers running simultaneously in separate terminals
- [ ] Can load http://localhost:5173 in browser
- [ ] Can register a new account
- [ ] Can add a transaction and see it in database

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot GET /api/auth/login"
**Solution**: Backend not running. Run `npm run dev` in backend folder.

### Issue: "ECONNREFUSED" (Connection refused)
**Solution**: 
- MySQL not running: `net start MySQL80`
- Check port 5000 not used by another app

### Issue: "Table doesn't exist"
**Solution**: Run schema.sql: `mysql -u root -p < schema.sql`

### Issue: "CORS error" (blocked by CORS policy)
**Solution**: Check `.env` FRONTEND_URL matches your frontend URL

### Issue: Can register but can't login
**Solution**: 
- Check database credentials in .env
- Verify users table has data: `SELECT * FROM users;` in MySQL

---

## 🎓 Learning Resources

To understand better:
- **Express.js**: https://expressjs.com/
- **MySQL Docs**: https://dev.mysql.com/doc/
- **MySQL2 npm package**: https://github.com/sidorares/node-mysql2
- **JWT explained**: https://jwt.io/introduction
- **REST APIs**: https://www.restfulapi.net/

---

## 📞 Quick Commands Reference

```bash
# Start MySQL
net start MySQL80

# Create database & tables
mysql -u root -p < schema.sql

# Check database
mysql -u root -p
> USE expense_tracker;
> SHOW TABLES;
> SELECT * FROM users;

# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Test backend
curl http://localhost:5000/health
```

---

That's it! Your website is now connected to MySQL. 🎉
