"""
Reset and restart file watchers
"""
import sqlite3
from pathlib import Path

DB_PATH = Path("data/logs.db")

if not DB_PATH.exists():
    print(f"❌ Database not found at {DB_PATH}")
    exit(1)

conn = sqlite3.connect(str(DB_PATH))
cursor = conn.cursor()

# Get all active folders
print("=== Resetting Watchers ===\n")
cursor.execute("SELECT id, path, is_active FROM watch_folders WHERE is_active='True'")
folders = cursor.fetchall()

print(f"Found {len(folders)} active folder(s):")
for folder in folders:
    print(f"  {folder[0]}: {folder[1]}")
    print(f"    Active: {folder[2]}")

print("\n⚠️  To fix file watching:")
print("1. Stop the backend server (Ctrl+C)")
print("2. Restart it:")
print("   cd app")
print("   uvicorn main:app --reload")
print("3. Wait for 'File watchers started' message")
print("4. Modify a file in the watched folder")
print("5. Check the backend console for 'File modified/created' messages")

conn.close()

