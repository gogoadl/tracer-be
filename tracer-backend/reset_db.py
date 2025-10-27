"""
Reset database - recreate tables
"""
import sqlite3
from pathlib import Path
import os

DB_PATH = Path("data/logs.db")

print("=== Database Reset ===\n")

if DB_PATH.exists():
    print(f"⚠️  Existing database found: {DB_PATH}")
    print(f"Size: {DB_PATH.stat().st_size} bytes")
    
    # Backup
    backup_path = Path("data/logs.db.backup")
    if backup_path.exists():
        backup_path.unlink()
    
    import shutil
    shutil.copy2(DB_PATH, backup_path)
    print(f"✅ Backup created: {backup_path}")
    
    # Keep watch_folders data
    print("\n📋 Preserving watch folders...")
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM watch_folders")
        folders = cursor.fetchall()
        print(f"Found {len(folders)} folder(s) to preserve")
        for folder in folders:
            print(f"  - {folder[1]}")
    except:
        folders = []
    
    conn.close()
    
    # Remove old database
    DB_PATH.unlink()
    print("✅ Old database removed")
    
    # Create new database
    conn = sqlite3.connect(str(DB_PATH))
    conn.close()
    print("✅ New database created")
    
    print("\n⚠️  Now restart your backend server")
    print("   The server will create the tables automatically")
    
    if folders:
        print("\n📝 You will need to re-add these folders after restart:")
        for folder in folders:
            print(f"   {folder[1]}")
else:
    print(f"Database not found at {DB_PATH}")
    print("Tables will be created when you start the server")

