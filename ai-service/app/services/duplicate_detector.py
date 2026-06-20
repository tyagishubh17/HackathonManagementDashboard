"""
Duplicate Detection Module
Uses RapidFuzz for fuzzy matching + Sentence Transformers for semantic skill similarity.
Scoring weights: email 40%, phone 30%, name 20%, college 10%
Thresholds: >= 85 → Exact Duplicate, 55-84 → Suspicious, < 55 → Unique
"""

import re
import time
import logging
from datetime import datetime, timezone
from typing import Optional

import numpy as np
from rapidfuzz import fuzz
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

_model: Optional[SentenceTransformer] = None


def get_embedding_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def _normalize_phone(phone: str) -> str:
    return re.sub(r"\D", "", phone or "")


def _normalize_email(email: str) -> str:
    return (email or "").strip().lower()


def _normalize_name(name: str) -> str:
    return (name or "").strip().lower()


def _email_score(a: str, b: str) -> float:
    a, b = _normalize_email(a), _normalize_email(b)
    if not a or not b:
        return 0.0
    if a == b:
        return 100.0
    local_a, domain_a = (a.split("@") + [""])[:2]
    local_b, domain_b = (b.split("@") + [""])[:2]
    domain_match = 1.0 if domain_a == domain_b else 0.5
    local_ratio = fuzz.ratio(local_a, local_b) / 100.0
    return min(local_ratio * domain_match * 100.0, 99.0)


def _phone_score(a: str, b: str) -> float:
    a, b = _normalize_phone(a), _normalize_phone(b)
    if not a or not b:
        return 0.0
    if a == b:
        return 100.0
    # Compare last 10 digits (strip country code variations)
    a10, b10 = a[-10:], b[-10:]
    if a10 == b10 and len(a10) == 10:
        return 98.0
    return fuzz.ratio(a, b)


def _name_score(a: str, b: str) -> float:
    a, b = _normalize_name(a), _normalize_name(b)
    if not a or not b:
        return 0.0
    token_sort = fuzz.token_sort_ratio(a, b)
    token_set = fuzz.token_set_ratio(a, b)
    partial = fuzz.partial_ratio(a, b)
    return max(token_sort, token_set, partial)


def _college_score(a: str, b: str) -> float:
    a = (a or "").strip().lower()
    b = (b or "").strip().lower()
    if not a or not b:
        return 0.0
    partial = fuzz.partial_ratio(a, b)
    token = fuzz.token_sort_ratio(a, b)
    return max(partial, token)


def _skills_similarity(skills_a: list[str], skills_b: list[str]) -> float:
    if not skills_a or not skills_b:
        return 0.0
    model = get_embedding_model()
    text_a = " ".join(skills_a)
    text_b = " ".join(skills_b)
    emb = model.encode([text_a, text_b])
    sim = cosine_similarity([emb[0]], [emb[1]])[0][0]
    return float(sim) * 100.0


def compute_duplicate_score(candidate: dict, existing: dict) -> dict:
    """
    Compare candidate registration against an existing participant record.
    Returns individual field scores and a weighted composite score.
    """
    e_score = _email_score(candidate.get("email", ""), existing.get("email", ""))
    p_score = _phone_score(candidate.get("phone", ""), existing.get("phone", ""))
    n_score = _name_score(candidate.get("name", ""), existing.get("name", ""))
    c_score = _college_score(candidate.get("college", ""), existing.get("college", ""))

    composite = (e_score * 0.40) + (p_score * 0.30) + (n_score * 0.20) + (c_score * 0.10)

    skills_sim = _skills_similarity(
        candidate.get("skills", []), existing.get("skills", [])
    )

    matching_fields = []
    if e_score >= 90:
        matching_fields.append("email")
    if p_score >= 90:
        matching_fields.append("phone")
    if n_score >= 85:
        matching_fields.append("name")
    if c_score >= 80:
        matching_fields.append("college")

    return {
        "existing_id": str(existing.get("_id", existing.get("id", ""))),
        "existing_name": existing.get("name", ""),
        "existing_email": existing.get("email", ""),
        "field_scores": {
            "email": round(e_score, 2),
            "phone": round(p_score, 2),
            "name": round(n_score, 2),
            "college": round(c_score, 2),
            "skills_similarity": round(skills_sim, 2),
        },
        "duplicate_score": round(composite, 2),
        "matching_fields": matching_fields,
    }


def classify_score(score: float) -> str:
    if score >= 85:
        return "Exact Duplicate"
    if score >= 55:
        return "Suspicious"
    return "Unique"


async def run_duplicate_check(candidate: dict, db) -> dict:
    """
    Full pipeline: fetch all existing participants, run fuzzy matching,
    return top match and classification. Stores audit log in MongoDB.
    """
    start = time.monotonic()

    participants_col = db["participants"]
    audit_col = db["duplicate_audit_logs"]

    existing_records = await participants_col.find(
        {}, {"_id": 1, "name": 1, "email": 1, "phone": 1, "college": 1, "skills": 1}
    ).to_list(length=5000)

    best_match = None
    best_score = 0.0

    for record in existing_records:
        result = compute_duplicate_score(candidate, record)
        if result["duplicate_score"] > best_score:
            best_score = result["duplicate_score"]
            best_match = result

    status = classify_score(best_score)

    elapsed_ms = round((time.monotonic() - start) * 1000, 2)

    audit_entry = {
        "candidate": {
            "name": candidate.get("name"),
            "email": candidate.get("email"),
            "phone": candidate.get("phone"),
            "college": candidate.get("college"),
        },
        "duplicate_score": round(best_score, 2),
        "status": status,
        "best_match": best_match,
        "checked_against": len(existing_records),
        "response_time_ms": elapsed_ms,
        "timestamp": datetime.now(timezone.utc),
    }

    await audit_col.insert_one(audit_entry)

    return {
        "duplicate_score": round(best_score, 2),
        "status": status,
        "best_match": best_match,
        "checked_against": len(existing_records),
        "response_time_ms": elapsed_ms,
    }
