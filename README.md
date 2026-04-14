# SkillSwap — Complete Setup Guide

## Project Structure

```
skillswap/
├── backend/
│   ├── models/          ← MongoDB schemas
│   │   ├── User.js
│   │   ├── Skill.js
│   │   ├── Session.js
│   │   └── Feedback.js
│   ├── routes/          ← Express API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── skills.js
│   │   ├── sessions.js
│   │   ├── matches.js
│   │   └── feedback.js
│   ├── middleware/
│   │   └── auth.js      ← JWT middleware
│   ├── server.js        ← Main Express + Socket.IO server
│   ├── seed.js          ← Demo data seeder
│   ├── .env             ← Environment variables
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   └── Navbar.css
    │   ├── pages/
    │   │   ├── Login.js / Auth.css
    │   │   ├── Register.js
    │   │   ├── Dashboard.js / Dashboard.css
    │   │   ├── Skills.js / Skills.css
    │   │   ├── Matches.js / Matches.css
    │   │   ├── Sessions.js / Sessions.css
    │   │   └── Profile.js / Profile.css
    │   ├── styles/
    │   │   └── global.css
    │   ├── App.js
    │   └── index.js
    └── package.json
```

---

## STEP 1 — Install MongoDB

### Option A: Local MongoDB (Recommended for Development)

**Windows:**
1. Go to https://www.mongodb.com/try/download/community
2. Download "MongoDB Community Server" → Windows → .msi installer
3. Run the installer → choose "Complete" → Install as Service ✅
4. MongoDB will auto-start on boot

**macOS:**
```bash
# Install Homebrew if needed: https://brew.sh
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

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

### Quick Test Checklist:
- [ ] Login page loads with red/black design
- [ ] Register a new user → lands on Dashboard
- [ ] Dashboard shows credits, stats, quick actions
- [ ] Go to "My Skills" → add a skill you can teach
- [ ] Add a skill you want to learn
- [ ] Go to "Matches" → see users who match your skills
- [ ] Click a match → see "Schedule a Session" button
- [ ] Go to "Sessions" → schedule, confirm, complete sessions
- [ ] Rate completed sessions with the ⭐ button
- [ ] View Profile → see your User ID (needed to schedule sessions)

---

## MongoDB Collections Explained

After running the app, MongoDB will have these collections in the `skillswap` database:

### `users`
```json
{
  "_id": "ObjectId",
  "name": "Sagar Raj",
  "email": "sagar@demo.com",
  "password": "<bcrypt hash>",
  "role": "student",
  "bio": "...",
  "skillsOffered": ["ObjectId", ...],
  "skillsWanted": ["ObjectId", ...],
  "credits": 20,
  "rating": 4.8,
  "sessionsCompleted": 8,
  "isAdmin": false,
  "isActive": true
}
```

### `skills`
```json
{
  "_id": "ObjectId",
  "name": "React",
  "category": "Programming",
  "level": "advanced",
  "type": "offered",
  "owner": "ObjectId → User",
  "description": "Hooks, Context, Redux"
}
```

### `sessions`
```json
{
  "_id": "ObjectId",
  "teacher": "ObjectId → User",
  "learner": "ObjectId → User",
  "skill": "ObjectId → Skill",
  "title": "React Hooks Deep Dive",
  "scheduledDate": "ISODate",
  "duration": 60,
  "status": "confirmed",
  "creditsCharged": 5
}
```

### `feedbacks`
```json
{
  "_id": "ObjectId",
  "session": "ObjectId → Session",
  "reviewer": "ObjectId → User",
  "reviewee": "ObjectId → User",
  "rating": 5,
  "comment": "Great session!"
}
```

---

## Useful MongoDB Commands

Open MongoDB shell:
```bash
mongosh
```

```javascript
// Switch to skillswap database
use skillswap

// View all users
db.users.find().pretty()

// View all skills
db.skills.find().pretty()

// View sessions
db.sessions.find().pretty()

// Find a specific user by email
db.users.findOne({ email: "sagar@demo.com" })

// Count documents in each collection
db.users.countDocuments()
db.skills.countDocuments()
db.sessions.countDocuments()

// Delete all data (reset)
db.users.deleteMany({})
db.skills.deleteMany({})
db.sessions.deleteMany({})
db.feedbacks.deleteMany({})
```

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

---

## Troubleshooting

**"MongoDB connection refused"**
- Make sure MongoDB service is running:
  - Windows: `net start MongoDB` in Command Prompt (Admin)
  - macOS: `brew services start mongodb-community`
  - Linux: `sudo systemctl start mongod`

**"Port 5000 already in use"**
- Change `PORT=5001` in `backend/.env`
- Also update the proxy in `frontend/package.json` to `"proxy": "http://localhost:5001"`

**"CORS error" in browser**
- Make sure `CLIENT_URL=http://localhost:3000` in `.env` matches your frontend URL exactly

**"npm not found"**
- Install Node.js from https://nodejs.org (LTS version)

**Sessions not matching**
- Go to Profile page → copy your User ID
- Share with the other user so they can enter it in the session form

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Realtime | Socket.IO (for future chat) |
| Styling | Pure CSS (custom design system) |
