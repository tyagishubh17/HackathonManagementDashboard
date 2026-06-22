"""
Real-Time Bias Detection Module
Detects reviewer bias using statistical analysis + Isolation Forest anomaly detection.

Bias types detected:
  - LENIENCY_BIAS: reviewer scores consistently above global average
  - SEVERITY_BIAS: reviewer scores consistently below global average
  - TECH_STACK_BIAS: reviewer scores vary significantly across technology groups
  - INCONSISTENCY_BIAS: high variance in reviewer scores relative to peers
  - OUTLIER_BIAS: Isolation Forest flags current evaluation as statistical anomaly
"""

import logging
from datetime import datetime, timezone
from collections import defaultdict
from typing import Optional

import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)

BIAS_THRESHOLD_Z = 1.5        # z-score threshold for leniency/severity
TECH_BIAS_THRESHOLD = 8.0     # point difference to flag tech stack bias
VARIANCE_THRESHOLD = 3.5      # std-dev threshold for inconsistency
ISOLATION_CONTAMINATION = 0.1  # expected outlier fraction for IF

# Technology groups for bias aggregation
TECH_GROUPS = {
    "web": {"react", "vue", "angular", "nextjs", "svelte", "html", "css", "javascript", "typescript"},
    "backend": {"nodejs", "python", "java", "go", "rust", "php", "ruby", "express", "fastapi", "django"},
    "mobile": {"flutter", "react native", "swift", "kotlin", "android", "ios"},
    "ai_ml": {"tensorflow", "pytorch", "scikit-learn", "keras", "machine learning", "deep learning", "nlp"},
    "blockchain": {"solidity", "web3", "ethereum", "smart contracts", "blockchain"},
    "cloud": {"aws", "gcp", "azure", "docker", "kubernetes", "terraform"},
}


def _assign_tech_group(tech_stack: list[str]) -> str:
    stack_lower = {t.lower().strip() for t in (tech_stack or [])}
    best_group = "other"
    best_count = 0
    for group, keywords in TECH_GROUPS.items():
        count = len(stack_lower & keywords)
        if count > best_count:
            best_count = count
            best_group = group
    return best_group


def _compute_reviewer_stats(reviews: list[dict]) -> dict:
    if not reviews:
        return {"mean": 0.0, "std": 0.0, "count": 0}
    scores = [r["final_score"] for r in reviews]
    return {
        "mean": float(np.mean(scores)),
        "std": float(np.std(scores)),
        "count": len(scores),
    }


def _compute_global_stats(all_reviews: list[dict]) -> dict:
    if not all_reviews:
        return {"mean": 50.0, "std": 10.0}
    scores = [r["final_score"] for r in all_reviews]
    return {
        "mean": float(np.mean(scores)),
        "std": max(float(np.std(scores)), 1.0),
    }


def _tech_stack_bias_analysis(reviewer_reviews: list[dict]) -> dict:
    """Group reviewer scores by tech category and check for differential treatment."""
    group_scores = defaultdict(list)
    for review in reviewer_reviews:
        group = _assign_tech_group(review.get("tech_stack", []))
        group_scores[group].append(review["final_score"])

    group_means = {g: float(np.mean(s)) for g, s in group_scores.items() if len(s) >= 2}
    if len(group_means) < 2:
        return {"bias_detected": False, "group_means": group_means, "max_diff": 0.0}

    values = list(group_means.values())
    max_diff = max(values) - min(values)
    favored = max(group_means, key=group_means.get)
    penalized = min(group_means, key=group_means.get)

    return {
        "bias_detected": max_diff >= TECH_BIAS_THRESHOLD,
        "group_means": group_means,
        "max_diff": round(max_diff, 2),
        "favored_group": favored if max_diff >= TECH_BIAS_THRESHOLD else None,
        "penalized_group": penalized if max_diff >= TECH_BIAS_THRESHOLD else None,
    }


