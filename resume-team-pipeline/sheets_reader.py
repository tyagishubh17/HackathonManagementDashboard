import os
import re
import gspread
from google.oauth2.service_account import Credentials
import requests

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets.readonly",
    "https://www.googleapis.com/auth/drive.readonly",
]
COLUMN_MAP = {
    "Full Name": "name",
    "Email Address": "email",
    "Gender": "gender",
    "Resume Upload": "resume_link",
}
DRIVE_FILE_ID_PATTERN = re.compile(r"/d/([a-zA-Z0-9_-]+)")

def get_client(service_account_path: str):
    creds = Credentials.from_service_account_file(service_account_path, scopes=SCOPES)
    return gspread.authorize(creds)

def fetch_form_responses(spreadsheet_id: str, service_account_path: str, worksheet_index: int = 0) -> list:
    client = get_client(service_account_path)
    sheet = client.open_by_key(spreadsheet_id)
    worksheet = sheet.get_worksheet(worksheet_index)
    records = worksheet.get_all_records()                                     
    participants = []
    for row in records:
        mapped = {}
        for original_col, value in row.items():
            clean_col = original_col.strip()
            field_name = COLUMN_MAP.get(clean_col, clean_col)
            mapped[field_name] = value
        participants.append(mapped)
    return participants

def extract_drive_file_id(drive_url: str) -> str:
    if not drive_url:
        return ""
    match = DRIVE_FILE_ID_PATTERN.search(drive_url)
    if match:
        return match.group(1)
    match = re.search(r"[?&]id=([a-zA-Z0-9_-]+)", drive_url)
    if match:
        return match.group(1)
    return ""

def download_drive_file(file_id: str, service_account_path: str, destination_path: str) -> bool:
    creds = Credentials.from_service_account_file(service_account_path, scopes=SCOPES)
    creds.refresh(__import__("google.auth.transport.requests", fromlist=["Request"]).Request())
    url = f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media"
    headers = {"Authorization": f"Bearer {creds.token}"}
    response = requests.get(url, headers=headers, stream=True)
    if response.status_code != 200:
        print(f"  [WARN] Failed to download Drive file {file_id}: HTTP {response.status_code}")
        if response.status_code == 404:
            print(f"         Ensure that the Google Drive folder containing the resumes is shared with:")
            print(f"         {creds.service_account_email}")
        return False
    os.makedirs(os.path.dirname(destination_path), exist_ok=True)
    with open(destination_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    return True

def fetch_and_download_resumes(spreadsheet_id: str, service_account_path: str,
                                download_dir: str = "data/resumes") -> list:
    participants = fetch_form_responses(spreadsheet_id, service_account_path)
    for p in participants:
        drive_url = p.get("resume_link", "")
        file_id = extract_drive_file_id(drive_url)
        if not file_id:
            p["resume_filepath"] = None
            continue
        guessed_ext = ".pdf"
        for ext in (".pdf", ".docx", ".doc"):
            if ext in drive_url.lower():
                guessed_ext = ext
                break
        safe_name = re.sub(r"[^a-zA-Z0-9_]", "_", p.get("name", file_id))
        dest_path = os.path.join(download_dir, f"{safe_name}_{file_id}{guessed_ext}")
        success = download_drive_file(file_id, service_account_path, dest_path)
        p["resume_filepath"] = dest_path if success else None
    return participants
if __name__ == "__main__":
    print("This module is meant to be imported by main_pipeline.py.")
    print("To test it standalone, fill in config/settings.py with your")
    print("SPREADSHEET_ID and service account path, then run:")
    print("  python -c \"from sheets_reader import fetch_form_responses; "
          "print(fetch_form_responses('<id>', 'config/service_account.json'))\"")
