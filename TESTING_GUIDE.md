# Project Submission & AI Evaluation Testing Guide

## Quick Start Testing Workflow

### Phase 1: Service Verification
```bash
# Ensure all 4 services are running:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# AI Service: http://localhost:8000
# RAG Service: http://localhost:8001
```

### Phase 2: Participant Submission Test

#### Step 1: Create Hackathon (Organizer)
- Navigate to organizer dashboard
- Create a new hackathon with:
  - Title: "AI Evaluation Test Hackathon"
  - Submission Deadline: Tomorrow 5:00 PM
  - Rubric with criteria: Innovation (100), Technical (100), Presentation (100)
  - Problem Statement (optional)

#### Step 2: Register Teams (Participant)
- Log in as participant
- Browse hackathons
- Form/join a team with 2-3 members
- Register team for hackathon

#### Step 3: Create & Submit Project
Navigate to: `/participant/projects/{hackathonId}`
1. **Fill Project Details**
   - Title: "AI-Powered Task Manager"
   - Description: Detailed project overview
   - Tech Stack: Select Node.js, React, MongoDB, AI/ML
2. **Upload Files**
   - Upload project PDF or DOCX with implementation details
   - Upload README.md or project specification
3. **Review Checklist**
   - ✓ Project details complete
   - ✓ Files uploaded
   - ✓ Team members added
4. **Submit Project**
   - Click "Submit Project"
   - Expected response: "Project submitted! AI is analyzing your submission."

#### Step 3 Validation:
```
Expected Backend Logs:
- Project status → "submitted"
- PDF text extraction started
- AI review-agent called with project data
- Evaluation records updated with AI scores
```

### Phase 3: Reviewer Assignment Test

#### Step 1: Assign Reviewers (Organizer)
Navigate to: `/admin/hackathons/{hackathonId}/settings`
1. Click "Assign Reviewers Automatically"
2. System calls: `POST /hackathons/{hackathonId}/reviewers/assign`
3. Expected response:
```json
{
  "success": true,
  "message": "Assignments generated successfully",
  "count": 3
}
```

#### Step 2: Verify Assignments
- Navigate to `/judge/assignments`
- Should see project card with:
  - Project title & description
  - Tech stack tags
  - Status: "Draft"
  - "Score Now" button
  - AI suggested scores displayed

### Phase 4: Judge Scoring Test

#### Step 1: View Assignment
- Judge clicks on project in assignments list
- Page loads: `/judge/assignments/{evaluationId}/score`
- Should see:
  - Project details & files
  - Rubric scoring interface
  - AI suggestions panel
  - Feedback text area

#### Step 2: Score with AI Assistance
1. **Rubric Scoring**:
   - Move sliders for each criterion
   - Example: Innovation: 85, Technical: 90, Presentation: 80
   - Total displays: 255 (if out of 300)
2. **Review AI Suggestions**:
   - Click "Get AI Suggestions"
   - System calls: `POST /reviews/agent` with:
     ```json
     {
       "projectId": "...",
       "techStack": ["Node.js", "React", "MongoDB"],
       "projectText": "Project description...",
       "pdfText": "Extracted PDF content..."
     }
     ```
   - AI returns suggested scores
3. **Apply AI Suggestions**:
   - Click "Use" buttons to adopt AI scores
   - Verify scores update in rubric

#### Step 3: Add Feedback & Bias Check
1. **Add Feedback**:
   - Write: "Excellent technical implementation. Good use of modern frameworks. Could improve UI/UX."
2. **Pre-Submit Bias Check**:
   - System calls: `POST /reviews/check-bias` with feedback
   - If bias detected (confidence > 0.7):
     - Red modal appears with warning
     - Judge can edit feedback or force submit
3. **Save Draft** (optional):
   - Click "Save Draft"
   - System calls: `PUT /evaluations/{id}` with scores & feedback
   - Status remains "draft" for future editing

#### Step 4: Submit Evaluation
1. Click "Submit Evaluation"
2. System calls: `PUT /evaluations/{id}/submit`
3. Expected:
   - Status → "submitted"
   - BiasAuditLog created if flags detected
   - Confirmation message displayed
   - Judge redirected to assignments list
   - Assignment now shows status "Submitted"

### Phase 5: Results & Analytics

#### Step 1: View Project Results (Participant)
Navigate to: `/participant/projects/{projectId}`
- Should see:
  - Assigned judges (3 names)
  - Individual scores from each judge
  - Average score
  - Detailed feedback from each review
  - AI scoring comparison

#### Step 2: View Leaderboard (Organizer)
Navigate to: `/hackathons/{hackathonId}/results`
- Should see:
  - All projects ranked by average score
  - AI evaluation badges
  - Bias detection flags (if any)
  - Download results as Excel

## API Endpoint Checklist

