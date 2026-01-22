# 🎯 AI-Driven Candidate-Job Matching System

An intelligent recruitment platform powered by **Google Gemini AI** that matches candidates with jobs based on skills, experience, and AI analysis. Features **role-based access control** with separate interfaces for recruiters, candidates, and admins.

---

## ✨ Features

### 🤖 AI-Powered Matching
- **Gemini AI Integration**: Intelligent resume analysis using Google's Gemini Pro
- **Multi-Factor Scoring**: Combines AI analysis (50%), skills matching (30%), and keyword alignment (20%)
- **Strict Filtering**: Automatically rejects non-matching profiles (< 30% threshold)
- **Smart Rejection Reasons**: Clear explanations for why candidates don't match

### 🔐 Role-Based Access Control
- **Recruiter Role**: Post jobs, match candidates, view only their own jobs
- **Candidate Role**: Upload resumes, view available jobs, see match results
- **Admin Role**: Full access to all jobs, candidates, and matches
- **JWT Authentication**: Secure token-based authentication with httpOnly cookies

### 📊 Advanced Matching Features
- Color-coded match badges (Green/Yellow/Orange/Red)
- Progress bars for visual score representation
- Confidence levels (High/Medium/Low)
- AI-generated summaries for each match
- Toggle to show/hide rejected candidates
- Recruiter feedback system

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (running locally or remote)
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd AI-Driven-Candidate-Job-Matching-System

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Configuration

Create a `.env` file in the root directory:

```env
MONGO_URI=mongodb://127.0.0.1:27017/ai_job_matcher
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
```

### Running the Application

```bash
# Terminal 1 - Start Backend (with auto-reload)
npx nodemon server.js

# Terminal 2 - Start Frontend
cd client
npm start
```

**Access the application**: http://localhost:3001

---

## 📖 Usage Guide

### For Recruiters

1. **Sign Up**: Create account with "Recruiter" role
2. **Post Jobs**: Add job title, description, and required skills
3. **Match Candidates**: Click "Match" button for each candidate
4. **View Results**: See color-coded match scores, AI summaries, and skill gaps
5. **Provide Feedback**: Add notes to refine future matching

### For Candidates

1. **Sign Up**: Create account with "Candidate" role
2. **Upload Resume**: Upload PDF resume (auto-parsed)
3. **View Jobs**: Browse available job openings
4. **Get Matched**: Recruiters will match you with relevant jobs

### For Admins

1. **Login**: Use admin credentials (create manually in DB)
2. **Manage All**: Access all jobs and candidates across the platform
3. **Monitor**: View all matching activity

---

## 🏗️ Tech Stack

### Backend
- **Node.js** + **Express.js**: RESTful API
- **MongoDB** + **Mongoose**: Database and ODM
- **Google Generative AI**: Gemini Pro for intelligent matching
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **Multer**: File upload handling
- **PDF.js**: Resume parsing

### Frontend
- **React.js**: UI library
- **React Router**: Client-side routing
- **Bootstrap 5**: Responsive design
- **Axios**: HTTP client

---

## 📁 Project Structure

```
AI-Driven-Candidate-Job-Matching-System/
├── client/                  # React frontend
│   ├── src/
│   │   ├── App.js          # Main app with routing
│   │   ├── Dashboard.js    # Role-based dashboard
│   │   ├── Login.js        # Login page
│   │   ├── Signup.js       # Signup page
│   │   ├── AuthContext.js  # Auth state management
│   │   ├── PrivateRoute.js # Protected route wrapper
│   │   ├── JobForm.js      # Job posting form
│   │   ├── CandidateUpload.js  # Resume upload
│   │   ├── MatchTable.js   # Candidate matching UI
│   │   └── MatchResult.js  # Match results display
│   └── package.json
├── models/
│   ├── User.js             # User model (auth)
│   ├── Job.js              # Job model
│   ├── Candidate.js        # Candidate model
│   └── Match.js            # Match results model
├── routes/
│   ├── authRoutes.js       # Auth endpoints
│   ├── JobRoutes.js        # Job CRUD
│   ├── candidateRoutes.js  # Candidate CRUD
│   └── matchRoutes.js      # Matching logic
├── services/
│   └── geminiService.js    # AI matching service
├── middleware/
│   └── auth.js             # JWT auth middleware
├── config/
│   └── db.js               # MongoDB connection
├── server.js               # Express server
├── .env                    # Environment variables
└── package.json
```

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT tokens in httpOnly cookies (XSS protection)
- ✅ Role-based authorization middleware
- ✅ CORS configuration with credentials
- ✅ Input validation on all routes
- ✅ Protected API endpoints
- ✅ Data isolation by user role

---

## 🧪 Testing

### Test Recruiter Flow
```bash
# Signup as recruiter
Email: recruiter@test.com
Password: password123
Role: Recruiter

# Post a job
Title: Senior React Developer
Skills: React, JavaScript, Node.js
```

### Test Candidate Flow
```bash
# Signup as candidate
Email: candidate@test.com
Password: password123
Role: Candidate

# Upload resume (PDF)
```

### Test Matching
1. Login as recruiter
2. Click "Match" on a candidate
3. View AI-generated match score and analysis

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Jobs (Protected)
- `POST /api/jobs` - Create job (recruiter/admin)
- `GET /api/jobs` - Get jobs (filtered by role)
- `DELETE /api/jobs/:id` - Delete job (owner/admin)

### Candidates (Protected)
- `POST /api/candidates/upload` - Upload resume
- `GET /api/candidates` - Get candidates (filtered by role)

### Matching (Protected)
- `POST /api/match/:jobId/:candidateId` - Match candidate to job
- `GET /api/match/:jobId` - Get match results
- `PUT /api/match/feedback/:matchId` - Add recruiter feedback

---

## 🎨 Screenshots

### Login Page
Clean authentication interface with role selection

### Recruiter Dashboard
- Post jobs
- View candidates
- Match and rank candidates
- Color-coded match results

### Candidate Dashboard
- Upload resume
- Browse available jobs
- View match status

### Match Results Table
- Score percentages with progress bars
- Matched vs missing skills
- AI-generated summaries
- Confidence levels
- Rejection reasons

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/ai_job_matcher` |
| `GEMINI_API_KEY` | Google Gemini API key | Required |
| `JWT_SECRET` | Secret for JWT signing | Required (change in production!) |
| `JWT_EXPIRE` | JWT token expiry | `7d` |
| `JWT_COOKIE_EXPIRE` | Cookie expiry (days) | `7` |

---

## 🚧 Future Enhancements

- [ ] Email verification on signup
- [ ] Password reset functionality
- [ ] Resume PDF parsing improvements
- [ ] Batch candidate matching
- [ ] Export match results to CSV/PDF
- [ ] Advanced filtering and search
- [ ] Interview scheduling integration
- [ ] Email notifications
- [ ] Analytics dashboard
- [ ] OAuth login (Google/LinkedIn)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Satyam**
- GitHub: [@Satyam00237](https://github.com/Satyam00237)

---

## 🙏 Acknowledgments

- Google Gemini AI for intelligent matching
- MongoDB for flexible data storage
- React.js community for excellent documentation
- Bootstrap for responsive design

---

## 📞 Support

For issues or questions, please open an issue on GitHub or contact the maintainer.

---

## Frontend Repository
Client UI: https://github.com/Satyam00237/AI-Driven-Candidate-Job-Matching-System


**Made with ❤️ using React, Node.js, and Google Gemini AI**
