# COSAKU Votes - Real-Time University Voting System

A modern, secure, and real-time voting platform for COSAKU (Computing Students Association of Kabale University) Executive Committee elections.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

COSAKU Votes is a comprehensive voting management system designed specifically for university elections. It provides:
- **Real-time results** with live updates via WebSockets
- **Secure authentication** with email verification
- **Admin controls** for election management
- **Audit trails** for all actions
- **Mobile-responsive design** using Tailwind CSS

---

## ✨ Features

### 🗳️ Voter Features

- **Registration & Email Verification**
  - Secure email-based voter registration
  - Kabale University email format validation (2024akcs0001gf@kab.ac.ug)
  - 24-hour verification token expiry
  - Auto-login after email verification

- **Vote Casting**
  - Cast up to 9 votes (one per position)
  - Review votes before submission
  - Cannot change vote once submitted

- **Live Results**
  - Real-time election results with charts
  - Results update as votes come in
  - View individual position results

- **Dashboard**
  - Voter voting progress
  - Current election status
  - Vote history

### 👨‍💼 Admin Features

- **Election Management**
  - Create new elections
  - Start, pause, close, and publish elections
  - Set election timeline

- **Candidate Management**
  - Add candidates with manifestos and slogans
  - Organize by position

- **Vote Management**
  - Edit submitted votes with audit trail
  - Add reasons for vote changes
  - Track all modifications

- **Dashboard & Reporting**
  - Real-time admin dashboard
  - Participation statistics
  - Download results as PDF/CSV
  - Complete audit logs

- **Voter Management**
  - View all registered voters
  - Verify voter emails
  - Track voter participation

---

## 🛠️ Technology Stack

### Backend
| Component | Technology |
|-----------|-----------|
| Runtime | Node.js v16+ |
| Framework | Express.js |
| Database | PostgreSQL (Neon) |
| Real-time | Socket.IO |
| Auth | JWT (JSON Web Tokens) |
| Password | bcryptjs |
| Email | Nodemailer |
| Module System | ES6+ |

### Frontend
| Component | Technology |
|-----------|-----------|
| Framework | React 19 |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| API Client | Axios |
| Real-time | Socket.IO Client |
| Routing | React Router DOM v6 |
| Exports | jsPDF, html2canvas, xlsx |

---

## 📁 Project Structure

```
cosaku-votes/
├── backend/
│   ├── src/
│   │   ├── config/              # Database & environment config
│   │   ├── controllers/         # Business logic
│   │   ├── routes/              # API endpoints
│   │   ├── middleware/          # Auth & validation
│   │   ├── utils/               # Helpers & utilities
│   │   ├── sockets/             # Socket.IO events
│   │   ├── app.js               # Express app setup
│   │   └── server.js            # Server entry point
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios client
│   │   ├── components/          # Reusable components
│   │   ├── layouts/             # Layout wrappers
│   │   ├── pages/               # Page components
│   │   ├── utils/               # Services & utilities
│   │   ├── sockets/             # Socket.IO client
│   │   ├── App.jsx              # Main routing
│   │   └── main.jsx             # Entry point
│   ├── .env
│   ├── tailwind.config.js
│   └── package.json
│
└── .github/
    └── workflows/
        └── deploy.yml           # GitHub Actions CI/CD
```

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js v16 or higher
- npm or yarn
- PostgreSQL database (or Neon cloud database)
- Git

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** with your configuration
   ```bash
   cp .env.example .env
   ```

4. **Update `.env` with your values**
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/cosaku_votes
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   
   # Email Configuration (Gmail)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_specific_password
   EMAIL_FROM=COSAKU Votes <noreply@cosaku.com>
   
   # Client URL
   CLIENT_URL=http://localhost:5173
   
   # Admin Credentials (set in environment variables during deployment)
   DEFAULT_ADMIN_NAME=your_admin_name
   DEFAULT_ADMIN_EMAIL=your_admin_email
   DEFAULT_ADMIN_PASSWORD=your_secure_password
   ```

5. **Initialize database**
   ```bash
   npm run init-db
   ```

6. **Seed default admin account**
   ```bash
   npm run seed
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```
   Server runs on: `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

4. **Update `.env` with your values**
   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend runs on: `http://localhost:5173`

---

## 🎮 Running the Application

### Both Frontend & Backend (Recommended)

