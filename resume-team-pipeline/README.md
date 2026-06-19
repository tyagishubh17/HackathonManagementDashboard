# Hackathon Resume-to-Team Pipeline (NLP-Powered)

An end-to-end automated pipeline that reads **Google Form registrations → downloads resumes from Google Drive → extracts raw text → executes lightweight local NLP to score skills/seniority → generates balanced, complementary teams → stores results in MongoDB** for a live hackathon dashboard.

Since the source code is kept clean, stripped of inline comments, and optimized for speed, this document serves as the complete technical guide for organizers, recruiters, reviewers, and fellow coders.

---

## 🚀 System Architecture Flow

```
   Google Form Registration (User submits details & resume link)
                |
                v
   Google Sheet Responses (Ingested case-insensitively & cleaned)
                |
                v
   Google Drive (Downloads resumes securely using API service credentials)
                |
                v
   Text Extraction (Converts PDF/DOCX to plain text with OCR fallback)
                |
                v
   Custom NLP Engine (Tokenization + Exact Matching + Fuzzy Typo Matching)
                |
                v
   Team Formation Algorithm (Snake draft + Skill Gap Fill + Score Balancing)
                |
                v
   Database Ingestion (MongoDB clusters: 'participants' and 'teams')
```

---

## 📁 File Structure

```text
hackathon-team-former/
├── config/
│   ├── settings.py           # Configuration parameters (IDs, MongoDB URIs, team size, etc.)
│   ├── skill_taxonomy.py     # Skill categories mapping (Frontend, Backend, AI/ML, etc.)
│   └── service_account.json  # Service account credentials for Google Sheets & Drive APIs
├── sheets_reader.py          # Fetches form signups, normalizes headers, and downloads resumes
├── resume_extractor.py       # Reads PDF/DOCX files, falling back to Tesseract OCR for scanned text
├── nlp_skill_extractor.py    # Local NLP Engine (spaCy + RapidFuzz + Seniority Heuristics)
├── team_formation.py         # Complementary, balanced team drafting and local-search optimization
├── mongo_writer.py           # Pushes computed skill profiles and teams to MongoDB Collections
├── main_pipeline.py          # Central script orchestrating steps 1 to 5
└── requirements.txt          # Python dependency specifications
```

---

## 🛠️ Step-by-Step Installation & Setup

### 1. Install System Dependencies
Install system-level binaries required for OCR processing (this handles scanned image resumes):
* **Ubuntu/Debian**:
  ```bash
  sudo apt install tesseract-ocr poppler-utils
  ```
* **macOS**:
  ```bash
  brew install tesseract poppler
  ```
* **Windows**:
  1. Download and run the [Tesseract installer for Windows](https://github.com/UB-Mannheim/tesseract/wiki).
  2. Download [Poppler for Windows](https://github.com/oschwartz10612/poppler-windows/releases/tag/v24.06.0-0).
  3. Add the bin directories for both Tesseract and Poppler to your system environment `PATH` variable.

### 2. Install Python Packages
```bash
pip install -r requirements.txt
```

### 3. Google API Configuration
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project and enable **Google Sheets API** and **Google Drive API**.
3. Create a **Service Account** and generate a **JSON Key**. Save this file as `config/service_account.json` in the root of the project.
4. Open the Google Sheet holding your Form submissions. Share it with your Service Account's email address (`client_email` in the JSON) giving it **Viewer** permissions.
5. In your Google Drive, locate the folder where the form stores uploaded resumes. Right-click the folder, click **Share**, and grant Viewer permissions to the same Service Account email.

### 4. Running the Pipeline
Simply execute:
```bash
python main_pipeline.py
```

---

## 🧠 How the Custom NLP Engine Works

Instead of relying on slow, non-deterministic cloud LLMs, the pipeline uses a custom local NLP stack for maximum speed, offline reliability, and zero cost.

### Tokenization (spaCy)
The pipeline initializes a blank English spaCy pipeline:
```python
self.nlp = spacy.blank("en")
```
This splits raw text into clean, linguistic tokens case-insensitively, handling punctuation and token structures (like `Node.js` or `C++`) without breaking them apart.

### Exact Taxonomic Matching (`PhraseMatcher`)
It builds a matching tree of all skills specified in `config/skill_taxonomy.py`. spaCy's `PhraseMatcher` searches the document's token stream in sub-milliseconds to detect exact matches (e.g. mapping `"reactjs"`, `"react.js"`, and `"react js"` to the canonical skill `"React"`).

### Fuzzy Matching Fallback (`RapidFuzz`)
To catch spelling mistakes, abbreviations, or typos (e.g., `"Reaact"`, `"Node-JS"`, or `"Tensor Flow"`):
1. The text is broken into 1-word, 2-word, and 3-word sliding windows.
2. Unmatched skills are fuzzy compared against these windows using Levenshtein distance (`fuzz.ratio`).
3. If a match scores $\ge 85\%$, it is registered as a positive detection.

### Seniority Scoring Heuristic
A regular expression scans for years of experience:
```python
re.compile(r"(\d+)\s*\+?\s*(?:years|year|yrs|yr)", re.IGNORECASE)
```
If years are found, a multiplier is applied to weight their skill scores:
* **$\ge 4$ years**: $1.5\times$ skill score multiplier.
* **$2$ to $3$ years**: $1.25\times$ skill score multiplier.
* **$<2$ years**: $1.1\times$ skill score multiplier.

---

## ⚖️ Team Formation Algorithm

The engine splits participants into balanced and complementary teams using a three-phase optimization pass:

1. **Snake Draft (Anti-Stacking)**
   Participants are sorted by total skill score descending. They are distributed to teams in winding snake order (e.g. `Team 1 -> Team 2 -> Team 3 -> Team 3 -> Team 2 -> Team 1`). This is the same draft method used in fantasy sports to prevent a single team from stacking all top-tier candidates.
   
2. **Complementary Category Picking (Skill Gap Fill)**
   At each draft pick, instead of picking the next absolute highest scorer, the team analyzes its current skill-coverage gaps (e.g. if the team has 3 backend developers and lacks a frontend developer). It scans the top remaining candidates and drafts the participant who fills the largest category gap.
   
3. **Local-Search Balancing Pass**
   Once teams are initially formed, the algorithm repeatedly finds the highest-scoring and lowest-scoring teams. It attempts to swap individual members if the swap reduces the team score variance without creating category coverage gaps. This repeats until team scores are balanced within tolerance.