def _isolation_forest_check(reviewer_reviews: list[dict], current_eval: dict) -> dict:
    """
    Train Isolation Forest on reviewer's historical feature vectors.
    Predict if the current evaluation is an outlier.
    """
    if len(reviewer_reviews) < 5:
        return {"is_outlier": False, "anomaly_score": 0.0, "note": "insufficient_history"}

    def feature_vec(r):
        return [
            r.get("innovation", 0),
            r.get("technical", 0),
            r.get("presentation", 0),
            r.get("final_score", 0),
            r.get("innovation", 0) - r.get("technical", 0),
            r.get("final_score", 0) - r.get("presentation", 0),
        ]

    history_features = [feature_vec(r) for r in reviewer_reviews]
    current_features = [feature_vec(current_eval)]

    scaler = StandardScaler()
    scaled_history = scaler.fit_transform(history_features)
    scaled_current = scaler.transform(current_features)

    clf = IsolationForest(contamination=ISOLATION_CONTAMINATION, random_state=42, n_estimators=100)
    clf.fit(scaled_history)

    prediction = clf.predict(scaled_current)[0]       # -1 = outlier, 1 = normal
    raw_score = clf.score_samples(scaled_current)[0]   # more negative = more anomalous
    anomaly_score = round(float(1 - (raw_score + 0.5) * 2), 3)  # normalize to [0, 1]

    return {
        "is_outlier": bool(prediction == -1),
        "anomaly_score": max(0.0, min(1.0, anomaly_score)),
    }


def _score_normalization(
    raw_score: float,
    reviewer_mean: float,
    reviewer_std: float,
    global_mean: float,
    global_std: float,
) -> float:
    """
    Z-score normalize reviewer score then rescale to global distribution.
    Produces a fairer score adjusted for reviewer harshness/leniency.
    """
    if reviewer_std < 0.5:
        reviewer_std = 0.5
    z = (raw_score - reviewer_mean) / reviewer_std
    normalized = global_mean + z * global_std
    return round(max(0.0, min(100.0, normalized)), 2)


def _reviewer_consistency_score(reviews: list[dict]) -> float:
    """Returns 0-100, where 100 = perfectly consistent."""
    if len(reviews) < 2:
        return 100.0
    scores = [r["final_score"] for r in reviews]
    cv = np.std(scores) / max(np.mean(scores), 1.0)
    consistency = max(0.0, 1.0 - cv) * 100.0
    return round(float(consistency), 2)


