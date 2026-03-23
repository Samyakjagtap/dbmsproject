# Code Walkthrough: How Frontend Talks to MySQL

## 🔍 Let's Trace a Request: User Logs In

### 1️⃣ User Clicks "Login" Button (Frontend)

**File**: `frontend/src/app/services/api.ts`

```typescript
// When user submits login form
export const authApi = {
  login: async (email: string, password: string) => {
    // Makes HTTP POST request to backend
    const data = await request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    // Saves token to localStorage
    setToken(data.token);
    return data;
  },
};

// The request() function sends data to backend
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    // BASE_URL = 'http://localhost:5000/api'
    // path = '/auth/login'
    // Full URL: http://localhost:5000/api/auth/login
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  
  const data = await res.json();
  return data as T;
}
```

**What happens**: Browser sends this HTTP request
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "mypassword123"
}
```

---

### 2️⃣ Backend Receives Request (Node.js/Express)

**File**: `backend/server.js`

```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS so frontend can access
app.use(cors({ origin: 'http://localhost:5173' }));

// Parse JSON request bodies
app.use(express.json());

// Import auth routes
const authRoutes = require('./auth');

// Register the routes
app.use('/api/auth', authRoutes);

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
```

The request reaches `/api/auth/login` which is handled by `backend/auth.js`

---

### 3️⃣ Backend Processes Login (auth.js)

**File**: `backend/auth.js`

```javascript
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db'); // MySQL connection

