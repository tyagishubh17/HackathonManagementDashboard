"""
FAIRJUDGE AI Service
FastAPI application exposing Duplicate Detection and Bias Detection endpoints.
"""

# Suppress NumPy float128 warnings on Windows (exp2/nextafter on unsupported type).
# These are cosmetic — no computation is affected.
import warnings
warnings.filterwarnings("ignore", category=RuntimeWarning, module=r"numpy\.core\.getlimits")

import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from dotenv import load_dotenv

from database import connect_db, close_db, get_db
from modules.duplicate_detector import run_duplicate_check
from modules.bias_detector import run_bias_detection

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="FAIRJUDGE AI Service",
    version="1.0.0",
    description="AI modules for duplicate detection and reviewer bias analysis",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request / Response Models ────────────────────────────────────────────────

class ParticipantCheckRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: str = Field(..., max_length=254)
    phone: str = Field(..., max_length=20)
    college: str = Field(..., max_length=300)
    skills: list[str] = Field(default_factory=list)


class DuplicateCheckResponse(BaseModel):
    duplicate_score: float
    status: str
    best_match: dict | None
    checked_against: int
    response_time_ms: float


class EvaluationRequest(BaseModel):
    reviewer_id: str = Field(..., min_length=1)
    project_id: str = Field(..., min_length=1)
    innovation: float = Field(..., ge=0, le=100)
    technical: float = Field(..., ge=0, le=100)
    presentation: float = Field(..., ge=0, le=100)
    final_score: float = Field(..., ge=0, le=100)
    tech_stack: list[str] = Field(default_factory=list)


# ─── Health Check ─────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "fairjudge-ai"}


# ─── Duplicate Detection ──────────────────────────────────────────────────────

@app.post("/api/duplicate-check", response_model=DuplicateCheckResponse)
async def duplicate_check(payload: ParticipantCheckRequest, db=Depends(get_db)):
    """
    Check a new participant registration for duplicates against the existing
    participant database. Returns a confidence score and classification.
    """
    try:
        result = await run_duplicate_check(payload.model_dump(), db)
        return result
    except Exception as exc:
        logger.exception("Duplicate check failed")
        raise HTTPException(status_code=500, detail=str(exc))


# ─── Bias Detection ───────────────────────────────────────────────────────────

@app.post("/api/bias-detect")
async def bias_detect(payload: EvaluationRequest, db=Depends(get_db)):
    """
    Analyze a reviewer's evaluation for signs of bias. Compares against the
    reviewer's own history and the global reviewer pool.
    """
    try:
        result = await run_bias_detection(payload.model_dump(), db)
        return result
    except Exception as exc:
        logger.exception("Bias detection failed")
        raise HTTPException(status_code=500, detail=str(exc))


# ─── Audit Log Retrieval ──────────────────────────────────────────────────────

@app.get("/api/audit/duplicates")
async def get_duplicate_audit(limit: int = 50, db=Depends(get_db)):
    """Retrieve recent duplicate detection audit log entries."""
    col = db["duplicate_audit_logs"]
    entries = await col.find(
        {}, {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(length=limit)
    return {"entries": entries, "count": len(entries)}


@app.get("/api/audit/bias")
async def get_bias_audit(limit: int = 50, reviewer_id: str | None = None, db=Depends(get_db)):
    """Retrieve recent bias detection audit log entries, optionally filtered by reviewer."""
    col = db["bias_audit_logs"]
    query = {"reviewer_id": reviewer_id} if reviewer_id else {}
    entries = await col.find(
        query, {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(length=limit)
    return {"entries": entries, "count": len(entries)}


@app.get("/api/analytics/reviewer/{reviewer_id}")
async def reviewer_analytics(reviewer_id: str, db=Depends(get_db)):
    """Aggregate analytics for a specific reviewer's bias history."""
    col = db["bias_audit_logs"]
    entries = await col.find(
        {"reviewer_id": reviewer_id}, {"_id": 0}
    ).sort("timestamp", -1).limit(200).to_list(length=200)

    if not entries:
        return {"reviewer_id": reviewer_id, "total_reviews": 0}

    bias_detected_count = sum(1 for e in entries if e.get("bias_detected"))
    bias_types = {}
    for e in entries:
        bt = e.get("bias_type", "NONE")
        bias_types[bt] = bias_types.get(bt, 0) + 1

    return {
        "reviewer_id": reviewer_id,
        "total_reviews": len(entries),
        "bias_detected_count": bias_detected_count,
        "bias_rate": round(bias_detected_count / len(entries) * 100, 1),
        "bias_type_breakdown": bias_types,
        "recent_entries": entries[:10],
    }
