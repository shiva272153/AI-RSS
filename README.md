# 🤖 AI-Based Resume Screening & Job Matching System

> An intelligent web-based recruitment automation system that leverages **Natural Language Processing (NLP)** and **Machine Learning (ML)** to screen resumes and match candidates to job descriptions using **TF-IDF Vectorization** and **Cosine Similarity**.

---

## 📌 Abstract

The recruitment process in modern organizations involves handling a large number of job applications, making manual resume screening time-consuming and inefficient. This project aims to **automate and optimize the candidate selection process** using NLP and machine learning techniques.

Candidates upload their resumes through a web-based application. The uploaded resumes are processed to extract textual content, which is then transformed into numerical vectors using the **TF-IDF (Term Frequency–Inverse Document Frequency)** technique. Similarly, job descriptions posted by recruiters are also vectorized. **Cosine Similarity** is applied to measure the similarity between resumes and job descriptions, generating a matching score that represents the suitability of a candidate for a particular job role.

The system ranks candidates based on their similarity scores and provides insights into **matching skills** and **missing requirements**.

---

## ✨ Features

### For Candidates
- 📄 **Resume Upload** — Drag-and-drop PDF/DOCX upload with instant text extraction
- 🔍 **Job Browsing** — Search and filter active job listings
- 📊 **Match Score** — Calculate AI-powered match score against any job
- 🏷️ **Skill Insights** — View matched skills and missing skills for each job
- 📈 **Dashboard** — Overview of resume status, skills detected, and match history

### For Recruiters
- 📝 **Job Posting** — Create, edit, and manage job listings with required skills
- 🤖 **Batch Screening** — Screen all candidates against a job with one click
- 🏆 **Candidate Rankings** — View candidates ranked by match score
- 📉 **Analytics** — Visual bar charts showing match score distribution
- 👤 **Candidate Details** — View individual candidate skills and contact info

### System
- 🔐 **JWT Authentication** — Secure login/register with role-based access
- 🎨 **Modern Dark UI** — Premium glassmorphism design with smooth animations
- 📱 **Responsive** — Works on desktop, tablet, and mobile devices

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18, Vite | Single Page Application |
| **Routing** | React Router v6 | Client-side navigation |
| **Charts** | Recharts | Data visualization |
| **Styling** | Vanilla CSS | Custom dark theme design system |
| **Backend** | Node.js, Express.js | REST API server |
| **Database** | MongoDB, Mongoose | Document storage & ODM |
| **Authentication** | JWT, bcryptjs | Stateless auth with password hashing |
| **File Upload** | Multer | Resume file handling (PDF/DOCX) |
| **ML Engine** | Python 3, Flask | Machine Learning microservice |
| **NLP** | NLTK | Tokenization, stopwords, lemmatization |
| **Vectorization** | scikit-learn (TF-IDF) | Text-to-vector transformation |
| **Similarity** | scikit-learn (Cosine) | Resume-job similarity scoring |
| **Text Extraction** | PyMuPDF, python-docx | PDF and DOCX text parsing |

---

## 📁 Project Structure

