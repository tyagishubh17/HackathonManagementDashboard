import random
from typing import Any, List, Dict, Set


def _normalize_skills(values: list[str]) -> set[str]:
    return {v.strip().lower() for v in values if isinstance(v, str) and v.strip()}


def _skill_match_score(reviewer: dict, project: dict) -> float:
    reviewer_skills = _normalize_skills(reviewer.get("expertise", []))
    project_skills = _normalize_skills(project.get("tech_stack", []) or project.get("techStack", []))
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
    if str(project.get("id") or project.get("_id")) in conflicts or str(reviewer.get("id") or reviewer.get("_id")) in project_conflicts:
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
    """
    Optimized assignment system that strictly requires exactly 6 reviewers,
    splits them into two 3-member panels (A & B), and distributes projects
    evenly between panels using the multi-objective scoring matrix.
    """
    reviewers = payload.get("reviewers") or payload.get("judges") or []
    projects = payload.get("projects") or payload.get("projects_to_review") or []
    max_reviews = int(payload.get("max_reviews_per_reviewer", payload.get("reviewsPerProject", 999)))
    
    if len(reviewers) != 6:
        raise ValueError(f"Automated 3-3 configuration strictly requires exactly 6 reviewers. Found: {len(reviewers)}")

    # 1. Randomly initialize the two 3-member panels
    shuffled_reviewers = list(reviewers)
    random.shuffle(shuffled_reviewers)
    
    panel_a_reviewers = shuffled_reviewers[:3]
    panel_b_reviewers = shuffled_reviewers[3:]
    
    panel_a_ids = [str(r.get("id") or r.get("_id")) for r in panel_a_reviewers]
    panel_b_ids = [str(r.get("id") or r.get("_id")) for r in panel_b_reviewers]

    # 2. Track workload bounds locally
    reviewer_loads = {str(r.get("id") or r.get("_id")): int(r.get("workload", 0)) for r in reviewers}
    assignments = []

    # 3. Score each project against both possible panels to find the optimal split
    project_panel_metrics = []
    
    for project in projects:
        project_id = str(project.get("id") or project.get("_id"))
        
        # Calculate panel execution score functions
        for panel_name, panel_reviewers in [("A", panel_a_reviewers), ("B", panel_b_reviewers)]:
            panel_scores = []
            conflict_triggered = False
            
            for reviewer in panel_reviewers:
                reviewer_id = str(reviewer.get("id") or reviewer.get("_id"))
                
                skill_score = _skill_match_score(reviewer, project)
                workload_score = _workload_balance_score(reviewer, max_reviews)
                conflict_score = _conflict_score(reviewer, project)
                diversity_score = _diversity_score(reviewer, project)
                
                if conflict_score <= 0.0:
                    conflict_triggered = True
                    break
                    
                objective = (
                    0.40 * skill_score
                    + 0.30 * workload_score
                    + 0.20 * conflict_score
                    + 0.10 * diversity_score
                )
                
                panel_scores.append({
                    "reviewer_id": reviewer_id,
                    "score": _perturbed_score(objective, project_id, reviewer_id),
                    "expertise_alignment": round(skill_score * 100.0, 2),
                    "workload_balance": round(workload_score * 100.0, 2),
                    "conflict_free": True,
                    "diversity": round(diversity_score * 100.0, 2)
                })
            
            if not conflict_triggered and len(panel_scores) == 3:
                # Panel score aggregate metric is the average of its 3 reviewers
                avg_panel_score = sum(r["score"] for r in panel_scores) / 3.0
                project_panel_metrics.append({
                    "project": project,
                    "project_id": project_id,
                    "panel_name": panel_name,
                    "panel_score": avg_panel_score,
                    "breakdown": panel_scores
                })

    # 4. Balanced Distribution Logic (Evenly split projects between Panel A and Panel B)
    # Sort options by how well a panel fits a project mathematically
    project_panel_metrics.sort(key=lambda x: x["panel_score"], reverse=True)
    
    target_per_panel = (len(projects) + 1) // 2
    assigned_counts = {"A": 0, "B": 0}
    processed_projects = set()

    for metric in project_panel_metrics:
        pid = metric["project_id"]
        p_name = metric["panel_name"]
        
        if pid in processed_projects:
            continue
            
        if assigned_counts[p_name] < target_per_panel:
            # Commit project assignment to this panel
            assigned_counts[p_name] += 1
            processed_projects.add(pid)
            
            # Increment tracking counters for all 3 members inside the chosen panel
            for judge in metric["breakdown"]:
                reviewer_loads[judge["reviewer_id"]] += 1
                
            panel_member_ids = panel_a_ids if p_name == "A" else panel_b_ids
            
            assignments.append({
                "project_id": pid,
                "assignedPanel": p_name,
                "assigned_reviewer_ids": panel_member_ids,
                "reviewerIds": panel_member_ids,
                "objective_score": round(metric["panel_score"] * 100.0, 2),
                "breakdown": metric["breakdown"]
            })

    # 5. Fallback for unassigned items due to absolute hard conflict blocks
    for project in projects:
        pid = str(project.get("id") or project.get("_id"))
        if pid not in processed_projects:
            assignments.append({
                "project_id": pid,
                "assignedPanel": None,
                "assigned_reviewer_ids": [],
                "reviewerIds": [],
                "status": "unassigned",
                "reason": "Hard conflict detected across all available panel options"
            })

    return {
        "assignments": assignments,
        "metadata": {
            "panels": {
                "A": panel_a_ids,
                "B": panel_b_ids
            },
            "weighting": {
                "expertise": 40,
                "workload": 30,
                "conflict_avoidance": 20,
                "diversity": 10,
            },
            "algorithm": "balanced_3-3_panel_assignment",
        }
    }