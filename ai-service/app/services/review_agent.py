def _normalize_text(text: str) -> str:
    return (text or "").lower().strip()


def _text_keyword_count(text: str, keywords: list[str]) -> int:
    lower_text = _normalize_text(text)
    return sum(1 for kw in keywords if kw and kw in lower_text)


def _tech_stack_text_score(tech_stack: list[str], text: str) -> float:
    text_lower = _normalize_text(text)
    if not tech_stack or not text_lower:
        return 0.0

    normalized = {t.lower().strip() for t in tech_stack if isinstance(t, str) and t.strip()}
    matches = 0
    for token in normalized:
        if token and token in text_lower:
            matches += 1
    return float(matches) / max(1.0, len(normalized))


def _estimate_ai_rubric(project_text: str, tech_stack: list[str]) -> dict:
    text = _normalize_text(project_text)
    tech_match = _tech_stack_text_score(tech_stack, text)
    innovation_keywords = [
        "innovation",
        "novel",
        "unique",
        "first",
        "breakthrough",
        "patent",
        "impact",
        "solution",
        "prototype",
        "creative",
    ]
    technical_keywords = [
        "architecture",
        "performance",
        "scalability",
        "backend",
        "api",
        "deployment",
        "model",
        "algorithm",
        "database",
        "integration",
        "security",
    ]
    presentation_keywords = [
        "demo",
        "prototype",
        "story",
        "clarity",
        "design",
        "user experience",
        "ux",
        "ui",
        "presentation",
        "impact",
        "engaging",
    ]

    length_boost = min(1.0, len(text) / 2200.0)
    innovation = 35 + min(40, _text_keyword_count(text, innovation_keywords) * 8) + length_boost * 15
    technical = 30 + tech_match * 45 + min(15, _text_keyword_count(text, technical_keywords) * 5) + length_boost * 10
    presentation = 30 + min(40, _text_keyword_count(text, presentation_keywords) * 8) + length_boost * 15

    if len(text) < 250:
        presentation = min(presentation, 45)

    return {
        "innovation": round(max(0.0, min(100.0, innovation)), 2),
        "technical": round(max(0.0, min(100.0, technical)), 2),
        "presentation": round(max(0.0, min(100.0, presentation)), 2),
    }


def _ai_confidence(tech_stack: list[str], project_text: str) -> float:
    tech_match = _tech_stack_text_score(tech_stack, project_text)
    text_length = len(_normalize_text(project_text))
    confidence = 0.35 + tech_match * 0.4 + min(0.25, text_length / 2500.0)
    return round(max(0.0, min(1.0, confidence)), 2)


def _final_score_from_rubric(rubric: dict) -> float:
    return round((rubric["innovation"] + rubric["technical"] + rubric["presentation"]) / 3.0, 2)


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


def _is_suggestion_request(review: dict) -> bool:
    return bool(review.get("projectData") and review.get("rubric"))


def _generate_review_suggestions(payload: dict) -> dict:
    project = payload.get("projectData", {})
    rubric = payload.get("rubric", [])
    project_text = project.get("project_description") or project.get("project_text") or ""
    tech_stack = project.get("tech_stack", []) or project.get("techStack", [])
    ai_rubric = _estimate_ai_rubric(project_text, tech_stack)
    ai_score = _final_score_from_rubric(ai_rubric)
    confidence = _ai_confidence(tech_stack, project_text)

    return {
        "project_id": project.get("project_id") or project.get("id"),
        "suggested_scores": {
            "innovation": ai_rubric["innovation"],
            "technical": ai_rubric["technical"],
            "presentation": ai_rubric["presentation"],
            "final_score": ai_score,
        },
        "rationale": "AI estimated the score from project documentation and tech stack alignment.",
        "confidence": confidence,
        "tech_stack_match": round(_tech_stack_text_score(tech_stack, project_text) * 100, 2),
    }


def _average_panel_score(panel: list[dict]) -> float:
    if not panel:
        return 0.0
    scores = [float(item.get("final_score", 0)) for item in panel]
    return round(sum(scores) / len(scores), 2)


def _agreement_percent(ai_score: float, panel_score: float) -> float:
    return round(max(0.0, 100.0 - abs(ai_score - panel_score)), 2)


def run_review_agent(review: dict) -> dict:
    if _is_suggestion_request(review):
        return _generate_review_suggestions(review)

    project_text = review.get("project_text") or review.get("pdf_text") or review.get("project_description") or ""
    tech_stack = review.get("tech_stack", [])
    ai_rubric = _estimate_ai_rubric(project_text, tech_stack)
    ai_score = _final_score_from_rubric(ai_rubric)
    ai_confidence = _ai_confidence(tech_stack, project_text)

    human_panel_scores = review.get("human_panel_scores", []) or []
    panel_average = _average_panel_score(human_panel_scores) if human_panel_scores else None
    agreement_percent = _agreement_percent(ai_score, panel_average) if panel_average is not None else None
    agreement_status = "matched" if agreement_percent is not None and agreement_percent >= 75 else "diverged"

    final_score = ai_score
    report_to_organizer = False
    bias_report = None
    if panel_average is not None:
        if agreement_status == "matched":
            final_score = panel_average
        else:
            final_score = round(ai_score * 0.6 + panel_average * 0.4, 2)
            report_to_organizer = True
            bias_report = {
                "issue": "Human panel scores diverge from AI predicted score.",
                "details": f"AI predicted {ai_score}, panel average is {panel_average} ({agreement_percent}% agreement).",
                "recommended_action": "Review panel evaluation for potential bias or miscalibration.",
            }

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

    result = {
        "reviewer_id": review.get("reviewer_id"),
        "project_id": review.get("project_id"),
        "rubric": rubric,
        "feedback": {
            "summary": feedback_text,
            "highlights": feedback_lines,
        },
        "panel": votes,
        "ai_estimation": {
            "rubric": ai_rubric,
            "final_score": ai_score,
            "confidence": ai_confidence,
            "tech_stack_match": round(_tech_stack_text_score(tech_stack, project_text) * 100, 2),
        },
        "human_panel": {
            "scores": human_panel_scores,
            "average_score": panel_average,
            "agreement_percent": agreement_percent,
            "agreement_status": agreement_status,
        },
        "final_score": final_score,
        "report_to_organizer": report_to_organizer,
        "bias_report": bias_report,
        "minority_veto": minority_veto,
        "recommended_action": recommendation,
        "confidence": confidence,
    }

    if report_to_organizer:
        result["organizer_alert"] = {
            "reason": "Human panel score mismatch with AI prediction",
            "recommendation": "Notify organizer and perform a bias audit.",
        }

    return result
