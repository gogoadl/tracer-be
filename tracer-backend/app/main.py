from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from pathlib import Path
import os

from models import Base, CommandLog, parse_command_line

# Database setup
# Use absolute path for database to work from any directory
_db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "logs.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{_db_path}")
# For SQLite, we need to ensure the path exists
if DATABASE_URL.startswith("sqlite"):
    db_path = DATABASE_URL.replace("sqlite:///", "")
    os.makedirs(os.path.dirname(db_path), exist_ok=True)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI(
    title="Tracer Backend",
    description="Backend for tracking and analyzing shell command logs and file changes",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.on_event("startup")
async def startup_event():
    """Initialize database and load logs on startup"""
    print("Starting Tracer Backend...")
    
    # Load logs from ~/.command_history
    command_history_path = Path.home() / ".command_history"
    
    if command_history_path.exists():
        print(f"Loading logs from {command_history_path}")
        db = SessionLocal()
        try:
            load_logs_from_file(db, command_history_path)
            db.commit()
            print(f"Successfully loaded logs from {command_history_path}")
        except Exception as e:
            print(f"Error loading logs: {e}")
            db.rollback()
        finally:
            db.close()
    else:
        print(f"No command history found at {command_history_path}")
    
    # Start file watchers for all active folders
    try:
        from file_watcher import watcher_service
        watcher_service.start_all_active()
        print("File watchers started")
    except Exception as e:
        print(f"Error starting file watchers: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up on shutdown"""
    try:
        from file_watcher import watcher_service
        watcher_service.stop_all()
        print("File watchers stopped")
    except Exception as e:
        print(f"Error stopping file watchers: {e}")


def load_logs_from_file(db, file_path: Path, batch_size: int = 1000):
    """Load logs from file into database"""
    with open(file_path, 'r', encoding='utf-8') as f:
        batch = []
        for line in f:
            parsed = parse_command_line(line)
            if parsed:
                # Check if log already exists to avoid duplicates
                existing = db.query(CommandLog).filter_by(
                    timestamp=parsed["timestamp"],
                    user=parsed["user"],
                    command=parsed["command"]
                ).first()
                
                if not existing:
                    log_entry = CommandLog(**parsed)
                    batch.append(log_entry)
                    
                    # Insert in batches
                    if len(batch) >= batch_size:
                        db.bulk_save_objects(batch)
                        db.commit()
                        batch = []
        
        # Insert remaining items
        if batch:
            db.bulk_save_objects(batch)
            db.commit()


@app.get("/")
async def root():
    return {"message": "Tracer Backend API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


# Import routes
from routes import logs, file_watch
app.include_router(logs.router, prefix="/api", tags=["logs"])
app.include_router(file_watch.router, prefix="/api", tags=["file-watch"])


