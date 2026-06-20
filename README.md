# FairJudge Hackathon Management System 🚀

FairJudge is a comprehensive, AI-powered Hackathon Management Dashboard built to eliminate unconscious bias in hackathon judging, streamline participant registration, and automate team formation.

This monorepo contains:
- **Frontend**: React + TailwindCSS (Vite/Next.js ready architecture)
- **Backend**: Node.js + Express + MongoDB Atlas
- **AI Service**: Python FastAPI (Handles Bias Detection, Duplicate Checking, and Team Matching)

---

## 🛠️ Tech Stack Overview
- **Database**: MongoDB Atlas (with `mongoose-delete` for soft deletes)
- **Authentication**: JWT Access (15m) + Refresh Tokens (7d) stored in `httpOnly` cookies + CSRF protection.
- **File Storage**: Google Drive API (For Resumes and Project Submissions)
- **Email**: Nodemailer (Ethereal for Dev, SendGrid for Prod) + EJS Templates
- **AI Integration**: Axios bridge to local Python FastAPI Microservice.

---

## ⚙️ Project Setup Guide

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.9+)
- **MongoDB Atlas** Account
- **Google Cloud Console** Account (For Drive API Service Account)

### 2. Environment Variables Setup
You will need to set up environment variables in three places:

#### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/?appName=Cluster0

# AI Microservice Bridge
AI_SERVICE_URL=http://localhost:8000

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Google Drive API
GOOGLE_DRIVE_FOLDER_ID=your_drive_folder_id
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./config/service-account.json

# Email SMTP
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=your_ethereal_user
EMAIL_PASS=your_ethereal_password
```

#### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### AI Service (`ai_service/.env`)
Create a `.env` file in the `ai_service/` directory (if applicable for your Python setup):
```env
PORT=8000
```

---

### 3. Google Drive API Configuration (CRITICAL)
FairJudge uses Google Drive as its primary file storage engine.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new Project and enable the **Google Drive API**.
3. Create a **Service Account** and generate a JSON key.
4. Rename that downloaded JSON file to `service-account.json` and place it in `backend/src/config/`.
5. Create a folder in your Google Drive, right-click it, select "Share", and share it with the `client_email` found inside your `service-account.json` giving it "Editor" permissions.
6. Copy the Folder ID from the URL (e.g., `1v_ezWtnBVuWgYvD_HKAkDT0WbC9YbSLO`) and paste it into `backend/.env` under `GOOGLE_DRIVE_FOLDER_ID`.

---

### 4. Installation & Booting up

Open three separate terminal windows.

**Terminal 1: Start the Backend**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2: Start the Frontend**
```bash
cd frontend
npm install
npm start (or npm run dev)
```

**Terminal 3: Start the Python AI Service**
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## 🔑 Seeded Credentials
To quickly test the platform, a database seed script was provided. If you have run `node backend/src/scripts/seedDatabase.js`, you can log in with the following accounts. The password for **all** seeded accounts is: `Admin@123`

| Role | Email | Use Case |
| :--- | :--- | :--- |
| **Super Admin** | `admin@fairjudge.com` | Approves hackathons, views global dashboards. |
| **Organizer** | `organizer1@fairjudge.com` | Creates hackathons, manages teams, views AI bias reports. |
| **Judge** | `judge1@fairjudge.com` | Receives project assignments, scores via rubric. |
| **Participant** | `participant1@fairjudge.com` | Registers, uploads resume, forms teams, submits projects. |

---

## 🎯 Features to Test & Workflow Guide

### Phase 1: Hackathon Creation & Verification
1. **Login as Organizer**: Go to the dashboard and create a new Hackathon draft. Fill out the timeline and the custom JSON rubric (ensure weights equal exactly 100).
2. **Submit for Verification**: Click "Publish".
3. **Login as Super Admin**: Navigate to pending verifications. Review the Hackathon rules and click "Verify". The Hackathon is now "Upcoming". (A cron job will automatically transition it to `registration_open` when the timeline hits).

### Phase 2: Participant Registration & AI Validation
1. **Login as Participant**: Navigate to the public Hackathon discovery page and click "Register".
2. **Upload Resume**: Upload a `.pdf` or `.docx`. The backend extracts the text using `pdf-parse`.
3. **AI Duplicate Check**: Submit the form. The system securely pings the Python AI microservice to check against all currently registered participants.
   - *Test this*: Try registering a second account with the exact same resume and skills. Watch the AI flag the registration as a `rejected` duplicate or `pending_review`!

### Phase 3: Team Formation & Project Submissions
1. **AI Auto-Form Teams (Organizer)**: Organizers can hit "Auto-Assign Teams". The AI will read the JSON of all unmatched participants and intelligently group them based on complementary skills (e.g., matching a Frontend Dev with a Backend Dev).
2. **Manual Squads (Participant)**: Participants can use `/join` and `/leave` endpoints to manually form squads.
3. **Project Uploads**: The participant goes to the project submission page, attaches `.zip` or `.pdf` files, and submits. Watch the backend pipe these directly to your Google Drive and return the public view URLs!

### Phase 4: AI Bias Evaluation & Scoring
1. **AI Reviewer Assignment (Organizer)**: Click "Auto-Assign Judges". The AI routes projects to judges based on the project's tech stack and the judge's expertise history.
2. **Scoring (Judge)**: Login as the Judge. Open the assigned project.
3. **AI Copilot**: Click "Request Analysis". The AI reads the project source code and suggests baseline rubric scores.
4. **Bias Trap**: In the feedback box, write something explicitly biased (e.g., *"This developer's background clearly limits their technical ability"*).
5. **Save Draft**: The backend triggers the `/api/bias-detect` AI route. A red **BiasAlertBanner** will immediately appear in the UI, and an immutable log will be written to the `BiasAuditLogs` collection for the Organizer to review.
6. **Leaderboards**: Once final evaluations are submitted, check the Organizer "Results" dashboard to see the aggregate leaderboard!

---

*Built by the FairJudge Engineering Team.* 🚀
