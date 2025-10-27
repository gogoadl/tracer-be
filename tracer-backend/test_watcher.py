#!/usr/bin/env python3
"""Test file watcher manually"""

import sys
sys.path.insert(0, 'app')

from file_watcher import watcher_service
from models import FileChange
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Connect to database
db_path = 'data/logs.db'
engine = create_engine(f'sqlite:///{db_path}')
Session = sessionmaker(bind=engine)

print("=" * 60)
print("FILE WATCHER TEST")
print("=" * 60)

# Check current file changes count
db = Session()
count = db.query(FileChange).count()
print(f"\n📊 Current file changes in DB: {count}")

if count == 0:
    print("\n⚠️  No data in DB yet. Let's check watchers...")
    
    # Check active watchers
    db.close()
    
    print("\n🔍 Starting watcher service...")
    try:
        watcher_service.start_all_active()
        print("✅ Watcher service started")
        
        # Check observers
        print(f"\n📁 Active observers: {len(watcher_service.observers)}")
        for folder_id, observer in watcher_service.observers.items():
            print(f"   - Folder ID {folder_id} is being watched")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

print("\n" + "=" * 60)
print("💡 Next steps:")
print("1. Modify a file in the watched folder")
print("2. Check if events are logged")
print("3. Query database again")
print("=" * 60)

