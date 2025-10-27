# AI Log Backend

A FastAPI backend service for collecting and analyzing shell command logs from `~/.command_history`.

## Features

- Collects shell command logs from `~/.command_history`
- Parses and stores logs in SQLite database
- Group logs by date
- Search and filter logs
- RESTful API endpoints for accessing logs

## File Format

The service expects logs in the following format:
```
2025-10-27 09:15:22 [user] ~/project: ls -la
2025-10-27 09:16:30 [user] ~/project: cd src
```

Where:
- Date: `YYYY-MM-DD`
- Time: `HH:MM:SS`
- User: Enclosed in brackets
- Directory: Path before the colon
- Command: Everything after the colon

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:

**On Linux/Mac:**
```bash
source venv/bin/activate
```

**On Windows:**
```bash
.\venv\Scripts\Activate.ps1
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the application:
```bash
cd app
uvicorn main:app --reload
```

## Quick Start

**Windows:**
```bash
# Run the batch script
.\run.bat
```

**Linux/Mac:**
```bash
# Make script executable
chmod +x run.sh

# Run the shell script
./run.sh
```

Or manually:
```bash
# Activate virtual environment
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\Activate.ps1  # Windows

# Navigate to app directory and run server
cd app
uvicorn main:app --reload
```

## Docker

Build and run with Docker:
```bash
docker build -t ai-log-backend .
docker run -p 8000:8000 ai-log-backend
```

## API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `GET /api/logs` - Get logs with filters
- `GET /api/logs/by-date` - Get logs grouped by date
- `GET /api/logs/stats` - Get statistics
- `GET /api/logs/date/{date}` - Get logs for specific date
- `POST /api/logs/refresh` - Refresh logs from file

## Query Parameters

### GET /api/logs

- `start_date`: Filter logs from this date (YYYY-MM-DD)
- `end_date`: Filter logs until this date (YYYY-MM-DD)
- `user`: Filter by username
- `search`: Search term in commands
- `limit`: Maximum number of results (default: 100, max: 1000)
- `offset`: Pagination offset (default: 0)

## Example Usage

```bash
# Get all logs
curl http://localhost:8000/api/logs

# Get logs for a date range
curl "http://localhost:8000/api/logs?start_date=2025-10-20&end_date=2025-10-27"

# Search commands
curl "http://localhost:8000/api/logs?search=git"

# Get logs grouped by date
curl http://localhost:8000/api/logs/by-date

# Get statistics
curl http://localhost:8000/api/logs/stats

# Get logs for specific date
curl http://localhost:8000/api/logs/date/2025-10-27
```