### Submission Endpoints
- [ ] POST `/projects` - Create project
- [ ] POST `/projects/{id}/files` - Upload file
- [ ] POST `/projects/{id}/submit` - Submit project
- [ ] GET `/projects/{id}` - Get project details

### Judge Endpoints
- [ ] GET `/evaluations/my-assignments` - List assignments
- [ ] GET `/evaluations/{id}` - Get evaluation
- [ ] POST `/evaluations/{id}/score` - Save scores (optional, for draft)
- [ ] PUT `/evaluations/{id}` - Draft save
- [ ] PUT `/evaluations/{id}/submit` - Submit evaluation

### AI Integration Endpoints
- [ ] POST `/reviews/agent` - Get AI scoring suggestions
- [ ] POST `/reviews/check-bias` - Pre-submission bias check
- [ ] POST `/reviews/assign` - Get reviewer assignments (internal)

### Admin Endpoints
- [ ] POST `/hackathons/{id}/reviewers/assign` - Auto-assign judges
- [ ] GET `/hackathons/{id}/reviewers/assignments` - View assignments

## Expected AI Service Responses

### 1. Project Submission AI Evaluation
**Request**: POST `http://localhost:8000/api/review-agent`
```json
{
  "projectId": "507f1f77bcf86cd799439011",
  "techStack": ["Node.js", "React", "MongoDB"],
  "projectText": "Project description text",
  "pdfText": "Extracted PDF content with implementation details"
}
```

**Expected Response**:
```json
{
  "scores": {
    "innovation": 82,
    "technical": 88,
    "presentation": 75
  },
  "rationale": "Project demonstrates good technical implementation...",
  "panel_agreement_pct": 0.85,
  "biasFlags": []
}
```

### 2. Bias Detection
**Request**: POST `http://localhost:8000/api/bias-detect`
```json
{
  "feedback": "Good project but could use better UI",
  "scores": {
    "innovation": 85,
    "technical": 90,
    "presentation": 80
  },
  "projectId": "507f1f77bcf86cd799439011"
}
```

**Expected Response**:
```json
{
  "biasDetected": false,
  "confidence": 0.15,
  "flags": [],
  "recommendation": "Feedback appears neutral and constructive"
}
```

### 3. Reviewer Assignment
**Request**: POST `http://localhost:8000/api/reviewer-assign`
```json
{
  "judges": [
    { "_id": "...", "expertise": ["AI", "Backend"] },
    { "_id": "...", "expertise": ["Frontend", "Design"] }
  ],
  "projects": [
    { "_id": "...", "techStack": ["React", "Node.js"] }
  ]
}
```

**Expected Response**:
```json
{
  "assignments": [
    {
      "projectId": "...",
      "reviewerIds": ["judge1_id", "judge2_id", "judge3_id"]
    }
  ]
}
```

## Troubleshooting

### Issue: PDF Extraction Failed
**Symptom**: "AI is analyzing..." never completes
**Fix**:
1. Check backend logs for PDF extraction errors
2. Verify pdf-parse is installed: `npm list pdf-parse`
3. Test with simpler PDF or text file

### Issue: AI Service Not Responding
**Symptom**: Evaluation form doesn't show AI suggestions
**Fix**:
1. Verify AI service running: `curl http://localhost:8000/health`
2. Check AI_SERVICE_URL in backend .env: `AI_SERVICE_URL=http://localhost:8000`
3. Restart AI service

### Issue: Bias Detection Always Triggers
**Symptom**: Modal pops up every submission
**Fix**:
1. Check bias confidence threshold in frontend (currently 0.7)
2. Review AI service bias model accuracy
3. Provide diverse feedback examples to AI model

### Issue: Judges Not Getting Assignments
**Symptom**: No evaluations in judge's dashboard
**Fix**:
1. Verify judges exist in database with `role: "judge"`
2. Verify projects status is "submitted"
3. Check reviewer assignment endpoint: `POST /hackathons/{id}/reviewers/assign`
4. Verify Evaluation records created: `db.evaluations.find({})`

## Success Indicators

✅ **Successful Submission**:
- Project status changes to "submitted"
- AI evaluation completes within 10 seconds
- Evaluation records show AI suggested scores
- Participant sees "AI is analyzing" message

✅ **Successful Assignment**:
- Judge appears in assignments dropdown
- Evaluation record created for each judge
- Judge receives notification (if enabled)

✅ **Successful Scoring**:
- Scores saved to Evaluation model
- Feedback pre-checked for bias
- Evaluation can be submitted and finalized
- Scores appear in project results

✅ **Successful Results**:
- Average score calculated from all judges
- Project appears in leaderboard
- Bias flags tracked in audit log
- Results exportable to Excel

## Performance Metrics

- Submission response time: < 2 seconds (status → "submitted")
- PDF extraction time: < 5 seconds (async)
- AI evaluation time: < 10 seconds
- Bias checking time: < 3 seconds
- Reviewer assignment time: < 5 seconds per project