```
AI-Resume Screening System/
│
├── frontend/                          # React Application (Vite)
│   ├── src/
│   │   ├── components/                # Reusable UI components
│   │   │   ├── Navbar.jsx             #   Navigation bar with role-based links
│   │   │   └── Navbar.css
│   │   ├── pages/                     # Route-level pages
│   │   │   ├── Home.jsx               #   Landing page with hero & features
│   │   │   ├── Login.jsx              #   User login form
│   │   │   ├── Register.jsx           #   User registration with role selection
│   │   │   ├── CandidateDashboard.jsx #   Candidate overview & stats
│   │   │   ├── RecruiterDashboard.jsx #   Job management & screening
│   │   │   ├── ResumeUpload.jsx       #   Drag-and-drop resume upload
│   │   │   ├── JobListings.jsx        #   Browse & search jobs
│   │   │   ├── CreateJob.jsx          #   Create/edit job posting form
│   │   │   └── CandidateRankings.jsx  #   Ranked candidates with charts
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Auth state management (React Context)
│   │   ├── services/
│   │   │   ├── api.js                 # Axios client with JWT interceptor
│   │   │   └── services.js            # API service functions
│   │   ├── index.css                  # Global design system (CSS variables)
│   │   ├── App.jsx                    # Root component with routing
│   │   └── main.jsx                   # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── backend/                           # Node.js REST API
│   ├── config/
│   │   └── db.js                      # MongoDB connection
│   ├── models/
│   │   ├── User.js                    # User schema (candidate/recruiter)
│   │   ├── Resume.js                  # Resume schema (text, skills)
│   │   ├── Job.js                     # Job schema (description, skills)
│   │   └── Match.js                   # Match schema (score, skills)
│   ├── controllers/
│   │   ├── authController.js          # Register, login, profile
│   │   ├── resumeController.js        # Upload, extract, delete
│   │   ├── jobController.js           # CRUD operations
│   │   └── matchController.js         # Single & batch match calculation
│   ├── middleware/
│   │   ├── authMiddleware.js          # JWT verification & role guard
│   │   ├── uploadMiddleware.js        # Multer config (PDF/DOCX, 5MB)
│   │   └── errorHandler.js            # Centralized error handling
│   ├── routes/
│   │   ├── authRoutes.js              # /api/auth/*
│   │   ├── resumeRoutes.js            # /api/resumes/*
│   │   ├── jobRoutes.js               # /api/jobs/*
│   │   └── matchRoutes.js             # /api/matches/*
│   ├── uploads/                       # Uploaded resume files
│   ├── server.js                      # Express entry point
│   ├── package.json
│   └── .env                           # Environment variables
│
├── ml-engine/                         # Python ML Microservice
│   ├── app.py                         # Flask API server
│   ├── text_extractor.py              # PDF & DOCX text extraction
│   ├── preprocessor.py                # NLP preprocessing pipeline
│   ├── matcher.py                     # TF-IDF + Cosine Similarity
│   ├── skill_extractor.py             # Skill identification engine
│   ├── data/
│   │   └── skills_dataset.json        # 250+ skills across 8 categories
│   └── requirements.txt               # Python dependencies
│
├── .gitignore
└── README.md
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT (Browser)                       │
│                   React 18 + Vite (Port 5173)                │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │  Login/   │  │  Resume  │  │   Job    │  │  Dashboard/  │ │
│  │ Register  │  │  Upload  │  │ Listings │  │   Rankings   │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API (HTTP)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (Node.js + Express)                   │
│                       Port 5000                              │
│                                                              │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌──────────────────┐   │
│  │  Auth  │  │ Resume │  │  Job   │  │  Match           │   │
│  │  API   │  │  API   │  │  API   │  │  API             │   │
│  └────────┘  └────────┘  └────────┘  └────────┬─────────┘   │
│       │           │           │               │              │
│       └───────────┴───────────┴───────┬───────┘              │
│                                       │                      │
│                              ┌────────▼────────┐             │
│                              │    MongoDB      │             │
│                              │  (Port 27017)   │             │
│                              └─────────────────┘             │
└───────────────────────────────┬──────────────────────────────┘
                                │ HTTP (Internal)
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                ML ENGINE (Python + Flask)                     │
│                       Port 5001                              │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │    Text     │  │     NLP      │  │   TF-IDF +        │   │
│  │ Extraction  │──▶│ Preprocessing│──▶│ Cosine Similarity │   │
│  │ (PDF/DOCX)  │  │   (NLTK)    │  │  (scikit-learn)   │   │
│  └─────────────┘  └──────────────┘  └───────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              Skill Extraction Engine                  │    │
│  │         (250+ skills across 8 categories)            │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 How It Works — ML Pipeline

```
Resume (PDF/DOCX)                    Job Description
       │                                    │
       ▼                                    ▼
┌──────────────┐                   ┌──────────────┐
│    Text      │                   │    Text      │
│  Extraction  │                   │  Cleaning    │
│ (PyMuPDF /   │                   │              │
│  python-docx)│                   │              │
└──────┬───────┘                   └──────┬───────┘
       │                                  │
       ▼                                  ▼
