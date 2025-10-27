from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import re
from enum import Enum

Base = declarative_base()


class FileChangeType(str, Enum):
    """Types of file system events"""
    CREATED = "created"
    DELETED = "deleted"
    MODIFIED = "modified"
    MOVED = "moved"


class CommandLog(Base):
    __tablename__ = "command_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    date = Column(String, nullable=False, index=True)
    time = Column(String, nullable=False)
    user = Column(String, nullable=False)
    directory = Column(String, nullable=False)
    command = Column(Text, nullable=False)
    raw_line = Column(Text, nullable=False)

    def __repr__(self):
        return f"<CommandLog(id={self.id}, date={self.date}, command='{self.command[:30]}...')>"


class FileChange(Base):
    __tablename__ = "file_changes"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    date = Column(String, nullable=False, index=True)
    event_type = Column(String, nullable=False)  # created, deleted, modified, moved
    file_path = Column(String, nullable=False)
    directory = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    file_extension = Column(String)
    size = Column(Integer)  # File size in bytes
    is_directory = Column(String, default="False")  # 'True' or 'False' as string
    src_path = Column(String)  # For moved events
    raw_data = Column(Text)  # Store file content as JSON: {"content_before": "...", "content_after": "..."}

    def __repr__(self):
        return f"<FileChange(id={self.id}, event={self.event_type}, file='{self.file_name}')>"


class WatchFolder(Base):
    __tablename__ = "watch_folders"

    id = Column(Integer, primary_key=True, index=True)
    path = Column(String, nullable=False, unique=True)
    is_active = Column(String, default="True")  # 'True' or 'False'
    created_at = Column(DateTime, default=datetime.now)
    last_checked = Column(DateTime)
    file_patterns = Column(Text)  # Comma-separated file patterns (e.g., "*.yml,*.conf")
    recursive = Column(String, default="True")  # 'True' or 'False'

    def __repr__(self):
        return f"<WatchFolder(id={self.id}, path='{self.path}', active={self.is_active})>"


def parse_command_line(line: str) -> dict:
    """
    Parse a line from ~/.command_history
    
    Format: 2025-10-27 09:15:22 [user] ~/project: ls
    """
    # Pattern to match: date time [user] directory: command
    pattern = r'(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+\[([^\]]+)\]\s+(.*?):\s+(.+)$'
    
    match = re.match(pattern, line.strip())
    if not match:
        return None
    
    date_str, time_str, user, directory, command = match.groups()
    
    # Parse the full timestamp
    timestamp_str = f"{date_str} {time_str}"
    timestamp = datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")
    
    return {
        "timestamp": timestamp,
        "date": date_str,
        "time": time_str,
        "user": user,
        "directory": directory,
        "command": command,
        "raw_line": line.strip()
    }


