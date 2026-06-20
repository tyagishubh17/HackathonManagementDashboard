# MIGRATION

This document details the restructuring of the FAIRJUDGE project into a monorepo.

## Frontend
- Moved from root directory to `frontend/`.
- All source files moved from `src/` to `frontend/src/`.
- Run `cd frontend && npm run dev` instead of from root.

## Backend
- Moved `backend/routes/` to `backend/src/routes/`
- Moved `backend/models/` to `backend/src/models/`
- Moved `backend/middleware/` to `backend/src/middleware/`
- Moved `backend/config/` to `backend/src/config/`
- Moved `backend/server.js` to `backend/src/app.js`
- Scripts updated to `node src/app.js`

## AI Service
- Moved `ai-service/main.py` to `ai-service/app/main.py`
- Moved `ai-service/modules/` to `ai-service/app/services/`
- Run `uvicorn app.main:app` instead of `main:app`

## New Services (Placeholders)
- `rag-service/`
- `shared/`
