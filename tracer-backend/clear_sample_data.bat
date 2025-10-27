@echo off
REM Clear sample data and reset database

echo ========================================
echo  Clear Sample Data and Reset Database
echo ========================================
echo.

REM Delete log files
if exist "%HOME%\.command_log.jsonl" (
    del "%HOME%\.command_log.jsonl"
    echo Deleted ~/.command_log.jsonl
)

if exist "%HOME%\.command_history" (
    del "%HOME%\.command_history"
    echo Deleted ~/.command_history
)

REM Delete database
if exist "data\logs.db" (
    del "data\logs.db"
    echo Deleted data\logs.db
)

REM Delete config
if exist "data\tracer_config.json" (
    del "data\tracer_config.json"
    echo Deleted data\tracer_config.json
)

echo.
echo Sample data and database cleared.
echo Restart the backend to start fresh.
echo.

