"""
File watcher service using watchdog
"""
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from pathlib import Path
import os
import threading
import json

from models import FileChange, WatchFolder

# Database session for file watcher
# Use absolute path to match main.py
_db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "logs.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{_db_path}")
if DATABASE_URL.startswith("sqlite"):
    db_path = DATABASE_URL.replace("sqlite:///", "")
    os.makedirs(os.path.dirname(db_path), exist_ok=True)

print(f"🔗 [FILE_WATCHER] Using database: {db_path}")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Ensure tables exist
from models import Base
Base.metadata.create_all(bind=engine)


class FileChangeHandler(FileSystemEventHandler):
    """Handler for file system events"""
    
    def __init__(self, folder_path: str, file_patterns: str = None):
        self.folder_path = folder_path
        self.file_patterns = file_patterns.split(",") if file_patterns else None
        super().__init__()
    
    def should_process(self, src_path):
        """Check if file matches patterns"""
        # No patterns = watch all files
        if not self.file_patterns:
            return True
        
        file_ext = Path(src_path).suffix
        file_name = Path(src_path).name
        
        for pattern in self.file_patterns:
            pattern = pattern.strip()
            if pattern.startswith("*."):
                ext = pattern[1:]  # Remove *
                if file_ext == ext:
                    print(f"✓ [FILTER] Match: {file_name} matches pattern {pattern}")
                    return True
            elif pattern in src_path:
                print(f"✓ [FILTER] Match: {file_name} contains {pattern}")
                return True
            elif pattern in file_name:
                print(f"✓ [FILTER] Match: {file_name} matches {pattern}")
                return True
        
        print(f"✗ [FILTER] No match: {file_name} does not match any pattern")
        return False
    
    def create_log(self, event_type: str, src_path: str, is_directory: bool = False, dest_path: str = None):
        """Create a file change log entry"""
        try:
            print(f"🔍 [DB_LOG] Creating log for {event_type}: {src_path}")
            db = SessionLocal()
            
            timestamp = datetime.now()
            date_str = timestamp.strftime("%Y-%m-%d")
            
            file_path = Path(src_path)
            dir_path = str(file_path.parent)
            file_name = file_path.name
            file_ext = file_path.suffix
            
            # Get file size and content if it's a file
            size = None
            content_before = None
            content_after = None
            
            if file_path.exists() and file_path.is_file():
                try:
                    size = file_path.stat().st_size
                    # Only read content for modified files
                    if event_type == 'modified' and size < 1024 * 1024:  # Max 1MB
                        try:
                            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                                content_after = f.read()
                        except:
                            pass
                except:
                    pass
            
            # Get previous version for modified files
            if event_type == 'modified':
                try:
                    # Get last version of this file from raw_data
                    last_change = db.query(FileChange).filter_by(
                        file_path=str(file_path)
                    ).filter(
                        FileChange.id < db.query(FileChange).count()
                    ).order_by(FileChange.timestamp.desc()).first()
                    
                    if last_change and last_change.raw_data:
                        try:
                            last_data = json.loads(last_change.raw_data)
                            if last_data.get("content_after"):
                                content_before = last_data.get("content_after")
                        except:
                            pass
                except:
                    pass
            
            # Store content in raw_data as JSON
            content_data = None
            if content_before or content_after:
                try:
                    content_data = json.dumps({
                        "content_before": content_before,
                        "content_after": content_after
                    })
                except Exception as e:
                    print(f"⚠️  [DB_LOG] Failed to JSON encode content: {e}")
                    content_data = None
            
            file_change = FileChange(
                timestamp=timestamp,
                date=date_str,
                event_type=event_type,
                file_path=str(file_path),
                directory=dir_path,
                file_name=file_name,
                file_extension=file_ext,
                size=size,
                is_directory="True" if is_directory else "False",
                src_path=str(dest_path) if dest_path else None,
                raw_data=content_data
            )
            
            db.add(file_change)
            db.commit()
            
            # Verify the save by querying the database
            saved_change = db.query(FileChange).filter_by(
                file_path=str(file_path),
                event_type=event_type,
                timestamp=timestamp
            ).order_by(FileChange.id.desc()).first()
            
            if saved_change:
                print(f"✅ [DB_LOG] Successfully saved file change: {file_name} ({event_type})")
                print(f"   📝 Change ID: {saved_change.id}")
                print(f"   📅 Timestamp: {timestamp}")
                print(f"   📁 File: {file_name}")
                print(f"   💾 DB Verified: Found record with ID {saved_change.id}")
            else:
                print(f"⚠️  [DB_LOG] Saved but couldn't verify: {file_name} ({event_type})")
            
            db.close()
            
        except Exception as e:
            print(f"❌ [DB_LOG] Error logging file change: {e}")
            if 'db' in locals():
                db.rollback()
                db.close()
            import traceback
            traceback.print_exc()
    
    def on_created(self, event):
        if not event.is_directory and self.should_process(event.src_path):
            print(f"📄 [FILE_EVENT] File created: {event.src_path}")
            self.create_log("created", event.src_path, event.is_directory)
        elif event.is_directory:
            print(f"📁 [FILE_EVENT] Directory created: {event.src_path} (ignored)")
    
    def on_deleted(self, event):
        if not event.is_directory and self.should_process(event.src_path):
            print(f"🗑️  [FILE_EVENT] File deleted: {event.src_path}")
            self.create_log("deleted", event.src_path, event.is_directory)
        elif event.is_directory:
            print(f"📁 [FILE_EVENT] Directory deleted: {event.src_path} (ignored)")
    
    def on_modified(self, event):
        # Skip directory modifications
        if not event.is_directory and self.should_process(event.src_path):
            print(f"✏️  [FILE_EVENT] File modified: {event.src_path}")
            self.create_log("modified", event.src_path, event.is_directory)
        elif event.is_directory:
            print(f"📁 [FILE_EVENT] Directory modified: {event.src_path} (ignored)")
    
    def on_moved(self, event):
        if not event.is_directory:
            if self.should_process(event.src_path):
                print(f"File moved: {event.src_path} -> {event.dest_path}")
                self.create_log("moved", event.src_path, event.is_directory, event.dest_path)