// POST /api/auth/login
router.post('/login', async (req, res) => {
  // Get email and password from request body
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password)
    return res.status(400).json({ error: 'email and password are required' });

  try {
    // 🔴 QUERY MYSQL DATABASE - THIS IS THE KEY PART
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]  // Using parameterized query to prevent SQL injection
    );
    
    // If user not found
    if (!rows.length) 
      return res.status(401).json({ error: 'Invalid credentials' });

    // Get the user from database
    const user = rows[0];
    
    // Check if password matches (bcryptjs compares password with stored hash)
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) 
      return res.status(401).json({ error: 'Invalid credentials' });

    // Create JWT token valid for 7 days
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Send response back to frontend
    res.json({
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email,
        avatar_url: user.avatar_url, 
        balance_limit: user.balance_limit 
      }
    });
  } catch (err) {
    // If something goes wrong
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

---

### 4️⃣ Backend Connects to MySQL (db.js)

**File**: `backend/db.js`

```javascript
const mysql = require('mysql2/promise'); // Import MySQL driver
require('dotenv').config(); // Load environment variables from .env

// Create a connection pool (reusable connections to MySQL)
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',      // Where MySQL server is
  port:     process.env.DB_PORT     || 3306,             // MySQL port
  user:     process.env.DB_USER     || 'root',           // MySQL username
  password: process.env.DB_PASSWORD || '',               // MySQL password
  database: process.env.DB_NAME     || 'expense_tracker', // Database name
  waitForConnections: true,                              // Wait if no connections available
  connectionLimit: 10,                                   // Maximum connections
  queueLimit: 0,                                         // Unlimited queue
});

module.exports = pool; // Export the pool so other files can use it
```

**How it works**:
1. Creates a pool of 10 MySQL connections (for performance)
2. Reads credentials from `.env` file
3. When `db.query()` is called, it uses one of these connections
4. Executes SQL and returns the result

---

### 5️⃣ MySQL Database Executes Query

**File**: `backend/schema.sql`

```sql
-- Database structure
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)        NOT NULL,
  email         VARCHAR(150)        NOT NULL UNIQUE,
  password_hash VARCHAR(255)        NOT NULL,
  avatar_url    VARCHAR(500)        DEFAULT NULL,
  balance_limit DECIMAL(12, 2)      NOT NULL DEFAULT 1000.00,
  created_at    TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP           DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**When login query runs**:
```sql
-- The backend runs this query:
SELECT * FROM users WHERE email = 'user@example.com'

-- MySQL executes it:
-- 1. Looks in users table
-- 2. Finds row where email column matches
-- 3. Returns entire row (id, name, email, password_hash, etc.)
```

---

### 6️⃣ Backend Receives MySQL Response

The database returns:
```javascript
{
  id: 1,
  name: 'John Doe',
  email: 'user@example.com',
  password_hash: '$2b$10$examplehashedpassword', // Hashed, not plain text!
  avatar_url: null,
  balance_limit: 1000.00,
  created_at: '2024-03-20 10:30:00',
  updated_at: '2024-03-20 10:30:00'
}
```

Backend then:
1. Compares submitted password with hashed password using bcryptjs
2. If match, creates JWT token
3. Sends response to frontend

---

### 7️⃣ Frontend Receives Response

The backend sends back:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "avatar_url": null,
    "balance_limit": 1000.00
  }
}
```

Frontend receives this in `api.ts`:
```typescript
const data = await res.json();
setToken(data.token); // Save token to localStorage
return data; // Return to component
```

Component receives it:
```typescript
const { token, user } = await authApi.login(email, password);
// token is saved, user data is stored in state
// Component redirects to dashboard
```

---

### 8️⃣ Frontend Gets Transactions (Uses Same Pattern)

When dashboard loads, it fetches transactions:

**Frontend** (`api.ts`):
```typescript
export const transactionsApi = {
  getAll: () => request<Transaction[]>('/transactions'),
  // Makes: GET http://localhost:5000/api/transactions
  // With: Authorization: Bearer <token>
};
```

**Backend** (`transactions.js`):
```javascript
router.get('/', auth, async (req, res) => {
  // auth middleware checks JWT token from Authorization header
  // req.userId is set from the decoded token
  
  try {
    const [rows] = await db.query(`
      SELECT t.*, c.name AS category_name, c.icon, c.color
      FROM transactions t
      LEFT JOIN categories c ON c.id = t.category_id
      WHERE t.user_id = ?
      ORDER BY t.date DESC
    `, [req.userId]);
    
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

**MySQL** executes:
```sql
SELECT t.*, c.name, c.icon, c.color
FROM transactions t
LEFT JOIN categories c ON c.id = t.category_id
WHERE t.user_id = 1
ORDER BY t.date DESC
```

Returns all transactions for that user with category info.

---

## 🔗 The Complete Chain

```
┌─ Frontend (React) ─────────────────────────────────────┐
│  User types email/password and clicks Login            │
│  api.ts → request() → fetch()                          │
└─────────────────────────────────────────────────────────┘
                       ↓ HTTP POST
┌─ Backend (Express) ────────────────────────────────────┐
│  server.js → auth.js → authMiddleware                  │
│  auth.js → db.query() [MySQL query]                    │
└─────────────────────────────────────────────────────────┘
                       ↓ SQL Query
┌─ MySQL Database ───────────────────────────────────────┐
│  Executes: SELECT * FROM users WHERE email = ?         │
│  Finds user row with matching email                    │
│  Returns user data                                     │
└─────────────────────────────────────────────────────────┘
                       ↓ Query Result
┌─ Backend (Express) ────────────────────────────────────┐
│  Receives user data from MySQL                         │
│  Compares password with bcryptjs                       │
│  Creates JWT token                                     │
│  res.json({ token, user })                             │
└─────────────────────────────────────────────────────────┘
                       ↓ HTTP Response
┌─ Frontend (React) ─────────────────────────────────────┐
│  Receives { token, user }                              │
│  Saves token to localStorage                           │
│  Redirects to dashboard                                │
│  Next requests include: Authorization: Bearer <token>  │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Key Files Summary

| File | Purpose | What It Does |
|------|---------|-------------|
| `frontend/src/app/services/api.ts` | API Client | Makes HTTP requests to backend, manages authentication token |
| `backend/server.js` | Entry Point | Starts Express server, sets up middleware, mounts routes |
| `backend/db.js` | Database Connection | Connects to MySQL, exports query pool |
| `backend/auth.js` | Auth Routes | Handles /login, /register, /change-password |
| `backend/transactions.js` | Transaction Routes | Handles CRUD operations for transactions |
| `backend/user.js` | User Routes | Handles user profile, avatar, balance |
| `backend/schema.sql` | Database Schema | Creates database structure and demo data |
| `backend/.env` | Configuration | Stores credentials (DB_USER, DB_PASSWORD, etc.) |

---

## 🛡️ Security Points

1. **Passwords are hashed** - Never stored as plain text
   ```javascript
   const hash = await bcrypt.hash(password, 10);
   // Stores: $2b$10$examplehashedpassword (not "password")
   ```

2. **Tokens expire** - JWT tokens expire after 7 days
   ```javascript
   jwt.sign({ userId }, secret, { expiresIn: '7d' })
   ```

3. **SQL Injection protection** - Using parameterized queries
   ```javascript
   // ✅ SAFE - uses ?
   db.query('SELECT * FROM users WHERE email = ?', [email])
   
   // ❌ UNSAFE - string concatenation
   db.query(`SELECT * FROM users WHERE email = '${email}'`)
   ```

4. **CORS protection** - Only frontend at localhost:5173 can access
   ```javascript
   app.use(cors({ origin: 'http://localhost:5173' }))
   ```

5. **User isolation** - Backend ensures users only see their own data
   ```javascript
   // Always use req.userId from JWT
   db.query('SELECT * FROM transactions WHERE user_id = ?', [req.userId])
   ```

---

## 🚀 Now You Know!

You understand:
- ✅ How frontend talks to backend (HTTP requests)
- ✅ How backend connects to MySQL (mysql2/promise)
- ✅ How data flows from database to browser
- ✅ How authentication works (JWT tokens + bcrypt)
- ✅ How security is implemented (SQL injection protection, password hashing)

**To get it running**: Follow QUICKSTART.md
**For detailed setup**: Follow SETUP_GUIDE.md
**For architecture overview**: Follow DATABASE_CONNECTION_EXPLAINED.md
