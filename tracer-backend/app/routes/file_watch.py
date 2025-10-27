from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import datetime, timedelta
from pathlib import Path
import json

from main import get_db
from models import FileChange, WatchFolder

router = APIRouter()


@router.post("/folders/add")
async def add_watch_folder(
    path: str,
    file_patterns: Optional[str] = None,
    recursive: bool = True,
    db: Session = Depends(get_db)
):
    """
    Add a folder to watch for file changes
    """
    watch_path = Path(path)
    
    if not watch_path.exists():
        raise HTTPException(status_code=404, detail="Path does not exist")
    
    if not watch_path.is_dir():
        raise HTTPException(status_code=400, detail="Path must be a directory")
    
    # Check if already watching
    existing = db.query(WatchFolder).filter_by(path=str(watch_path.absolute())).first()
    if existing:
        raise HTTPException(status_code=400, detail="Path is already being watched")
    
    watch_folder = WatchFolder(
        path=str(watch_path.absolute()),
        is_active="True",
        file_patterns=file_patterns,
        recursive="True" if recursive else "False"
    )
    
    db.add(watch_folder)
    db.commit()
    db.refresh(watch_folder)
    
    # Start watching the folder immediately
    try:
        from file_watcher import watcher_service
        # Check if already watching before starting
        if watch_folder.id not in watcher_service.observers:
            watcher_service.start_watching(watch_folder)
            print(f"Started watching folder: {watch_folder.path}")
        else:
            print(f"Already watching folder: {watch_folder.path}")
    except Exception as e:
        print(f"Error starting watcher for {watch_folder.path}: {e}")
    
    return {
        "message": "Folder added to watch list",
        "folder": {
            "id": watch_folder.id,
            "path": watch_folder.path,
            "is_active": watch_folder.is_active
        }
    }


@router.get("/folders")
async def get_watch_folders(
    db: Session = Depends(get_db)
):
    """
    Get all watched folders
    """
    folders = db.query(WatchFolder).all()
    
    return {
        "total": len(folders),
        "folders": [
            {
                "id": f.id,
                "path": f.path,
                "is_active": f.is_active,
                "file_patterns": f.file_patterns,
                "recursive": f.recursive,
                "created_at": f.created_at.isoformat() if f.created_at else None
            }
            for f in folders
        ]
    }


@router.delete("/folders/{folder_id}")
async def remove_watch_folder(
    folder_id: int,
    db: Session = Depends(get_db)
):
    """
    Remove a folder from watch list
    """
    folder = db.query(WatchFolder).filter_by(id=folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    # Stop watching before removing
    try:
        from file_watcher import watcher_service
        watcher_service.stop_watching(folder_id)
        print(f"Stopped watching folder: {folder.path}")
    except Exception as e:
        print(f"Error stopping watcher for {folder.path}: {e}")
    
    db.delete(folder)
    db.commit()
    
    return {"message": "Folder removed from watch list"}


@router.post("/folders/{folder_id}/toggle")
async def toggle_watch_folder(
    folder_id: int,
    db: Session = Depends(get_db)
):
    """
    Toggle watch folder active status
    """
    folder = db.query(WatchFolder).filter_by(id=folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    folder.is_active = "False" if folder.is_active == "True" else "True"
    db.commit()
    
    # Start or stop watching based on status
    try:
        from file_watcher import watcher_service
        
        if folder.is_active == "True":
            # Restart watching
            watcher_service.restart_folder(folder_id)
            print(f"Started watching folder: {folder.path}")
        else:
            # Stop watching
            watcher_service.stop_watching(folder_id)
            print(f"Stopped watching folder: {folder.path}")
    except Exception as e:
        print(f"Error toggling watcher for {folder.path}: {e}")
    
    return {
        "message": "Folder status updated",
        "is_active": folder.is_active
    }


@router.get("/changes")
async def get_file_changes(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    file_extension: Optional[str] = Query(None, description="Filter by file extension"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Get file changes with optional filters
    """
    query = db.query(FileChange)
    
    # Date filter
    if start_date:
        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(FileChange.timestamp >= start_dt)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format")
    
    if end_date:
        try:
            end_dt = datetime.strptime(end_date, "%Y-%m-%d")
            query = query.filter(FileChange.timestamp < end_dt + datetime.timedelta(days=1))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format")
    
    # Event type filter
    if event_type:
        query = query.filter(FileChange.event_type == event_type)
    
    # File extension filter
    if file_extension:
        query = query.filter(FileChange.file_extension == file_extension)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    changes = query.order_by(FileChange.timestamp.desc()).offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "changes": changes
    }


@router.get("/changes/by-date")
async def get_changes_by_date(
    db: Session = Depends(get_db)
):
    """
    Get file changes grouped by date
    """
    results = db.query(
        FileChange.date,
        func.count(FileChange.id).label('count')
    ).group_by(FileChange.date).order_by(FileChange.date.desc()).all()
    
    return {
        "changes_by_date": [
            {"date": date, "count": count}
            for date, count in results
        ]
    }


@router.get("/changes/stats")
async def get_file_change_stats(
    db: Session = Depends(get_db)
):
    """
    Get statistics about file changes
    """
    total_changes = db.query(func.count(FileChange.id)).scalar()
    
    # Get date range
    first_change = db.query(FileChange).order_by(FileChange.timestamp.asc()).first()
    last_change = db.query(FileChange).order_by(FileChange.timestamp.desc()).first()
    
    # Get event type counts
    event_counts = db.query(
        FileChange.event_type,
        func.count(FileChange.id).label('count')
    ).group_by(FileChange.event_type).all()
    
    # Get most common file extensions
    top_extensions = db.query(
        FileChange.file_extension,
        func.count(FileChange.id).label('count')
    ).filter(FileChange.file_extension.isnot(None)).group_by(
        FileChange.file_extension
    ).order_by(func.count(FileChange.id).desc()).limit(10).all()
    
    # Get most active directories
    top_directories = db.query(
        FileChange.directory,
        func.count(FileChange.id).label('count')
    ).group_by(FileChange.directory).order_by(
        func.count(FileChange.id).desc()
    ).limit(10).all()
    
    return {
        "total_changes": total_changes,
        "date_range": {
            "first_change": first_change.timestamp.isoformat() if first_change else None,
            "last_change": last_change.timestamp.isoformat() if last_change else None
        },
        "event_types": {
            event_type: count for event_type, count in event_counts
        },
        "top_extensions": [
            {"extension": ext, "count": count}
            for ext, count in top_extensions
        ],
        "top_directories": [
            {"directory": dir_path, "count": count}
            for dir_path, count in top_directories
        ]
    }


@router.get("/changes/date/{date}")
async def get_changes_for_date(
    date: str,
    db: Session = Depends(get_db)
):
    """
    Get all file changes for a specific date (YYYY-MM-DD)
    """
    try:
        date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        start_dt = datetime.combine(date_obj, datetime.min.time())
        end_dt = datetime.combine(date_obj, datetime.max.time())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    changes = db.query(FileChange).filter(
        and_(
            FileChange.timestamp >= start_dt,
            FileChange.timestamp < end_dt
        )
    ).order_by(FileChange.timestamp.asc()).all()
    
    return {
        "date": date,
        "count": len(changes),
        "changes": changes
    }

