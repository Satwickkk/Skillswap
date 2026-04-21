# SkillSwap - Learning platform

<img width="1771" height="747" alt="image" src="https://github.com/user-attachments/assets/03aad0c4-83f2-460e-80e7-208a9692cec7" />

<img width="1285" height="839" alt="image" src="https://github.com/user-attachments/assets/d404937f-7f7d-4ea0-8011-dcfc40e55eed" />

<img width="1301" height="546" alt="image" src="https://github.com/user-attachments/assets/73d83f41-a505-4d09-893a-7791ad9698aa" />

<img width="1309" height="647" alt="image" src="https://github.com/user-attachments/assets/6f2f2589-579d-449b-aa73-5ed3a11b5569" />

<img width="1323" height="794" alt="image" src="https://github.com/user-attachments/assets/5f780f5e-b854-43eb-9533-bb2dbf6bfce3" />

<img width="1285" height="679" alt="image" src="https://github.com/user-attachments/assets/645e2d40-1c54-45e6-997d-512d552bca79" />

---

## STEP 1 — Install MongoDB

### Option A: Local MongoDB (Recommended for Development)

**Windows:**
1. Go to https://www.mongodb.com/try/download/community
2. Download "MongoDB Community Server" → Windows → .msi installer
3. Run the installer → choose "Complete" → Install as Service ✅
4. MongoDB will auto-start on boot

**Verify MongoDB is running:**
```bash
mongosh
# Should show: "Connected to: mongodb://127.0.0.1:27017/"
# Type exit to quit
```

---

### Option B: MongoDB Atlas (Free Cloud DB — No Installation)

1. Go to https://www.mongodb.com/atlas/database
2. Sign up free → Create a free M0 cluster
3. Click "Connect" → "Drivers" → copy the connection string
4. It looks like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/skillswap
   ```
5. In `backend/.env`, replace `MONGO_URI=` with your Atlas URI

---

## STEP 2 — Configure Environment

Edit `backend/.env`:

```env
# Local MongoDB:
MONGO_URI=mongodb://localhost:27017/skillswap

# OR MongoDB Atlas:
# MONGO_URI=mongodb+srv://yourUser:yourPass@cluster0.xxxxx.mongodb.net/skillswap

JWT_SECRET=skillswap_super_secret_key_2024
PORT=5000
CLIENT_URL=http://localhost:3000
```

---

## STEP 3 — Install Dependencies

**Install Node.js first** (if not installed):
- Download from https://nodejs.org → LTS version

```bash
# Install backend dependencies
cd skillswap/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## STEP 4 — Seed Demo Data (Optional but Recommended)

```bash
cd skillswap/backend
node seed.js
```

This creates:
- 5 demo users with pre-matched skills
- 16 skills across categories
- 3 sessions (upcoming + completed)
- Sample feedback/ratings

**Demo login after seeding:**
| Email | Password | Role |
|-------|----------|------|
| sagar@demo.com | password123 | Student |
| priya@demo.com | password123 | Professional |
| admin@skillswap.com | admin123 | Admin |

---

## STEP 5 — Run the Application

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd skillswap/backend
npm run dev      # uses nodemon (auto-restart on changes)
# OR
npm start        # production mode
```
You should see:
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

**Terminal 2 — Frontend:**
```bash
cd skillswap/frontend
npm start
```
Browser opens automatically at http://localhost:3000

---

## STEP 6 — Verify Everything Works

Open http://localhost:3000 in your browser.

---

---

## API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/users/me | Get current user profile |
| PUT | /api/users/me | Update profile |
| GET | /api/users | Get all users |
| POST | /api/skills | Add a skill |
| GET | /api/skills/mine | Get my skills |
| DELETE | /api/skills/:id | Delete a skill |
| GET | /api/matches | Get skill matches |
| POST | /api/sessions | Create session request |
| GET | /api/sessions/mine | Get my sessions |
| PUT | /api/sessions/:id/status | Update session status |
| POST | /api/feedback | Submit rating & feedback |
| GET | /api/feedback/user/:id | Get feedback for a user |

All protected routes require header: `Authorization: Bearer <token>`


## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Realtime | Socket.IO (for future chat) |
| Styling | Pure CSS (custom design system) |
