import sys
print("Starting import diagnostic...", flush=True)
try:
    print("Importing app.main...", flush=True)
    from app.main import app
    print("Import successful!", flush=True)
except Exception as e:
    print("Import failed with error:", flush=True)
    import traceback
    traceback.print_exc()
