# COSAKU Votes - Real-Time University Voting System

A modern, real-time voting platform for COSAKU (Computing Students Association of Kabale University) Executive Committee elections.

## Project Structure

### Backend (Node.js/Express)
- `src/config/` - Database and environment configuration
- `src/controllers/` - Business logic for each feature
- `src/routes/` - API endpoints
- `src/middleware/` - Authentication and validation middleware
- `src/utils/` - Utilities (validators, email, tokens)
- `src/sockets/` - Socket.IO for real-time updates
- `src/server.js` - Main server entry point
- `src/app.js` - Express app setup

### Frontend (React/Vite)
- `src/pages/` - Full page components
- `src/components/` - Reusable components
- `src/layouts/` - Layout wrappers
- `src/utils/` - Services and utilities
- `src/api/` - Axios API client
- `src/sockets/` - Socket.IO client
- `App.jsx` - Main routing

## Features

### Voter Features
- **Registration & Email Verification**: Secure email-based voter registration with Kabale University email format validation
- **Vote Casting**: Cast up to 9 votes (one per position)
- **Vote Review**: Review your votes before final submission
- **Live Results**: Real-time election results with charts
- **Dashboard**: Voter dashboard with voting progress

### Admin Features
- **Candidate Management**: Add, edit, and delete candidates
- **Election Control**: Start, pause, close, and publish elections
- **Vote Management**: Edit submitted votes with full audit trail
- **Live Results Monitoring**: Real-time results dashboard
- **Reports**: Download election results as PDF/CSV
- **Voter Management**: View registered voters
- **Audit Logs**: Complete audit trail of all actions

## Election Positions

1. President
2. Vice President
3. Speaker
4. Deputy Speaker
5. Project Lead
6. General Secretary
7. Publicity Secretary
8. Treasurer
9. Guild Council Representative

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Password**: bcryptjs
- **Email**: Nodemailer
- **File Upload**: Multer
- **Module System**: ES6+

### Frontend
- **Framework**: React 19
- **Build**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **API Client**: Axios
- **Real-time**: Socket.IO Client
- **Routing**: React Router DOM
- **Export**: jsPDF, html2canvas, xlsx
- **Module System**: ES6+

## Setup Instructions

### Prerequisites
- Node.js v16+ and npm
- PostgreSQL database (or Neon)
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

3. **Create .env file** (already created, update with your values)
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   JWT_SECRET=your_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

4. **Initialize database**
   ```bash
   npm start
   ```
   The database schema will be created automatically on first run.

5. **Seed admin account**
   ```bash
   npm run seed
   ```

6. **Start server**
   ```bash
   npm run dev
   ```
   Server will run on http://localhost:5000

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Ensure .env is configured** (already created)
   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend will run on http://localhost:5173

## Default Admin Account

- **Email**: edyeluandrew@outlook.com
- **Password**: stellar.onchain

## Email Validation Rules

Valid Kabale University email format:
```
YEAR + a + PROGRAM_CODE + 4_DIGITS + STUDY_TYPE + @kab.ac.ug
```

Examples:
- 2023akcs0047gf@kab.ac.ug ✓
- 2024akit0147f@kab.ac.ug ✓
- 2025adcs9999gf@kab.ac.ug ✓

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new voter
- `POST /api/auth/login` - Login voter
- `GET /api/auth/verify-email?token=...` - Verify email
- `POST /api/auth/resend-verification` - Resend verification email
- `GET /api/auth/me` - Get current user

### Candidates
- `GET /api/candidates` - Get candidates
- `GET /api/candidates/by-position` - Get candidates grouped by position
- `POST /api/candidates` - Add candidate (admin)
- `PATCH /api/candidates/:id` - Update candidate (admin)
- `DELETE /api/candidates/:id` - Delete candidate (admin)

### Voting
- `POST /api/vote/submit` - Submit a vote
- `GET /api/vote/my-votes` - Get my votes
- `GET /api/vote/by-position` - Get votes by position

### Results
- `GET /api/results/live` - Get live results
- `GET /api/results/position/:positionId/:electionId` - Get position results
- `GET /api/results/published` - Get published results

### Admin
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/voters` - List voters
- `GET /api/admin/votes` - List all votes
- `PATCH /api/admin/votes/:voteId` - Edit a vote
- `GET /api/admin/vote-edit-logs` - Get vote edit logs
- `PATCH /api/admin/elections/:id/start` - Start election
- `PATCH /api/admin/elections/:id/pause` - Pause election
- `PATCH /api/admin/elections/:id/close` - Close election
- `PATCH /api/admin/elections/:id/publish` - Publish results

## Database Schema

### Users Table
- id, full_name, email, password_hash, role, is_email_verified, email_verification_token, created_at, updated_at

### Elections Table
- id, title, status, start_time, end_time, results_published, created_at, updated_at

### Positions Table
- id, election_id, name, description, display_order, created_at

### Candidates Table
- id, election_id, position_id, full_name, program, profile_picture_url, slogan, manifesto, created_at, updated_at

### Votes Table
- id, election_id, position_id, candidate_id, voter_id, last_edited_by, created_at, updated_at
- UNIQUE(voter_id, position_id)

### Vote Edit Logs Table
- id, vote_id, edited_by_admin_id, election_id, position_id, old_candidate_id, new_candidate_id, reason, created_at

### Audit Logs Table
- id, actor_id, action, details (JSONB), created_at

## Real-Time Features

### Socket.IO Events
- **join_election** - Join election room for updates
- **leave_election** - Leave election room
- **results:update** - Results update event (broadcast to all clients in room)

## Security Features

- **Email Verification**: Only verified emails can vote
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcryptjs for secure password storage
- **Vote Uniqueness**: One vote per position per voter (database constraint)
- **Audit Logging**: Complete audit trail of all actions
- **Vote Edit Logging**: Track all vote changes with reasons

## Color Theme

- **Golden Yellow**: #F5B700 (Primary highlight)
- **Deep Navy**: #0B1F3A (Primary dark)
- **Soft White**: #F8FAFC (Background)
- **Emerald Green**: #10B981 (Success states)
- **Red**: #EF4444 (Error states)

## File Structure

```
cosaku-votes/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── sockets/
│   │   ├── utils/
│   │   ├── uploads/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env
│   ├── .gitignore
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── sockets/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── App.css
│   ├── .env
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── README.md
```

## Development Notes

### Backend
- Uses ES6+ module syntax exclusively
- Database auto-initializes on first run
- Admin account auto-created if doesn't exist
- Comprehensive error handling with detailed error messages

### Frontend
- Fully responsive with Tailwind CSS
- Real-time updates via Socket.IO
- Protected routes for authenticated users
- Role-based access control (voter vs admin)

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL in .env
- Ensure PostgreSQL is running
- Check database credentials

### Email Not Sending
- Enable "Less secure app access" in Gmail
- Use app-specific password for Gmail
- Verify EMAIL_USER and EMAIL_PASS in .env

### CORS Issues
- Verify CLIENT_URL in backend .env
- Verify VITE_API_URL and VITE_SOCKET_URL in frontend .env
- Ensure both are running on correct ports

## License

This project is built for COSAKU Elections at Kabale University.

## Support

For issues or questions, please contact the development team.
