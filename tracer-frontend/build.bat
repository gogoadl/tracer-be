@echo off

REM Build script for AI Log Frontend (Windows)

echo Building AI Log Frontend...

REM Install dependencies
echo Installing dependencies...
call npm install

REM Build the project
echo Building project...
call npm run build

REM Check if build was successful
if %ERRORLEVEL% EQU 0 (
    echo Build successful!
    echo Build output in .\dist
) else (
    echo Build failed!
    exit /b 1
)

