#!/usr/bin/env python3
"""Debug database path and connections"""

import sys
import os
import sqlite3
from pathlib import Path

sys.path.insert(0, 'app')

print("=" * 60)
print("DATABASE PATH DEBUG")
print("=" * 60)

# Check file_watcher.py DB path
print("\n1. file_watcher.py DB Configuration:")
print("   DATABASE_URL from env:", os.getenv("DATABASE_URL", "sqlite:///./data/logs.db"))
print("   Current dir:", os.getcwd())

# Check if data directory exists
data_dir = Path('data')
print(f"\n2. Data directory exists: {data_dir.exists()}")
print(f"   Path: {data_dir.absolute()}")

# Check for logs.db files
db_files = list(Path.cwd().rglob('logs.db'))
print(f"\n3. Found {len(db_files)} logs.db file(s):")
for db_file in db_files:
    print(f"   - {db_file.absolute()}")
    if db_file.exists():
        size = db_file.stat().st_size
        print(f"     Size: {size} bytes")

# Check from app directory
app_data_dir = Path('app/data')
print(f"\n4. App data directory: {app_data_dir.absolute()}")
print(f"   Exists: {app_data_dir.exists()}")

# Try to check all logs.db files for data
print("\n5. Checking all logs.db files:")
for db_file in db_files:
    if db_file.exists():
        try:
            conn = sqlite3.connect(str(db_file))
            cursor = conn.cursor()
            
            # Check for file_changes table
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='file_changes'")
            has_table = cursor.fetchone()
            
            if has_table:
                cursor.execute("SELECT COUNT(*) FROM file_changes")
                count = cursor.fetchone()[0]
                print(f"   {db_file.name}: {count} records")
            else:
                print(f"   {db_file.name}: file_changes table not found")
            
            conn.close()
        except Exception as e:
            print(f"   {db_file.name}: Error - {e}")

print("\n" + "=" * 60)

