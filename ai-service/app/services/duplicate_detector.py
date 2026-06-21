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
# sklearn cosine_similarity import removed to resolve editor warnings

logger = logging.getLogger(__name__)

_model = None


def get_embedding_model():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer("all-MiniLM-L6-v2")
        except ImportError:
            logger.warning(
                "sentence_transformers not installed — skills similarity will be skipped. "
                "Run: pip install sentence-transformers"
            )
            _model = None
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


def _np_cosine_similarity(a, b) -> float:
    dot = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return float(dot / (norm_a * norm_b))


def _skills_similarity(skills_a: list[str], skills_b: list[str]) -> float:
    if not skills_a or not skills_b:
        return 0.0
    model = get_embedding_model()
    if model is None:
        return 0.0  # sentence_transformers not yet installed
    text_a = " ".join(skills_a)
    text_b = " ".join(skills_b)
    emb = model.encode([text_a, text_b])
    sim = _np_cosine_similarity(emb[0], emb[1])
    return sim * 100.0



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


EMAIL_REGEX = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')


def _extract_emails_from_text(text: str) -> list[str]:
    if not text:
        return []
    return [email.lower().strip() for email in EMAIL_REGEX.findall(text)]


def _extract_phones_from_text(text: str) -> list[str]:
    if not text:
        return []
    # Match sequences of digits, dashes, spaces, parentheses that look like phone numbers
    matches = re.findall(r'\+?\d[\d\-\s()]{7,}\d', text)
    extracted = []
    for m in matches:
        digits = re.sub(r'\D', '', m)
        if 9 <= len(digits) <= 15:
            extracted.append(digits)
    return extracted


async def run_duplicate_check(candidate: dict, db) -> dict:
    """
    Full pipeline: check candidate against existing registrations (if hackathonId is provided)
    or the participants database, run fuzzy contact and resume matching,
    returns composite score and classification. Stores audit log.
    """
    start = time.monotonic()
    audit_col = db["duplicate_audit_logs"]

    hackathon_id = candidate.get("hackathonId")
    existing_records = []

    if hackathon_id:
        from bson import ObjectId
        try:
            hack_id_obj = ObjectId(hackathon_id)
            registrations_col = db["registrations"]
            users_col = db["users"]

            existing_regs = await registrations_col.find(
                {"hackathonId": hack_id_obj, "status": {"$in": ["confirmed", "pending_review", "waitlisted"]}},
                {"_id": 1, "userId": 1, "skills": 1, "resumeText": 1}
            ).to_list(length=5000)

            user_ids = [reg["userId"] for reg in existing_regs if reg.get("userId")]
            users = await users_col.find(
                {"_id": {"$in": user_ids}},
                {"_id": 1, "fullName": 1, "email": 1, "phone": 1, "institution": 1, "college": 1}
            ).to_list(length=len(user_ids) if user_ids else 1)

            user_map = {str(u["_id"]): u for u in users}

            for reg in existing_regs:
                user_id_str = str(reg.get("userId", ""))
                user_info = user_map.get(user_id_str, {})
                email = user_info.get("email", "")

                # Exclude candidate's own email if already registered
                if email.strip().lower() == candidate.get("email", "").strip().lower():
                    continue

                existing_records.append({
                    "id": str(reg["_id"]),
                    "userId": user_id_str,
                    "name": user_info.get("fullName", ""),
                    "email": email,
                    "phone": user_info.get("phone", ""),
                    "college": user_info.get("institution", user_info.get("college", "")),
                    "skills": reg.get("skills", []),
                    "resumeText": reg.get("resumeText", "")
                })
        except Exception as exc:
            logger.error(f"Failed to query registrations for hackathon duplicate check: {exc}")
            # Fall back to generic participants
            hackathon_id = None

    if not hackathon_id:
        participants_col = db["participants"]
        records = await participants_col.find(
            {}, {"_id": 1, "name": 1, "email": 1, "phone": 1, "college": 1, "skills": 1}
        ).to_list(length=5000)
        for r in records:
            existing_records.append({
                "id": str(r["_id"]),
                "userId": "",
                "name": r.get("name", ""),
                "email": r.get("email", ""),
                "phone": r.get("phone", ""),
                "college": r.get("college", ""),
                "skills": r.get("skills", []),
                "resumeText": ""
            })

    best_match = None
    best_score = 0.0
    is_duplicate = False
    reasons = []
    matched_user_id = None

    # Extracted details from candidate's resume
    candidate_resume_emails = _extract_emails_from_text(candidate.get("resumeText", ""))
    candidate_resume_phones = _extract_phones_from_text(candidate.get("resumeText", ""))

    candidate_emails = [candidate.get("email", "")] + candidate_resume_emails
    candidate_phones = [candidate.get("phone", "")] + candidate_resume_phones

    for record in existing_records:
        record_resume_emails = _extract_emails_from_text(record.get("resumeText", ""))
        record_resume_phones = _extract_phones_from_text(record.get("resumeText", ""))

        existing_emails = [record.get("email", "")] + record_resume_emails
        existing_phones = [record.get("phone", "")] + record_resume_phones

        # Fuzzy compare emails
        max_email_score = 0.0
        for ce in candidate_emails:
            for ee in existing_emails:
                score = _email_score(ce, ee)
                if score > max_email_score:
                    max_email_score = score

        # Fuzzy compare phones
        max_phone_score = 0.0
        for cp in candidate_phones:
            for ep in existing_phones:
                score = _phone_score(cp, ep)
                if score > max_phone_score:
                    max_phone_score = score

        # Compare colleges
        college_score = _college_score(candidate.get("college", ""), record.get("college", ""))

        # Flag duplicate if contacts match fuzzy thresholds
        is_email_dup = max_email_score >= 95
        is_phone_dup = max_phone_score >= 95

        is_email_suspicious = max_email_score >= 90 and college_score >= 80
        is_phone_suspicious = max_phone_score >= 90 and college_score >= 80

        record_score = 0.0
        record_reasons = []

        if is_email_dup or is_phone_dup:
            record_score = max(max_email_score, max_phone_score)
            if is_email_dup:
                record_reasons.append(f"Email match ({max_email_score:.0f}%) found in profile or resume.")
            if is_phone_dup:
                record_reasons.append(f"Phone number match ({max_phone_score:.0f}%) found in profile or resume.")
        elif is_email_suspicious or is_phone_suspicious:
            record_score = max(max_email_score, max_phone_score)
            if is_email_suspicious:
                record_reasons.append(f"Fuzzy email match ({max_email_score:.0f}%) with candidate from same college '{record.get('college')}' ({college_score:.0f}% match).")
            if is_phone_suspicious:
                record_reasons.append(f"Fuzzy phone match ({max_phone_score:.0f}%) with candidate from same college '{record.get('college')}' ({college_score:.0f}% match).")

        if record_score > best_score:
            best_score = record_score
            is_duplicate = True
            reasons = record_reasons
            matched_user_id = record.get("userId") or record.get("id")
            best_match = {
                "existing_id": record["id"],
                "existing_name": record["name"],
                "existing_email": record["email"],
                "field_scores": {
                    "email": round(max_email_score, 2),
                    "phone": round(max_phone_score, 2),
                    "college": round(college_score, 2),
                },
                "duplicate_score": round(record_score, 2),
                "reasons": record_reasons
            }

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
        "isDuplicate": is_duplicate,
        "confidence": round(best_score / 100.0, 2),
        "matchedUserId": matched_user_id,
        "reasons": reasons if reasons else ["Candidate profile and resume check completed. No suspicious duplicate contact matches found."]
    }
