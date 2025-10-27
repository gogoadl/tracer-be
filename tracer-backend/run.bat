@echo off
REM Activate virtual environment and run server

call venv\Scripts\activate.bat
cd app
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

