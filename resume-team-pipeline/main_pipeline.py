import sys
import os
import json
from config import settings
from sheets_reader import fetch_and_download_resumes
from resume_extractor import extract_resume_text
from nlp_skill_extractor import extract_all
from team_formation import form_teams, print_team_summary
from mongo_writer import push_results_to_mongo

def run_pipeline():
    print("=" * 60)
    print("STEP 1/5: Fetching Google Form responses + resumes from Drive")
    print("=" * 60)
    participants = fetch_and_download_resumes(
        spreadsheet_id=settings.SPREADSHEET_ID,
        service_account_path=settings.SERVICE_ACCOUNT_PATH,
        download_dir=settings.RESUME_DOWNLOAD_DIR,
    )
    print(f"  Found {len(participants)} form responses.")
    print("\n" + "=" * 60)
    print("STEP 2/5: Extracting text from resume files")
    print("=" * 60)
    for p in participants:
        filepath = p.get("resume_filepath")
        if filepath:
            p["resume_text"] = extract_resume_text(filepath)
            status = "OK" if p["resume_text"].strip() else "EMPTY"
            print(f"  {p.get('name', '?'):<25} [{status}]  ({filepath})")
        else:
            p["resume_text"] = ""
            print(f"  {p.get('name', '?'):<25} [NO FILE]")
    print("\n" + "=" * 60)
    print("STEP 3/5: Running NLP skill extraction")
    print("=" * 60)
    profiles = extract_all(participants)
    for prof in profiles:
        print(f"  {prof.name:<25} -> {len(prof.skills)} skills detected "
              f"(score={prof.total_skill_score})")
    print("\n" + "=" * 60)
    print("STEP 4/5: Forming balanced, complementary teams")
    print("=" * 60)
    teams = form_teams(
        profiles,
        team_size=settings.TEAM_SIZE,
        balance_tolerance=settings.BALANCE_TOLERANCE,
    )
    print_team_summary(teams)
    print("\n" + "=" * 60)
    print("STEP 5/5: Pushing results to MongoDB")
    print("=" * 60)
    result = push_results_to_mongo(
        teams,
        mongo_uri=settings.MONGO_URI,
        db_name=settings.MONGO_DB_NAME,
        hackathon_id=settings.HACKATHON_ID,
        clear_existing=settings.CLEAR_EXISTING_DATA,
    )
    os.makedirs("outputs", exist_ok=True)
    output_path = "outputs/team_assignments.json"
    with open(output_path, "w") as f:
        json.dump([t.to_dict() for t in teams], f, indent=2)
    print(f"\n  Local backup saved to {output_path}")
    print("\nPipeline complete.")
    return teams
if __name__ == "__main__":
    run_pipeline()
