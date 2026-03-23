# Quick Start - Just Run These Commands

## 🚀 5-Minute Setup

### Terminal 1: Setup & Start Backend
```bash
cd backend
npm install
mysql -u root -p < schema.sql
npm run dev
```

### Terminal 2: Setup & Start Frontend
```bash
cd frontend
npm install
npm run dev
```

Then open: **http://localhost:5173**

---

## ✅ What's Already Configured

Your project is **production-ready** for MySQL:

✅ Backend: Express.js + mysql2/promise
✅ Database: MySQL schema with users, categories, transactions
✅ Auth: JWT tokens with bcryptjs hashing
✅ Frontend: React with TypeScript + API client
✅ CORS: Configured for local development
✅ Environment: `.env` files ready to use

---

## 🔌 How They Connect

```
Frontend (React)
    ↓
api.ts (talks to backend via HTTP)
    ↓
Backend (Express) at http://localhost:5000/api
    ↓
MySQL Database
    ↓
Returns data to Frontend
```

---

## 📝 Database Credentials (from .env)
- **Host**: localhost
- **User**: root
- **Password**: sanskar@4343
- **Database**: expense_tracker

---

## 🧪 Test It Works

After starting both servers:

**Terminal 3:**
```bash
# Test backend
curl http://localhost:5000/health

# Should return: {"status":"ok"}
```

---

## 📖 Full Guide
See **SETUP_GUIDE.md** for detailed instructions, troubleshooting, and architecture overview.
