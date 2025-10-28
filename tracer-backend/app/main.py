from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from pathlib import Path
import os
import json

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


def get_config_file_path():
    """Get the path to the configuration file"""
    return Path(__file__).parent.parent / "data" / "tracer_config.json"


def load_config():
    """Load configuration from file"""
    config_file = get_config_file_path()
    config_file.parent.mkdir(exist_ok=True)
    
    default_config = {
        "command_history_path": str(Path.home() / ".command_log.jsonl")
    }
    
    if config_file.exists():
        try:
            with open(config_file, 'r') as f:
                saved_config = json.load(f)
                # Merge with defaults
                default_config.update(saved_config)
        except Exception as e:
            print(f"Error loading config: {e}")
    
    return default_config


def save_config(config):
    """Save configuration to file"""
    config_file = get_config_file_path()
    config_file.parent.mkdir(exist_ok=True)
    
    try:
        with open(config_file, 'w') as f:
            json.dump(config, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving config: {e}")
        return False


def get_command_history_path():
    """Get the command history file path based on environment and config"""
    # Use environment variable if set
    if os.getenv("COMMAND_HISTORY_PATH"):
        return Path(os.getenv("COMMAND_HISTORY_PATH"))
    
    # Try loading from config
    try:
        config = load_config()
        if config.get("command_history_path"):
            return Path(config["command_history_path"])
    except Exception as e:
        print(f"Error loading config: {e}")
    
    # Default to ~/.command_log.jsonl (Linux/Mac) or Windows home
    return Path.home() / ".command_log.jsonl"


@app.on_event("startup")
async def startup_event():
    """Initialize database and load logs on startup"""
    print("Starting Tracer Backend...")
    
    # Load logs from command history file
    command_history_path = get_command_history_path()
    
    print(f"Looking for command history at: {command_history_path}")
    
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
        print("To set up command logging on Linux, run: cd tracer-backend && ./install_logger.sh")
    
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
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            batch = []
            for line_num, line in enumerate(f, 1):
                try:
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
                except Exception as e:
                    print(f"Error parsing line {line_num}: {e}")
                    continue
            
            # Insert remaining items
            if batch:
                db.bulk_save_objects(batch)
                db.commit()
    except FileNotFoundError:
        print(f"Log file not found: {file_path}")
    except Exception as e:
        print(f"Error loading logs from {file_path}: {e}")
        raise


@app.get("/")
async def root():
    return {"message": "Tracer Backend API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/config")
@app.get("/api/config")
async def get_config():
    """Get current configuration"""
    config = load_config()
    current_path = get_command_history_path()
    return {
        "command_history_path": str(current_path),
        "command_history_exists": current_path.exists(),
        "config": config
    }


@app.post("/config")
@app.post("/api/config")
async def update_config(config_data: dict):
    """Update configuration"""
    current_config = load_config()
    
    # Update with new data
    if "command_history_path" in config_data:
        current_config["command_history_path"] = config_data["command_history_path"]
    
    # Save to file
    if save_config(current_config):
        return {
            "message": "Configuration updated successfully",
            "config": current_config,
            "note": "Please restart the backend for changes to take effect"
        }
    else:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="Failed to save configuration")


@app.post("/reload-logs")
@app.post("/api/reload-logs")
async def reload_logs():
    """Reload logs from the configured path"""
    db = SessionLocal()
    try:
        # Reload config to get latest path
        config = load_config()
        command_history_path = get_command_history_path()
        
        print(f"Reloading logs from: {command_history_path}")
        
        if not command_history_path.exists():
            from fastapi import HTTPException
            raise HTTPException(
                status_code=404,
                detail=f"Command history file not found at {command_history_path}"
            )
        
        # Clear existing logs or just append new ones
        # Option 1: Delete all and reload (uncomment if needed)
        # db.query(CommandLog).delete()
        # db.commit()
        
        # Load logs from file
        load_logs_from_file(db, command_history_path)
        db.commit()
        
        print(f"Successfully reloaded logs from {command_history_path}")
        
        return {
            "message": "Logs reloaded successfully",
            "source": str(command_history_path),
            "path": str(command_history_path),
            "config": config
        }
    except Exception as e:
        print(f"Error reloading logs: {e}")
        db.rollback()
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Error reloading logs: {str(e)}")
    finally:
        db.close()


# Import routes
from routes import logs, file_watch
app.include_router(logs.router, prefix="/api", tags=["logs"])
app.include_router(file_watch.router, prefix="/api", tags=["file-watch"])


