import re
import spacy
from spacy.matcher import PhraseMatcher
from rapidfuzz import fuzz
from dataclasses import dataclass, field
from typing import List, Dict, Any
from app.services.skill_taxonomy import SKILL_TAXONOMY, get_flat_skill_list, get_categories

FUZZY_THRESHOLD = 85
YEARS_PATTERN = re.compile(r"(\d+)\s*\+?\s*(?:years|year|yrs|yr)", re.IGNORECASE)

@dataclass
class SkillProfile:
    registration_id: str
    user_id: str
    name: str
    email: str
    raw_text_length: int
    skills: Dict[str, str] = field(default_factory=dict)
    category_scores: Dict[str, int] = field(default_factory=dict)
    total_skill_score: float = 0.0
    seniority_score: float = 1.0
    matched_surface_forms: List[str] = field(default_factory=list)

class SkillExtractor:
    def __init__(self):
        # spacy.blank("en") is fast and lightweight as it does not download model weights
        self.nlp = spacy.blank("en")
        self.matcher = PhraseMatcher(self.nlp.vocab, attr="LOWER")
        self._build_matcher()

    def _build_matcher(self):
        flat_skills = get_flat_skill_list()
        by_skill = {}
        for canonical, category, surface in flat_skills:
            by_skill.setdefault((canonical, category), []).append(surface)
        for (canonical, category), surfaces in by_skill.items():
            patterns = [self.nlp.make_doc(s) for s in surfaces]
            match_label = f"{category}::{canonical}"
            self.matcher.add(match_label, patterns)

    def _fuzzy_fallback(self, text: str, already_found: set) -> Dict[str, str]:
        found = {}
        cleaned = re.sub(r"[,;:()\[\]{}!?\"']", " ", text.lower())
        words = cleaned.split()
        windows = set()
        for n in (1, 2, 3):
            for i in range(len(words) - n + 1):
                windows.add(" ".join(words[i:i + n]))
        
        flat_skills = get_flat_skill_list()
        for canonical, category, surface in flat_skills:
            if canonical in already_found:
                continue
            surface_clean = surface.strip()
            if len(surface_clean) < 3:
                continue
            for w in windows:
                if abs(len(w) - len(surface_clean)) > 4:
                    continue
                score = fuzz.ratio(w, surface_clean)
                if score >= FUZZY_THRESHOLD:
                    found[canonical] = category
                    break
        return found

    def _estimate_seniority(self, text: str) -> float:
        matches = YEARS_PATTERN.findall(text)
        if not matches:
            return 1.0
        max_years = max(int(m) for m in matches)
        if max_years >= 4:
            return 1.5
        elif max_years >= 2:
            return 1.25
        else:
            return 1.1

    def extract(self, registration_id: str, user_id: str, name: str, email: str, resume_text: str) -> SkillProfile:
        profile = SkillProfile(
            registration_id=registration_id,
            user_id=user_id,
            name=name,
            email=email,
            raw_text_length=len(resume_text)
        )
        if not resume_text or not resume_text.strip():
            # Estimate default category scores
            profile.category_scores = {cat: 0 for cat in get_categories()}
            return profile

        doc = self.nlp(resume_text)
        matches = self.matcher(doc)
        found_skills: Dict[str, str] = {}
        surface_hits = []
        for match_id, start, end in matches:
            label = self.nlp.vocab.strings[match_id]
            category, canonical = label.split("::", 1)
            found_skills[canonical] = category
            surface_hits.append(doc[start:end].text)

        fuzzy_found = self._fuzzy_fallback(resume_text, set(found_skills.keys()))
        found_skills.update(fuzzy_found)
        profile.skills = found_skills
        profile.matched_surface_forms = surface_hits
        profile.seniority_score = self._estimate_seniority(resume_text)
        
        category_scores = {cat: 0 for cat in get_categories()}
        for canonical, category in found_skills.items():
            category_scores[category] += 1
        profile.category_scores = category_scores
        profile.total_skill_score = round(len(found_skills) * profile.seniority_score, 2)
        return profile

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
                    "registration_id": m.registration_id,
                    "user_id": m.user_id,
                    "name": m.name,
                    "email": m.email,
                    "skills": list(m.skills.keys()),
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

def form_teams_logic(profiles: List[SkillProfile], team_size: int = 4, balance_tolerance: float = 1.5,
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

def form_teams(participants: List[Dict[str, Any]], config: Dict[str, Any]) -> List[Dict[str, Any]]:
    extractor = SkillExtractor()
    profiles = []
    flat_skills = get_flat_skill_list()

    for p in participants:
        reg_id = str(p.get("_id", ""))
        user_id = str(p.get("userId", {}).get("_id") or p.get("userId", ""))
        name = p.get("userId", {}).get("fullName") or p.get("name") or "Unknown"
        email = p.get("userId", {}).get("email") or p.get("email") or ""
        resume_text = p.get("resumeText") or ""

        # Extract skills via NLP
        profile = extractor.extract(
            registration_id=reg_id,
            user_id=user_id,
            name=name,
            email=email,
            resume_text=resume_text
        )

        # Merge manual skills
        manual_skills = p.get("skills", [])
        if manual_skills:
            for ms in manual_skills:
                ms_clean = ms.strip().lower()
                if not ms_clean:
                    continue
                matched = False
                # 1. Exact match against surface forms or canonical
                for canonical, category, surface in flat_skills:
                    if ms_clean == surface or ms_clean == canonical.lower():
                        profile.skills[canonical] = category
                        matched = True
                        break
                
                # 2. Fuzzy match fallback
                if not matched:
                    for canonical, category, surface in flat_skills:
                        if fuzz.ratio(ms_clean, surface) >= FUZZY_THRESHOLD:
                            profile.skills[canonical] = category
                            break

            # Recalculate categories and scores based on manual merge
            category_scores = {cat: 0 for cat in get_categories()}
            for canonical, category in profile.skills.items():
                category_scores[category] += 1
            profile.category_scores = category_scores
            profile.total_skill_score = round(len(profile.skills) * profile.seniority_score, 2)

        profiles.append(profile)

    # Read configuration limits
    max_team_size = int(config.get("maxTeamSize", 4))
    
    # Form teams
    teams = form_teams_logic(profiles, team_size=max_team_size)
    return [t.to_dict() for t in teams]
