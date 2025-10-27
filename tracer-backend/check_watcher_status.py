"""
Check if file watchers are actually running
"""
import sqlite3
from pathlib import Path

# Database path
DB_PATH = Path("data/logs.db")

if not DB_PATH.exists():
    print(f"❌ Database not found at {DB_PATH}")
    exit(1)

conn = sqlite3.connect(str(DB_PATH))
cursor = conn.cursor()

# Check watch_folders table
print("=== Watch Folders ===")
try:
    cursor.execute("SELECT * FROM watch_folders")
    folders = cursor.fetchall()
    print(f"Total folders: {len(folders)}")
    for folder in folders:
        print(f"  ID: {folder[0]}")
        print(f"  Path: {folder[1]}")
        print(f"  Active: {folder[2]}")
        print(f"  File Patterns: {folder[4]}")
        print(f"  Recursive: {folder[5]}")
        print()
except Exception as e:
    print(f"Error: {e}")

# Check file_changes table
print("\n=== File Changes ===")
try:
    cursor.execute("SELECT COUNT(*) FROM file_changes")
    count = cursor.fetchone()[0]
    print(f"Total changes: {count}")
    
    if count > 0:
        cursor.execute("""
            SELECT timestamp, event_type, file_name, file_path 
            FROM file_changes 
            ORDER BY timestamp DESC 
            LIMIT 10
        """)
        changes = cursor.fetchall()
        print("\nRecent changes:")
        for change in changes:
            print(f"  {change[0]} - {change[1]} - {change[2]}")
            print(f"    Path: {change[3]}")
    else:
        print("No file changes recorded yet")
        print("\n💡 Try modifying a file in the watched folder and check again")
        
except Exception as e:
    print(f"Error: {e}")

# Check if tables exist
print("\n=== Database Tables ===")
try:
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print("Tables:")
    for table in tables:
        print(f"  - {table[0]}")
except Exception as e:
    print(f"Error: {e}")

conn.close()

print("\n=== Recommendations ===")
if len(folders) == 0:
    print("1. No folders are being watched")
    print("2. Add a folder via the API or frontend")
else:
    print(f"1. {len(folders)} folder(s) configured")
    print("2. Restart the backend server if you just added the folder")
    print("3. Make sure the folder path exists and is accessible")
    
if count == 0 and len(folders) > 0:
    print("\n⚠️  File watchers may not be running!")
    print("   Check backend console for errors")
    print("   Restart the backend server")

