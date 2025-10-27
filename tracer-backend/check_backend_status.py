#!/usr/bin/env python3
"""Check if backend is running and watcher status"""

import sys
sys.path.insert(0, 'app')

try:
    from file_watcher import watcher_service
    
    print("🔍 Checking watcher status...")
    print(f"\n📊 Active observers: {len(watcher_service.observers)}")
    
    if len(watcher_service.observers) > 0:
        print("\n✅ Watchers are running:")
        for folder_id, observer in watcher_service.observers.items():
            print(f"   - Folder ID {folder_id}")
            print(f"     Running: {observer.is_alive() if hasattr(observer, 'is_alive') else 'N/A'}")
    else:
        print("\n⚠️  No active watchers")
        print("    Watchers should be started by the backend on startup")
    
    # Check database
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from models import FileChange
    
    db_path = 'data/logs.db'
    engine = create_engine(f'sqlite:///{db_path}')
    Session = sessionmaker(bind=engine)
    db = Session()
    
    count = db.query(FileChange).count()
    print(f"\n📁 File changes in DB: {count}")
    
    if count == 0:
        print("\n💡 To test:")
        print("   1. Make sure backend is running (uvicorn main:app)")
        print("   2. Modify a file in C:\\Users\\A93220\\Documents\\GitHub\\hyeonwoo\\knowledge")
        print("   3. Check backend console for event logs")
    
    db.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