┌──────────────┐                   ┌──────────────┐
│     NLP      │                   │     NLP      │
│Preprocessing │                   │Preprocessing │
│• Lowercase   │                   │• Lowercase   │
│• Tokenize    │                   │• Tokenize    │
│• Stop words  │                   │• Stop words  │
│• Lemmatize   │                   │• Lemmatize   │
└──────┬───────┘                   └──────┬───────┘
       │                                  │
       ▼                                  ▼
┌─────────────────────────────────────────────────┐
│           TF-IDF Vectorization                   │
│    (Term Frequency × Inverse Document Freq)      │
│         Unigrams + Bigrams                       │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│           Cosine Similarity                      │
│    similarity = (A · B) / (||A|| × ||B||)       │
│    Score Range: 0% to 100%                       │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│        Combined Scoring Formula                  │
│                                                  │
│  Final Score = (TF-IDF Score × 0.6)             │
│              + (Skill Match Score × 0.4)         │
│                                                  │
│  Where Skill Match = Matched / Required × 100   │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │   Ranked Results    │
          │ + Matched Skills    │
          │ + Missing Skills    │
          └─────────────────────┘
```

---

## 🗄️ Database Schema (MongoDB)

### Users Collection
```javascript
{
  name:      String,          // Full name
  email:     String (unique), // Login email
  password:  String,          // bcrypt hashed
  role:      "candidate" | "recruiter",
  phone:     String,
  createdAt: Date,
  updatedAt: Date
}
```

### Resumes Collection
```javascript
{
  userId:        ObjectId → User,
  fileName:      String,        // Original filename
  filePath:      String,        // Server storage path
  fileType:      "pdf" | "docx",
  extractedText: String,        // Raw text from document
  processedText: String,        // NLP-cleaned text
  skills:        [String],      // AI-extracted skills
  createdAt:     Date
}
```

### Jobs Collection
```javascript
{
  recruiterId:   ObjectId → User,
  title:         String,
  company:       String,
  description:   String,
  requirements:  String,
  requiredSkills: [String],     // Skills needed for the role
  location:      String,
  salary:        String,
  jobType:       "full-time" | "part-time" | "internship" | "contract",
  status:        "active" | "closed",
  createdAt:     Date
}
```

### Matches Collection
```javascript
{
  resumeId:      ObjectId → Resume,
  jobId:         ObjectId → Job,
  candidateId:   ObjectId → User,
  matchScore:    Number (0–100),   // Combined AI score
  matchedSkills: [String],         // Skills found in both
  missingSkills: [String],         // Required but not found
  createdAt:     Date
}
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login & receive JWT | ❌ |
| `GET` | `/api/auth/profile` | Get current user profile | ✅ |
| `PUT` | `/api/auth/profile` | Update profile | ✅ |

### Resumes
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `POST` | `/api/resumes/upload` | Upload resume (PDF/DOCX) | Candidate |
| `GET` | `/api/resumes/my` | Get own resume | Candidate |
| `GET` | `/api/resumes/:id` | Get resume by ID | Any |
| `DELETE` | `/api/resumes/:id` | Delete resume | Candidate |

### Jobs
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `POST` | `/api/jobs` | Create job posting | Recruiter |
| `GET` | `/api/jobs` | List all active jobs | Public |
| `GET` | `/api/jobs/my` | List recruiter's own jobs | Recruiter |
| `GET` | `/api/jobs/:id` | Get job details | Public |
| `PUT` | `/api/jobs/:id` | Update job | Recruiter |
| `DELETE` | `/api/jobs/:id` | Delete job | Recruiter |

### Matches
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `POST` | `/api/matches/calculate/:jobId` | Calculate match for a job | Candidate |
| `POST` | `/api/matches/calculate-all/:jobId` | Screen all candidates | Recruiter |
| `GET` | `/api/matches/job/:jobId` | Get ranked candidates | Recruiter |
| `GET` | `/api/matches/my` | Get own match history | Candidate |
| `GET` | `/api/matches/:id` | Get match details | Any |

### ML Engine (Internal)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/extract-text` | Extract text from PDF/DOCX |
| `POST` | `/preprocess` | NLP preprocessing |
| `POST` | `/calculate-match` | TF-IDF + Cosine Similarity |
| `POST` | `/extract-skills` | Skill identification |
| `GET` | `/health` | Health check |

---

