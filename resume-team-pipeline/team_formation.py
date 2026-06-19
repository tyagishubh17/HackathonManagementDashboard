import sys
import os
from dataclasses import dataclass, field
from typing import List, Dict
import copy
from config.skill_taxonomy import get_categories
from nlp_skill_extractor import SkillProfile

@dataclass

class Team:
    team_id: int
    members: List[SkillProfile] = field(default_factory=list)
    @property

    def total_score(self) -> float:
        return round(sum(m.total_skill_score for m in self.members), 2)
    @property

    def category_coverage(self) -> Dict[str, int]:
        coverage = {cat: 0 for cat in get_categories()}
        for m in self.members:
            for cat, count in m.category_scores.items():
                coverage[cat] += count
        return coverage
    @property

    def missing_categories(self) -> List[str]:
        cov = self.category_coverage
        return [cat for cat, count in cov.items() if count == 0]

    def to_dict(self):
        return {
            "team_id": self.team_id,
            "total_score": self.total_score,
            "category_coverage": self.category_coverage,
            "members": [
                {
                    "name": m.name,
                    "email": m.email,
                    "skills": m.skills,
                    "total_skill_score": m.total_skill_score,
                }
                for m in self.members
            ],
        }

def _snake_order(num_teams: int, num_rounds: int) -> List[int]:
    order = []
    for round_num in range(num_rounds):
        seq = list(range(num_teams))
        if round_num % 2 == 1:
            seq = seq[::-1]
        order.extend(seq)
    return order

def _pick_best_for_team(team: Team, candidates: List[SkillProfile], lookahead: int = 4) -> SkillProfile:
    pool = candidates[:lookahead] if len(candidates) > lookahead else candidates
    missing = set(team.missing_categories)

    def gap_fill_count(profile: SkillProfile) -> int:
        covered_categories = {cat for cat, n in profile.category_scores.items() if n > 0}
        return len(covered_categories & missing)
    pool_sorted = sorted(
        pool,
        key=lambda p: (gap_fill_count(p), p.total_skill_score),
        reverse=True,
    )
    return pool_sorted[0]

def form_teams(profiles: List[SkillProfile], team_size: int = 4, balance_tolerance: float = 1.5,
               max_balance_iterations: int = 200) -> List[Team]:
    if not profiles:
        return []
    num_teams = max(1, round(len(profiles) / team_size))
    teams = [Team(team_id=i + 1) for i in range(num_teams)]
    remaining = sorted(profiles, key=lambda p: p.total_skill_score, reverse=True)
    num_rounds = (len(profiles) // num_teams) + 2                                         
    pick_order = _snake_order(num_teams, num_rounds)
    for team_idx in pick_order:
        if not remaining:
            break
        team = teams[team_idx]
        if len(team.members) >= team_size + 1:
            continue                                                      
        chosen = _pick_best_for_team(team, remaining, lookahead=min(6, len(remaining)))
        team.members.append(chosen)
        remaining.remove(chosen)
    while remaining:
        teams_sorted = sorted(teams, key=lambda t: (len(t.members), t.total_score))
        target_team = teams_sorted[0]
        chosen = _pick_best_for_team(target_team, remaining, lookahead=min(6, len(remaining)))
        target_team.members.append(chosen)
        remaining.remove(chosen)
    _balance_pass(teams, balance_tolerance, max_balance_iterations)
    return teams

def _balance_pass(teams: List[Team], tolerance: float, max_iterations: int):
    for _ in range(max_iterations):
        teams_sorted = sorted(teams, key=lambda t: t.total_score)
        low_team = teams_sorted[0]
        high_team = teams_sorted[-1]
        gap = high_team.total_score - low_team.total_score
        if gap <= tolerance:
            break
        best_swap = None
        best_new_gap = gap
        for low_member in low_team.members:
            for high_member in high_team.members:
                new_low_score = round(low_team.total_score - low_member.total_skill_score + high_member.total_skill_score, 2)
                new_high_score = round(high_team.total_score - high_member.total_skill_score + low_member.total_skill_score, 2)
                new_gap = abs(new_high_score - new_low_score)
                if new_gap < best_new_gap:
                    best_new_gap = new_gap
                    best_swap = (low_member, high_member)
        if best_swap is None:
            break                                                            
        low_member, high_member = best_swap
        low_team.members.remove(low_member)
        high_team.members.remove(high_member)
        low_team.members.append(high_member)
        high_team.members.append(low_member)

def print_team_summary(teams: List[Team]):
    print("\n" + "=" * 60)
    print("TEAM FORMATION SUMMARY")
    print("=" * 60)
    for team in teams:
        print(f"\nTeam {team.team_id}  (score: {team.total_score})")
        for m in team.members:
            skill_list = ", ".join(m.skills.keys()) if m.skills else "(no skills detected)"
            print(f"   - {m.name:<20} score={m.total_skill_score:<6} skills: {skill_list}")
        missing = team.missing_categories
        if missing:
            print(f"   [Coverage gap] No one covers: {', '.join(missing)}")
    scores = [t.total_score for t in teams]
    print(f"\nBalance check -> max: {max(scores)}, min: {min(scores)}, spread: {round(max(scores) - min(scores), 2)}")
