from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import datetime, date, timedelta

from main import get_db
from models import CommandLog

router = APIRouter()


@router.get("/logs")
async def get_logs(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    user: Optional[str] = Query(None, description="Filter by user"),
    search: Optional[str] = Query(None, description="Search in commands"),
    directory: Optional[str] = Query(None, description="Filter by directory"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Get command logs with optional filters
    """
    query = db.query(CommandLog)
    
    # Date filter
    if start_date:
        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(CommandLog.timestamp >= start_dt)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_date format. Use YYYY-MM-DD")
    
    if end_date:
        try:
            end_dt = datetime.strptime(end_date, "%Y-%m-%d")
            query = query.filter(CommandLog.timestamp < end_dt + timedelta(days=1))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_date format. Use YYYY-MM-DD")
    
    # User filter
    if user:
        query = query.filter(CommandLog.user == user)
    
    # Directory filter
    if directory:
        query = query.filter(CommandLog.directory.contains(directory))
    
    # Search filter
    if search:
        query = query.filter(CommandLog.command.contains(search))
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    logs = query.order_by(CommandLog.timestamp.desc()).offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "logs": logs
    }


@router.get("/logs/by-date")
async def get_logs_by_date(
    db: Session = Depends(get_db)
):
    """
    Get logs grouped by date
    """
    results = db.query(
        CommandLog.date,
        func.count(CommandLog.id).label('count')
    ).group_by(CommandLog.date).order_by(CommandLog.date.desc()).all()
    
    return {
        "logs_by_date": [
            {"date": date, "count": count}
            for date, count in results
        ]
    }


@router.get("/logs/stats")
async def get_log_stats(
    db: Session = Depends(get_db)
):
    """
    Get statistics about command logs
    """
    total_logs = db.query(func.count(CommandLog.id)).scalar()
    
    # Get date range
    first_log = db.query(CommandLog).order_by(CommandLog.timestamp.asc()).first()
    last_log = db.query(CommandLog).order_by(CommandLog.timestamp.desc()).first()
    
    # Get unique users
    unique_users = db.query(func.count(func.distinct(CommandLog.user))).scalar()
    
    # Get most active user
    most_active_user = db.query(
        CommandLog.user,
        func.count(CommandLog.id).label('count')
    ).group_by(CommandLog.user).order_by(func.count(CommandLog.id).desc()).first()
    
    # Get most common commands
    top_commands = db.query(
        CommandLog.command,
        func.count(CommandLog.id).label('count')
    ).group_by(CommandLog.command).order_by(func.count(CommandLog.id).desc()).limit(10).all()
    
    return {
        "total_logs": total_logs,
        "date_range": {
            "first_log": first_log.timestamp.isoformat() if first_log else None,
            "last_log": last_log.timestamp.isoformat() if last_log else None
        },
        "unique_users": unique_users,
        "most_active_user": {
            "user": most_active_user[0] if most_active_user else None,
            "count": most_active_user[1] if most_active_user else 0
        },
        "top_commands": [
            {"command": cmd[:50], "count": count}  # Truncate long commands
            for cmd, count in top_commands
        ]
    }


@router.get("/logs/filter-options")
async def get_filter_options(
    db: Session = Depends(get_db)
):
    """
    Get available filter options (users, directories)
    """
    # Get unique users
    users = db.query(func.distinct(CommandLog.user)).order_by(CommandLog.user).all()
    users_list = [user[0] for user in users if user[0]]
    
    # Get unique directories
    directories = db.query(func.distinct(CommandLog.directory)).order_by(CommandLog.directory).all()
    directories_list = [dir[0] for dir in directories if dir[0]]
    
    return {
        "users": users_list,
        "directories": directories_list
    }


@router.get("/logs/date/{date}")
async def get_logs_for_date(
    date: str,
    db: Session = Depends(get_db)
):
    """
    Get all logs for a specific date (YYYY-MM-DD)
    """
    try:
        date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        start_dt = datetime.combine(date_obj, datetime.min.time())
        end_dt = datetime.combine(date_obj, datetime.max.time())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    logs = db.query(CommandLog).filter(
        and_(
            CommandLog.timestamp >= start_dt,
            CommandLog.timestamp < datetime.combine(date_obj, datetime.max.time()) + timedelta(days=1)
        )
    ).order_by(CommandLog.timestamp.asc()).all()
    
    return {
        "date": date,
        "count": len(logs),
        "logs": logs
    }


@router.post("/logs/refresh")
async def refresh_logs(
    db: Session = Depends(get_db)
):
    """
    Manually refresh logs from ~/.command_history
    """
    from pathlib import Path
    
    command_history_path = Path.home() / ".command_history"
    
    if not command_history_path.exists():
        raise HTTPException(status_code=404, detail="Command history file not found")
    
    try:
        from main import load_logs_from_file
        load_logs_from_file(db, command_history_path)
        db.commit()
        return {
            "message": "Logs refreshed successfully",
            "source": str(command_history_path)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error refreshing logs: {str(e)}")