## ⚡ Installation & Setup

### Prerequisites

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | v18+ | Backend & Frontend runtime |
| Python | v3.9+ | ML Engine runtime |
| MongoDB | v6+ | Database (local or [MongoDB Atlas](https://www.mongodb.com/atlas)) |
| npm | v9+ | Package management |
| pip | v22+ | Python package management |

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd "AI-Resume Screening System"
```

### Step 2: Backend Setup
```bash
cd backend
npm install
```

Configure the `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-resume-screening
JWT_SECRET=your_super_secret_jwt_key_change_this
ML_ENGINE_URL=http://localhost:5001
```

Start the backend server:
```bash
npm run dev
```
> ✅ Server runs at **http://localhost:5000**

### Step 3: ML Engine Setup
```bash
cd ml-engine
pip install -r requirements.txt
python app.py
```
> ✅ ML Engine runs at **http://localhost:5001**
>
> 📝 NLTK data (tokenizers, stopwords, wordnet) will be downloaded automatically on first run.

### Step 4: Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
> ✅ Frontend runs at **http://localhost:5173**

### Step 5: Open in Browser
Navigate to **http://localhost:5173** and:
1. **Register** as a **Candidate** — upload your resume, browse jobs, check match scores
2. **Register** as a **Recruiter** — post jobs, screen candidates, view rankings

---

## 🖥️ Usage Workflow

### Candidate Flow
```
Register → Upload Resume (PDF/DOCX) → Browse Jobs → Click "Check Match"
                                                         │
                                             ┌───────────▼───────────┐
                                             │  AI calculates score  │
                                             │  Shows matched skills │
                                             │  Shows missing skills │
                                             └───────────────────────┘
```

### Recruiter Flow
```
Register → Post Job (with required skills) → Click "Screen Candidates"
                                                     │
                                         ┌───────────▼───────────┐
                                         │ All resumes scored    │
                                         │ Candidates ranked     │
                                         │ Bar chart analytics   │
                                         └───────────────────────┘
```

---

## 🧪 Testing

### Test Backend API
```bash
# Health check
curl http://localhost:5000/api/health

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"123456","role":"candidate"}'
```

### Test ML Engine
```bash
# Health check
curl http://localhost:5001/health

# Extract skills from text
curl -X POST http://localhost:5001/extract-skills \
  -H "Content-Type: application/json" \
  -d '{"text":"Experienced Python developer with React and MongoDB skills"}'
```

---

## 📦 Dependencies

### Backend (Node.js)
| Package | Purpose |
|---------|---------|
| express | Web framework |
| mongoose | MongoDB ODM |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| multer | File upload handling |
| cors | Cross-origin requests |
| dotenv | Environment variables |
| axios | HTTP client (for ML engine) |
| nodemon | Development auto-reload |

### ML Engine (Python)
| Package | Purpose |
|---------|---------|
| flask | Web framework |
| flask-cors | CORS support |
| scikit-learn | TF-IDF, Cosine Similarity |
| nltk | NLP preprocessing |
| PyMuPDF (fitz) | PDF text extraction |
| python-docx | DOCX text extraction |
| numpy | Numerical computing |

### Frontend (React)
| Package | Purpose |
|---------|---------|
| react | UI library |
| react-router-dom | Client routing |
| axios | HTTP client |
| recharts | Data visualization charts |
| react-icons | Icon library |
| react-dropzone | Drag-and-drop file upload |

---

## 🔮 Future Enhancements

- [ ] Email notifications on match completion
- [ ] Admin panel for system management
- [ ] Export match reports as PDF
- [ ] Semantic matching using word embeddings (Word2Vec / BERT)
- [ ] Resume template suggestions
- [ ] Deployment to cloud (Vercel + Render + MongoDB Atlas)
- [ ] Multiple resume support per candidate
- [ ] Interview scheduling integration

---

## 👨‍💻 Contributors

| Role | Contribution |
|------|-------------|
| Developer | Full-stack development, ML pipeline, UI design |
| Guide | Project supervision and mentorship |

---

## 📄 License

This project is developed as a **Final Year Project** for academic purposes.

---

<p align="center">
  Built with ❤️ using React, Node.js, Python & Machine Learning
</p>
