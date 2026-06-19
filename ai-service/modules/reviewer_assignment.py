import random
from typing import Any


def _normalize_skills(values: list[str]) -> set[str]:
    return {v.strip().lower() for v in values if isinstance(v, str) and v.strip()}


def _skill_match_score(reviewer: dict, project: dict) -> float:
    reviewer_skills = _normalize_skills(reviewer.get("expertise", []))
    project_skills = _normalize_skills(project.get("tech_stack", []))
    if not project_skills or not reviewer_skills:
        return 0.0
    return float(len(reviewer_skills & project_skills)) / float(len(project_skills))


def _workload_balance_score(reviewer: dict, max_reviews_per_reviewer: int) -> float:
    workload = float(reviewer.get("workload", 0))
    if max_reviews_per_reviewer <= 0:
        return 0.0
    return max(0.0, 1.0 - min(workload / float(max_reviews_per_reviewer), 1.0))


def _conflict_score(reviewer: dict, project: dict) -> float:
    conflicts = set(reviewer.get("conflicts", []))
    project_conflicts = set(project.get("conflicts", []))
    if str(project.get("id")) in conflicts or str(reviewer.get("id")) in project_conflicts:
        return 0.0
    return 1.0


def _diversity_score(reviewer: dict, project: dict) -> float:
    reviewer_affiliation = (reviewer.get("affiliation") or "").strip().lower()
    project_affiliation = (project.get("owner_affiliation") or "").strip().lower()
    if not reviewer_affiliation or not project_affiliation:
        return 0.5
    return 1.0 if reviewer_affiliation != project_affiliation else 0.6


def _perturbed_score(base_score: float, project_id: str, reviewer_id: str) -> float:
    key = f"{project_id}:{reviewer_id}"
    noise = random.Random(key).uniform(-0.025, 0.025)
    return base_score + noise


def assign_reviewers(payload: dict) -> dict:
    reviewers = payload.get("reviewers", [])
    projects = payload.get("projects", [])
    max_reviews = int(payload.get("max_reviews_per_reviewer", 2))
    if max_reviews < 1:
        max_reviews = 2

    assignments = []
    reviewer_loads = {str(r.get("id")): int(r.get("workload", 0)) for r in reviewers}

    for project in projects:
        scores = []
        for reviewer in reviewers:
            reviewer_id = str(reviewer.get("id"))
            project_id = str(project.get("id"))
            if reviewer_loads.get(reviewer_id, 0) >= max_reviews:
                continue

            skill_score = _skill_match_score(reviewer, project)
            workload_score = _workload_balance_score(reviewer, max_reviews)
            conflict_score = _conflict_score(reviewer, project)
            diversity_score = _diversity_score(reviewer, project)

            if conflict_score <= 0.0:
                continue

            objective = (
                0.40 * skill_score
                + 0.30 * workload_score
                + 0.20 * conflict_score
                + 0.10 * diversity_score
            )
            scores.append(
                {
                    "reviewer_id": reviewer_id,
                    "score": _perturbed_score(objective, project_id, reviewer_id),
                    "expertise_alignment": round(skill_score * 100.0, 2),
                    "workload_balance": round(workload_score * 100.0, 2),
                    "conflict_free": bool(conflict_score > 0.0),
                    "diversity": round(diversity_score * 100.0, 2),
                }
            )

        if not scores:
            assignments.append(
                {
                    "project_id": project.get("id"),
                    "assigned_reviewer_id": None,
                    "status": "unassigned",
                    "reason": "no eligible reviewer found",
                }
            )
            continue

        best = max(scores, key=lambda item: item["score"])
        reviewer_loads[best["reviewer_id"]] = reviewer_loads.get(best["reviewer_id"], 0) + 1

        assignments.append(
            {
                "project_id": project.get("id"),
                "assigned_reviewer_id": best["reviewer_id"],
                "objective_score": round(best["score"] * 100.0, 2),
                "breakdown": {
                    "expertise_alignment": best["expertise_alignment"],
                    "workload_balance": best["workload_balance"],
                    "conflict_free": best["conflict_free"],
                    "diversity": best["diversity"],
                },
            }
        )

    return {
        "assignments": assignments,
        "metadata": {
            "weighting": {
                "expertise": 40,
                "workload": 30,
                "conflict_avoidance": 20,
                "diversity": 10,
            },
            "max_reviews_per_reviewer": max_reviews,
            "algorithm": "perturbed_maximization",
        },
    }