class FileWatcherService:
    """Service to manage file watchers"""
    
    def __init__(self):
        self.observers = {}
        self.db_session = SessionLocal()
    
    def start_watching(self, watch_folder: WatchFolder):
        """Start watching a folder"""
        # Check if already watching this folder
        if watch_folder.id in self.observers:
            print(f"⚠️  [WATCHER] Already watching folder {watch_folder.id}, skipping...")
            return
        
        folder_path = watch_folder.path
        
        print(f"🔍 [WATCHER] Starting to watch folder: {folder_path}")
        print(f"   - Recursive: {watch_folder.recursive == 'True'}")
        print(f"   - File patterns: {watch_folder.file_patterns}")
        
        handler = FileChangeHandler(
            folder_path,
            file_patterns=watch_folder.file_patterns
        )
        
        observer = Observer()
        observer.schedule(
            handler,
            folder_path,
            recursive=(watch_folder.recursive == "True")
        )
        
        observer.start()
        self.observers[watch_folder.id] = observer
        
        print(f"✅ [WATCHER] Successfully started watching: {folder_path}")
        print(f"   - Observer ID: {watch_folder.id}")
        print(f"   - Active observers: {len(self.observers)}")
    
    def stop_watching(self, folder_id: int):
        """Stop watching a folder"""
        if folder_id in self.observers:
            self.observers[folder_id].stop()
            self.observers[folder_id].join()
            del self.observers[folder_id]
            print(f"Stopped watching folder {folder_id}")
    
    def start_all_active(self):
        """Start watching all active folders"""
        print(f"\n🔍 [WATCHER] Starting all active folders...")
        active_folders = self.db_session.query(WatchFolder).filter_by(is_active="True").all()
        print(f"   Found {len(active_folders)} active folder(s)")
        
        for folder in active_folders:
            try:
                self.start_watching(folder)
            except Exception as e:
                print(f"❌ [WATCHER] Error starting watcher for {folder.path}: {e}")
                import traceback
                traceback.print_exc()
        
        print(f"✅ [WATCHER] Total active observers: {len(self.observers)}\n")
    
    def stop_all(self):
        """Stop all watchers"""
        for folder_id in list(self.observers.keys()):
            self.stop_watching(folder_id)
    
    def restart_folder(self, folder_id: int):
        """Restart watching a folder"""
        # Stop if already watching
        if folder_id in self.observers:
            self.stop_watching(folder_id)
        
        # Start fresh
        folder = self.db_session.query(WatchFolder).filter_by(id=folder_id).first()
        if folder and folder.is_active == "True":
            try:
                self.start_watching(folder)
            except Exception as e:
                print(f"Error restarting watcher for folder {folder_id}: {e}")


# Global instance
watcher_service = FileWatcherService()