async def run_bias_detection(evaluation: dict, db) -> dict:
    """
    Full bias detection pipeline for a single reviewer evaluation event.
    Stores result in bias_audit_logs collection.
    """
    reviews_col = db["reviews"]
    audit_col = db["bias_audit_logs"]

    reviewer_id = evaluation["reviewer_id"]

    reviewer_reviews = await reviews_col.find(
        {"reviewer_id": reviewer_id},
        {"innovation": 1, "technical": 1, "presentation": 1, "final_score": 1, "tech_stack": 1, "_id": 0},
    ).to_list(length=2000)

    all_reviews = await reviews_col.find(
        {}, {"final_score": 1, "_id": 0}
    ).to_list(length=10000)

    reviewer_stats = _compute_reviewer_stats(reviewer_reviews)
    global_stats = _compute_global_stats(all_reviews)

    reviewer_mean = reviewer_stats["mean"] or evaluation["final_score"]
    reviewer_std = reviewer_stats["std"] or 0.5
    global_mean = global_stats["mean"]
    global_std = global_stats["std"]

    z_score = (reviewer_mean - global_mean) / global_std if reviewer_stats["count"] >= 3 else 0.0

    leniency_bias = z_score > BIAS_THRESHOLD_Z
    severity_bias = z_score < -BIAS_THRESHOLD_Z

    tech_analysis = _tech_stack_bias_analysis(reviewer_reviews + [evaluation])
    tech_stack_bias = tech_analysis["bias_detected"]

    consistency_score = _reviewer_consistency_score(reviewer_reviews + [evaluation])
    inconsistency_bias = (reviewer_stats["std"] > VARIANCE_THRESHOLD) if reviewer_stats["count"] >= 5 else False

    isolation_result = _isolation_forest_check(reviewer_reviews, evaluation)
    outlier_bias = isolation_result["is_outlier"]

    normalized_score = _score_normalization(
        evaluation["final_score"], reviewer_mean, reviewer_std, global_mean, global_std
    )

    bias_flags = []
    if leniency_bias:
        bias_flags.append("LENIENCY_BIAS")
    if severity_bias:
        bias_flags.append("SEVERITY_BIAS")
    if tech_stack_bias:
        bias_flags.append("TECH_STACK_BIAS")
    if inconsistency_bias:
        bias_flags.append("INCONSISTENCY_BIAS")
    if outlier_bias:
        bias_flags.append("OUTLIER_BIAS")

    bias_detected = len(bias_flags) > 0

    confidence = 0.0
    if bias_detected:
        signals = [
            min(abs(z_score) / (BIAS_THRESHOLD_Z * 2), 1.0) if (leniency_bias or severity_bias) else 0,
            (tech_analysis["max_diff"] / (TECH_BIAS_THRESHOLD * 2)) if tech_stack_bias else 0,
            (reviewer_stats["std"] / (VARIANCE_THRESHOLD * 2)) if inconsistency_bias else 0,
            isolation_result["anomaly_score"] if outlier_bias else 0,
        ]
        confidence = round(min(float(np.mean([s for s in signals if s > 0])) * 1.4, 1.0), 3)

    bias_index = round(abs(z_score) / 3.0 * 50 + (confidence * 50), 2)
    bias_index = min(bias_index, 100.0)

    bias_type = "NONE"
    recommended_action = "No action required. Evaluation appears fair."

    if "LENIENCY_BIAS" in bias_flags:
        bias_type = "LENIENCY_BIAS"
        recommended_action = "Flag for secondary review. Reviewer scores significantly above average."
    elif "SEVERITY_BIAS" in bias_flags:
        bias_type = "SEVERITY_BIAS"
        recommended_action = "Flag for secondary review. Reviewer scores significantly below average."
    elif "TECH_STACK_BIAS" in bias_flags:
        bias_type = "TECH_STACK_BIAS"
        recommended_action = f"Investigate preferential scoring for '{tech_analysis.get('favored_group')}' tech group."
    elif "INCONSISTENCY_BIAS" in bias_flags:
        bias_type = "INCONSISTENCY_BIAS"
        recommended_action = "Schedule calibration session. High scoring variance detected."
    elif "OUTLIER_BIAS" in bias_flags:
        bias_type = "OUTLIER_BIAS"
        recommended_action = "Request score justification. Evaluation is a statistical outlier."

    audit_entry = {
        "reviewer_id": reviewer_id,
        "project_id": evaluation.get("project_id"),
        "evaluation": evaluation,
        "bias_detected": bias_detected,
        "bias_type": bias_type,
        "bias_flags": bias_flags,
        "confidence": confidence,
        "bias_index": bias_index,
        "recommended_action": recommended_action,
        "analytics": {
            "reviewer_stats": reviewer_stats,
            "global_stats": {"mean": global_mean, "std": global_std},
            "z_score": round(z_score, 4),
            "normalized_score": normalized_score,
            "consistency_score": consistency_score,
            "tech_stack_analysis": tech_analysis,
            "isolation_forest": isolation_result,
        },
        "timestamp": datetime.now(timezone.utc),
    }

    await audit_col.insert_one(audit_entry)

    return {
        "bias_detected": bias_detected,
        "bias_type": bias_type,
        "bias_flags": bias_flags,
        "confidence": confidence,
        "recommended_action": recommended_action,
        "analytics": {
            "reviewer_bias_index": bias_index,
            "tech_stack_bias": tech_analysis,
            "reviewer_variance": round(reviewer_std, 2),
            "normalized_score": normalized_score,
            "consistency_score": consistency_score,
            "z_score": round(z_score, 4),
            "reviewer_stats": reviewer_stats,
            "global_stats": {"mean": round(global_mean, 2), "std": round(global_std, 2)},
            "isolation_forest": isolation_result,
        },
        "bias_alerts": [
            {"type": flag, "severity": "HIGH" if flag in ("LENIENCY_BIAS", "SEVERITY_BIAS") else "MEDIUM"}
            for flag in bias_flags
        ],
    }
