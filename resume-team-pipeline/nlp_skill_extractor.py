import re
import spacy
from spacy.matcher import PhraseMatcher
from rapidfuzz import fuzz
from dataclasses import dataclass, field
from typing import List, Dict
import sys
import os
from config.skill_taxonomy import SKILL_TAXONOMY, get_flat_skill_list, get_categories

FUZZY_THRESHOLD = 85
YEARS_PATTERN = re.compile(r"(\d+)\s*\+?\s*(?:years|year|yrs|yr)", re.IGNORECASE)
@dataclass

class SkillProfile:
    name: str
    email: str
    raw_text_length: int
    skills: Dict[str, str] = field(default_factory=dict)                                    
    category_scores: Dict[str, int] = field(default_factory=dict)                               
    total_skill_score: int = 0
    seniority_score: float = 1.0                                                         
    matched_surface_forms: List[str] = field(default_factory=list)                              

class SkillExtractor:

    def __init__(self):
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
        for canonical, category, surface in get_flat_skill_list():
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

    def extract(self, name: str, email: str, resume_text: str) -> SkillProfile:
        profile = SkillProfile(name=name, email=email, raw_text_length=len(resume_text))
        if not resume_text or not resume_text.strip():
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

def extract_all(participants: List[dict]) -> List[SkillProfile]:
    extractor = SkillExtractor()
    profiles = []
    for p in participants:
        profile = extractor.extract(
            name=p.get("name", "Unknown"),
            email=p.get("email", ""),
            resume_text=p.get("resume_text", ""),
        )
        profiles.append(profile)
    return profiles
if __name__ == "__main__":
    sample_resumes = [
        {
            "name": "Asha Verma",
            "email": "asha@example.com",
            "resume_text": "Experienced in React, Node.js and MongoDB. 3 years building REST APIs. "
                            "Also familiar with Docker and AWS deployment.",
        },
        {
            "name": "Ravi Kumar",
            "email": "ravi@example.com",
            "resume_text": "Final year CS student. Strong in Python, Machine Learning, TensorFlow, "
                            "and Data Structures. Worked on an NLP project using spaCy. "
                            "1 year of internship experience.",
        },
        {
            "name": "Maya Singh",
            "email": "maya@example.com",
            "resume_text": "Passionate UI/UX designer. Proficient in Figma, Adobe XD, prototyping "
                            "and wireframing. 2 years freelance design experience.",
        },
    ]
    profiles = extract_all(sample_resumes)
    for p in profiles:
        print(f"\n{p.name} ({p.email})")
        print(f"  Skills found: {p.skills}")
        print(f"  Category scores: {p.category_scores}")
        print(f"  Seniority multiplier: {p.seniority_score}")
        print(f"  Total skill score: {p.total_skill_score}")
