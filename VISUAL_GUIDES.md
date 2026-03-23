# Visual Guides & Diagrams

## 1️⃣ Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER IN BROWSER                            │
│                  (Using Expense Tracker App)                        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ Clicks "Add Transaction"
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND APP                               │
│             (Running on http://localhost:5173)                      │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ src/app/services/api.ts                                       │  │
│  │                                                                │  │
│  │  transactionsApi.add({                                        │  │
│  │    type: 'expense',                                           │  │
│  │    amount: 50,                                                │  │
│  │    category_id: 1,                                            │  │
│  │    date: '2024-03-23',                                        │  │
│  │    description: 'Lunch'                                       │  │
│  │  })                                                           │  │
│  │                                                                │  │
│  │  ↓ Calls fetch() with Authorization header                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                    HTTP POST Request
                    POST /api/transactions
                    Content-Type: application/json
                    Authorization: Bearer eyJhbGc...
                    
                    Body: {
                      "type": "expense",
                      "amount": 50,
                      "category_id": 1,
                      "date": "2024-03-23",
                      "description": "Lunch"
                    }
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS BACKEND                               │
│             (Running on http://localhost:5000)                      │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ server.js                                                     │  │
│  │ - Receives request at /api/transactions                      │  │
│  │ - Middleware: cors, express.json                             │  │
│  │ - Routes to transactions.js                                  │  │
│  └─────────────────────────────┬───────────────────────────────┘  │
│                                │                                     │
│  ┌─────────────────────────────↓───────────────────────────────┐  │
│  │ transactions.js                                              │  │
│  │ - Receives POST /transactions                               │  │
│  │ - Validates request body                                    │  │
│  │ - Middleware: auth (verifies JWT token)                     │  │
│  │ - Extracts userId from JWT: req.userId = 1                 │  │
│  │ - Calls: db.query(INSERT INTO...)                           │  │
│  └─────────────────────────────┬───────────────────────────────┘  │
│                                │                                     │
│  ┌─────────────────────────────↓───────────────────────────────┐  │
│  │ db.js (MySQL Connection Pool)                               │  │
│  │                                                               │  │
│  │ const pool = mysql.createPool({                              │  │
│  │   host: 'localhost',                                         │  │
│  │   port: 3306,                                                │  │
│  │   user: 'root',                                              │  │
│  │   password: 'sanskar@4343',                                  │  │
│  │   database: 'expense_tracker'                                │  │
│  │ })                                                           │  │
│  │                                                               │  │
│  │ ↓ Gets connection from pool                                  │  │
│  │ ↓ Executes SQL query                                         │  │
│  └─────────────────────────────┬───────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                            SQL Query
                 INSERT INTO transactions
                 (user_id, category_id, type, amount, 
                  description, date)
                 VALUES (1, 1, 'expense', 50, 'Lunch', 
                         '2024-03-23')
                                 │
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      MYSQL DATABASE                                 │
│           (expense_tracker on localhost:3306)                       │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ transactions table                                            │  │
│  │                                                                │  │
│  │ id | user_id | category_id | type    | amount | description  │  │
│  │─────────────────────────────────────────────────────────────   │  │
│  │ 1  │   1     │      1      │ income  │ 5000  │ Salary        │  │
│  │ 2  │   1     │      1      │ expense │  120  │ Groceries     │  │
│  │ 3  │   1     │      2      │ expense │   45  │ Uber ride     │  │
│  │ 4  │   1     │      4      │ expense │   15  │ Netflix       │  │
│  │ 5  │   1     │      8      │ income  │ 1200  │ Freelance     │  │
│  │ 6  │   1     │      1      │ expense │   50  │ Lunch    ←NEW │  │
│  │                                                                │  │
│  │ ✅ New row inserted                                           │  │
│  │ ✅ Database updated                                           │  │
│  │ ✅ Returns: insertId = 6                                      │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────┬────────────────────────────────────────┘
                              │
                    Query Result (insertId)
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS BACKEND                               │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ transactions.js (continued)                                   │  │
│  │                                                                │  │
│  │ ✅ Query successful!                                          │  │
│  │ ✅ Get balance info from database                             │  │
│  │ ✅ Create response:                                           │  │
│  │                                                                │  │
│  │ res.status(201).json({                                        │  │
│  │   id: 6,                                                      │  │
│  │   message: 'Transaction added',                               │  │
│  │   balance: 6135,                                              │  │
│  │   lowBalanceAlert: false,                                     │  │
│  │   balance_limit: 1000                                         │  │
│  │ })                                                            │  │
│  │                                                                │  │
│  │ ✅ Send to frontend                                           │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────┬────────────────────────────────────────┘
                              │
                     JSON Response
                     HTTP 201 Created
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND APP                               │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ api.ts (request function)                                     │  │
│  │                                                                │  │
│  │ ✅ Response received                                          │  │
│  │ ✅ Status: 201 (success)                                      │  │
│  │ ✅ Parse JSON                                                 │  │
│  │ ✅ Return data to component                                   │  │
│  └─────────────────────────────┬───────────────────────────────┘  │
│                                │                                     │
│  ┌─────────────────────────────↓───────────────────────────────┐  │
│  │ add-transaction.tsx (Component)                              │  │
│  │                                                               │  │
│  │ ✅ Receive response                                          │  │
│  │ ✅ Show success message                                      │  │
│  │ ✅ Update transactions list                                  │  │
│  │ ✅ Close modal                                               │  │
│  │ ✅ Refresh balance display                                   │  │
│  │ ✅ User sees: "Transaction added!"                           │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────┬────────────────────────────────────────┘
                              │
                    UI Updated
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                          USER IN BROWSER                            │
│                                                                      │
│  ✅ New transaction appears in list                                 │
│  ✅ Balance updated (6135 from 6185)                                │
│  ✅ No low-balance alert                                            │
│  ✅ Data is saved in MySQL database                                 │
│  ✅ Everything is persistent                                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ Database Tables & Relationships

```
┌──────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                           │
│                       expense_tracker                             │
└──────────────────────────────────────────────────────────────────┘


┌─────────────────────────────┐
│      users                  │
├─────────────────────────────┤
│ id (PK)                     │
│ name                        │
│ email (UNIQUE)              │
│ password_hash               │
│ avatar_url                  │
│ balance_limit               │
│ created_at                  │
│ updated_at                  │
└─────────────┬───────────────┘
              │
              │ 1:Many
              │
        ┌─────┴────────────┐
        │                  │
        ↓                  ↓
        
┌──────────────────────┐    ┌──────────────────────┐
│   categories         │    │  transactions        │
├──────────────────────┤    ├──────────────────────┤
│ id (PK)              │    │ id (PK)              │
│ user_id (FK)         │◄───┤ user_id (FK)         │
│ name                 │    │ category_id (FK)     │
│ icon                 │    │ type (enum)          │
│ color                │    │ amount               │
│ created_at           │    │ description          │
│                      │    │ date                 │
└──────────────────────┘    │ created_at           │
                            │ updated_at           │
                            └──────────────────────┘
```

---

## 3️⃣ Authentication Flow

```
STEP 1: User Types Email/Password
                │
                ↓
STEP 2: Frontend sends to backend
        POST /api/auth/login
        { email, password }
                │
                ↓
STEP 3: Backend queries database
        SELECT * FROM users WHERE email = ?
                │
                ↓
STEP 4: Check password
        bcrypt.compare(inputPassword, storedHash)
        ✅ Match?
                │
                ↓
STEP 5: Create JWT token
        jwt.sign({ userId: user.id }, secret)
        Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                │
                ↓
STEP 6: Send to frontend
        { token, user: { id, name, email } }
                │
                ↓
STEP 7: Frontend saves token
        localStorage.setItem('et_token', token)
                │
                ↓
STEP 8: Redirect to dashboard
                │
                ↓
STEP 9: Future requests include token
        Authorization: Bearer eyJhbGc...
                │
                ↓
STEP 10: Backend verifies token
         jwt.verify(token, secret)
         ✅ Valid? → Allow request
         ❌ Invalid? → 401 Unauthorized
```

---

## 4️⃣ Environment Variables

```
┌─────────────────────────────────────────────┐
│  backend/.env                               │
├─────────────────────────────────────────────┤
│ # Database Configuration                    │
│ DB_HOST=localhost                           │
│ DB_PORT=3306                                │
│ DB_USER=root                                │
│ DB_PASSWORD=sanskar@4343                    │
│ DB_NAME=expense_tracker                     │
│                                             │
│ # JWT Configuration                        │
│ JWT_SECRET=your_super_secret_jwt_key...    │
│                                             │
│ # Server Configuration                     │
│ PORT=5000                                   │
│ FRONTEND_URL=http://localhost:5173         │
└─────────────────────────────────────────────┘

These values are loaded by:
require('dotenv').config()

Used via:
process.env.DB_HOST
process.env.DB_USER
process.env.JWT_SECRET
etc.
```

---

## 5️⃣ Ports & Services

```
Your Computer
│
├─ PORT 3306 (MySQL)
│  └─ MySQL Server running
│     Database: expense_tracker
│     Host: localhost
│     User: root
│
├─ PORT 5000 (Backend API)
│  └─ Express.js Server
│     Routes: /api/auth, /api/transactions, /api/categories, /api/user
│     Connected to MySQL on :3306
│
└─ PORT 5173 (Frontend)
   └─ React Development Server
      Vite bundler running
      Calls backend at http://localhost:5000/api
```

---

## 6️⃣ Request Headers (Important!)

```
Frontend sends requests like this:

GET /api/transactions HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Origin: http://localhost:5173

Backend responds like this:

HTTP/1.1 200 OK
Content-Type: application/json

[
  { id: 1, type: "income", amount: 5000, date: "2024-03-21" },
  { id: 2, type: "expense", amount: 120, date: "2024-03-22" }
]
```

---

## 7️⃣ Error Handling Flow

```
User tries to login with wrong password

Frontend
  ↓ Makes request
Backend
  ↓ Query database
MySQL
  ↓ Returns user
Backend
  ↓ Check password
  ✗ Password doesn't match
  ↓ Return 401 error
Frontend
  ↓ Catch error
  ↓ Display message: "Invalid credentials"
User
  ↓ Sees error
  ✓ Can try again
```

---

## 8️⃣ Startup Sequence

```
Terminal 1: Start MySQL
┌─────────────────────────────────┐
│ $ net start MySQL80             │
│ MySQL service started           │
│ ✅ Listening on :3306           │
└─────────────────────────────────┘

Terminal 2: Start Backend
┌─────────────────────────────────┐
│ $ cd backend                    │
│ $ npm run dev                   │
│                                 │
│ ✅ Server running on            │
│    http://localhost:5000        │
│                                 │
│ Connected to MySQL              │
│ Ready to receive requests       │
└─────────────────────────────────┘

Terminal 3: Start Frontend
┌─────────────────────────────────┐
│ $ cd frontend                   │
│ $ npm run dev                   │
│                                 │
│ ✅ VITE v4.x.x ready in 500ms   │
│                                 │
│ ➜  Local: http://localhost:5173 │
│                                 │
│ Connecting to backend at :5000  │
└─────────────────────────────────┘

Browser
┌─────────────────────────────────┐
│ Open: http://localhost:5173     │
│                                 │
│ App loads                       │
│ Frontend calls backend          │
│ Backend queries MySQL           │
│ ✅ Everything working!          │
└─────────────────────────────────┘
```

---

That's how your Expense Tracker connects to MySQL! 🎉
