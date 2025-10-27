#!/usr/bin/env python3
"""Test DB save and verify immediately"""

import sys
sys.path.insert(0, 'app')

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import FileChange
from datetime import datetime

# Connect to database
db_path = 'data/logs.db'
engine = create_engine(f'sqlite:///{db_path}')
Session = sessionmaker(bind=engine)
db = Session()

print("=" * 60)
print("DB VERIFICATION TEST")
print("=" * 60)

# Check total count
total = db.query(FileChange).count()
print(f"\n📊 Total records in DB: {total}")

if total > 0:
    # Get latest 3 records
    recent = db.query(FileChange).order_by(FileChange.timestamp.desc()).limit(3).all()
    print(f"\n📋 Most recent records:")
    for i, change in enumerate(recent, 1):
        print(f"\n{i}. ID: {change.id}")
        print(f"   File: {change.file_name}")
        print(f"   Event: {change.event_type}")
        print(f"   Time: {change.timestamp}")
        print(f"   Path: {change.file_path}")
        if change.raw_data:
            print(f"   Content size: {len(change.raw_data)} bytes")
        else:
            print(f"   Content: None")
else:
    print("\n⚠️  No records found in database")
    print("\n💡 This means:")
    print("   - Backend might not be running")
    print("   - File events are not being detected")
    print("   - Or save operations are failing silently")

db.close()

print("\n" + "=" * 60)

