import math
from typing import Any


def _rubric_breakdown(review: dict) -> dict:
    feasibility = round((review.get("technical", 0) + review.get("presentation", 0)) / 2, 2)
    overall = round(
        (
            review.get("innovation", 0)
            + review.get("technical", 0)
            + review.get("presentation", 0)
        )
        / 3,
        2,
    )
    return {
        "innovation": float(review.get("innovation", 0)),
        "technical": float(review.get("technical", 0)),
        "presentation": float(review.get("presentation", 0)),
        "feasibility": float(feasibility),
        "overall": float(overall),
    }


def _judge_vote(review: dict, style: str) -> dict:
    innovation = review.get("innovation", 0)
    technical = review.get("technical", 0)
    presentation = review.get("presentation", 0)
    final_score = review.get("final_score", 0)

    concerns = []
    if final_score < 35 or final_score > 90:
        concerns.append("outlier_final_score")

    if style == "innovation_focused":
        if innovation < 45 and innovation + presentation < 120:
            concerns.append("low_innovation")
        if innovation > technical + 15:
            concerns.append("innovation_skew")
    elif style == "technical_focused":
        if technical < 50:
            concerns.append("low_technical_depth")
        if technical < presentation - 20:
            concerns.append("technical_underweight")
    else:  # consensus judge
        if abs(innovation - technical) > 25 or abs(technical - presentation) > 25:
            concerns.append("score_inconsistency")

    if feasibility := _rubric_breakdown(review)["feasibility"]:
        if feasibility < 40 and final_score > 55:
            concerns.append("feasibility_gap")

    return {
        "judge": style,
        "concern_flags": concerns,
        "recommendation": "human_review" if concerns else "accept",
    }


def _build_feedback(review: dict, rubric: dict) -> list[str]:
    feedback = []
    if rubric["innovation"] >= 85:
        feedback.append("Strong innovation with a clear novel idea.")
    elif rubric["innovation"] >= 60:
        feedback.append("Good innovation, but the concept can be sharpened further.")
    else:
        feedback.append("The idea needs more originality and novelty.")

    if rubric["technical"] >= 85:
        feedback.append("Excellent technical depth and implementation approach.")
    elif rubric["technical"] >= 60:
        feedback.append("Solid technical work; focus next on polish and scalability.")
    else:
        feedback.append("Technical execution needs stronger architecture or validation.")

    if rubric["presentation"] >= 85:
        feedback.append("Presentation is compelling and clearly communicates value.")
    elif rubric["presentation"] >= 60:
        feedback.append("Presentation is adequate but could be more concise and structured.")
    else:
        feedback.append("Presentation requires clearer storytelling and stronger delivery.")

    if rubric["feasibility"] < 50:
        feedback.append(
            "Feasibility is a concern; clarify implementation plan and next steps."
        )
    else:
        feedback.append(
            "Feasibility looks reasonable given the team and technology choices."
        )

    if review.get("project_description"):
        feedback.append(
            "Consider aligning the technical roadmap more closely with the core use case."
        )

    return feedback


def run_review_agent(review: dict) -> dict:
    rubric = _rubric_breakdown(review)
    votes = [
        _judge_vote(review, "innovation_focused"),
        _judge_vote(review, "technical_focused"),
        _judge_vote(review, "consensus"),
    ]

    human_review = any(v["recommendation"] == "human_review" for v in votes)
    minority_veto = human_review
    recommendation = "human_review" if human_review else "auto_accept"
    confidence = round(
        max(
            0.45,
            1.0 - (len([v for v in votes if v["recommendation"] == "human_review"]) / 3.0),
        ),
        2,
    )

    feedback_lines = _build_feedback(review, rubric)
    feedback_text = " ".join(feedback_lines)

    return {
        "reviewer_id": review.get("reviewer_id"),
        "project_id": review.get("project_id"),
        "rubric": rubric,
        "feedback": {
            "summary": feedback_text,
            "highlights": feedback_lines,
        },
        "panel": votes,
        "minority_veto": minority_veto,
        "recommended_action": recommendation,
        "confidence": confidence,
    }
