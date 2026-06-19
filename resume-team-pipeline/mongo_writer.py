from pymongo import MongoClient
from datetime import datetime, timezone
from typing import List
import sys
import os
from team_formation import Team

def get_db(mongo_uri: str, db_name: str = "hackathon_dashboard"):
    client = MongoClient(mongo_uri)
    return client[db_name]

def push_results_to_mongo(teams: List[Team], mongo_uri: str, db_name: str = "hackathon_dashboard",
                           hackathon_id: str = "default_hackathon", clear_existing: bool = True):
    db = get_db(mongo_uri, db_name)
    participants_col = db["participants"]
    teams_col = db["teams"]
    if clear_existing:
        participants_col.delete_many({"hackathon_id": hackathon_id})
        teams_col.delete_many({"hackathon_id": hackathon_id})
    run_timestamp = datetime.now(timezone.utc)
    team_docs = []
    participant_docs = []
    for team in teams:
        team_doc = team.to_dict()
        team_doc["hackathon_id"] = hackathon_id
        team_doc["created_at"] = run_timestamp
        team_docs.append(team_doc)
        for member in team.members:
            participant_docs.append({
                "hackathon_id": hackathon_id,
                "name": member.name,
                "email": member.email,
                "skills": member.skills,
                "category_scores": member.category_scores,
                "total_skill_score": member.total_skill_score,
                "seniority_score": member.seniority_score,
                "assigned_team_id": team.team_id,
                "created_at": run_timestamp,
            })
    if team_docs:
        teams_col.insert_many(team_docs)
    if participant_docs:
        participants_col.insert_many(participant_docs)
    print(f"  Inserted {len(team_docs)} teams and {len(participant_docs)} participants "
          f"into MongoDB database '{db_name}' (hackathon_id='{hackathon_id}').")
    return {"teams_inserted": len(team_docs), "participants_inserted": len(participant_docs)}