Open two terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register                    - Register new voter
POST   /api/auth/login                       - Login
GET    /api/auth/verify-email?token=xxx      - Verify email
POST   /api/auth/resend-verification         - Resend verification
GET    /api/auth/me                          - Get current user
```

### Elections
```
GET    /api/elections/active                 - Get active election
GET    /api/elections                        - List all elections
POST   /api/admin/elections                  - Create election (admin)
PATCH  /api/admin/elections/:id/start        - Start election (admin)
PATCH  /api/admin/elections/:id/pause        - Pause election (admin)
PATCH  /api/admin/elections/:id/close        - Close election (admin)
PATCH  /api/admin/elections/:id/publish      - Publish results (admin)
```

### Candidates
```
GET    /api/candidates                       - Get all candidates
GET    /api/candidates/by-position           - Get candidates by position
POST   /api/candidates                       - Add candidate (admin)
PATCH  /api/candidates/:id                   - Update candidate (admin)
DELETE /api/candidates/:id                   - Delete candidate (admin)
```

### Voting
```
POST   /api/vote/submit                      - Submit a vote
GET    /api/vote/my-votes                    - Get my votes
GET    /api/vote/by-position                 - Get votes by position
```

### Results
```
GET    /api/results/live                     - Get live results
GET    /api/results/position/:positionId     - Get position results
GET    /api/results/published                - Get published results
```

### Admin
```
GET    /api/admin/dashboard                  - Admin dashboard
GET    /api/admin/voters                     - List voters
GET    /api/admin/votes                      - List all votes
PATCH  /api/admin/votes/:voteId              - Edit a vote (admin)
GET    /api/admin/vote-edit-logs             - Vote edit history
```

---

## 💾 Database Schema

### Users
- `id`, `full_name`, `email`, `password_hash`, `role`, `is_email_verified`, `email_verification_token`, `created_at`, `updated_at`

### Elections
- `id`, `title`, `status` (draft/active/paused/closed/published), `start_time`, `end_time`, `results_published`, `created_at`, `updated_at`

### Positions
- `id`, `election_id`, `name`, `description`, `display_order`, `created_at`

### Candidates
- `id`, `election_id`, `position_id`, `full_name`, `program`, `slogan`, `manifesto`, `created_at`, `updated_at`

### Votes
- `id`, `election_id`, `position_id`, `candidate_id`, `voter_id`, `last_edited_by`, `created_at`, `updated_at`
- **Constraint**: One vote per voter per position

### Vote Edit Logs
- `id`, `vote_id`, `edited_by_admin_id`, `election_id`, `position_id`, `old_candidate_id`, `new_candidate_id`, `reason`, `created_at`

### Audit Logs
- `id`, `actor_id`, `action`, `details` (JSON), `created_at`

---

## 🚢 Deployment

### Deploy to Render

1. **Create Render Account**: https://render.com

2. **Connect GitHub Repository**
   - Sign in to Render
   - Create new PostgreSQL database
   - Create new Web Service
   - Connect your GitHub repo

3. **Set Environment Variables**
   In Render Dashboard → Environment:
   ```
   DATABASE_URL=your_neon_database_url
   JWT_SECRET=your_secret_key
   EMAIL_USER=your_email
   EMAIL_PASS=your_app_password
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```

4. **Deploy Frontend to Vercel**
   - Push to GitHub
   - Sign in to Vercel
   - Import your GitHub repo
   - Deploy

5. **GitHub Actions CI/CD** (Optional)
   - Add `RENDER_DEPLOY_HOOK` secret to GitHub
   - Workflow automatically triggers on push to main

---

## 🐛 Troubleshooting

### Database Connection Issues
```
✗ Error: connect ECONNREFUSED
→ Check DATABASE_URL in .env
→ Ensure PostgreSQL is running
→ Verify credentials are correct
```

### Email Not Sending
```
✗ Error: Invalid login
→ Use app-specific password for Gmail (not regular password)
→ Enable "Less secure app access"
→ Verify EMAIL_USER and EMAIL_PASS in .env
```

### CORS Errors
```
✗ Error: No 'Access-Control-Allow-Origin' header
→ Verify CLIENT_URL in backend .env
→ Verify VITE_API_URL in frontend .env
→ Both must include http:// or https://
```

### Port Already in Use
```
Backend (5000):
  kill $(lsof -t -i:5000)

Frontend (5173):
  kill $(lsof -t -i:5173)
```

---

## 🎨 Design System

### Color Palette
- **Golden Yellow** (#F5B700) - Primary highlight
- **Deep Navy** (#0B1F3A) - Primary dark
- **Soft White** (#F8FAFC) - Background
- **Emerald Green** (#10B981) - Success
- **Red** (#EF4444) - Errors

### Responsive Design
- Mobile-first approach
- Tailwind CSS utilities
- Works on all devices

---

## 🔒 Security Features

- ✅ Email verification required to vote
- ✅ JWT token-based authentication
- ✅ Bcryptjs password hashing
- ✅ One vote per position per voter (DB constraint)
- ✅ Complete audit logging
- ✅ Vote edit tracking with reasons
- ✅ CORS protection
- ✅ Input validation & sanitization

---

## 📞 Support

For issues or questions, please:
1. Check the [Troubleshooting](#troubleshooting) section
2. Create a GitHub issue
3. Contact the development team

---

## 📄 License

Built for COSAKU Elections at Kabale University.

---

**Last Updated**: April 27, 2026
