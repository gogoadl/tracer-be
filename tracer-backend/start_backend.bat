@echo off
REM Start Backend Server with Sample Data

echo ========================================
echo  Tracer Backend - Starting Server
echo ========================================
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Setup sample data if ~/.command_log.jsonl doesn't exist
if not exist "%HOME%\.command_log.jsonl" (
    if not exist "%HOME%\.command_history" (
        echo Setting up sample data...
        python setup_sample_data.py
    ) else (
        echo Using existing ~/.command_history
    )
) else (
    echo Using existing ~/.command_log.jsonl
)

REM Navigate to app directory
cd app

echo.
echo Starting FastAPI server on http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

REM Start the server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

