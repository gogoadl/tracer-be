@echo off

echo === Quick Fix for Backend Crash ===

REM Stop and remove existing container
echo Stopping existing container...
docker stop tracer-app 2>nul
docker rm tracer-app 2>nul

REM Check backend error first
echo Checking what went wrong...
docker exec tracer-app cat /var/log/supervisor/backend.err.log 2>nul
if %errorlevel% equ 0 (
    echo Found error logs above
) else (
    echo No existing container to check
)

REM Rebuild image
echo Rebuilding with fixes...
docker build -t tracer:latest . --no-cache

if %errorlevel% neq 0 (
    echo Build failed! Check the build output above.
    exit /b 1
)

REM Start container
echo Starting fixed container...
docker run -d ^
  --name tracer-app ^
  -p 8091:8091 ^
  -v "%cd%\tracer-backend\data:/app/app/data" ^
  -e DATABASE_URL=sqlite:///./data/logs.db ^
  --restart unless-stopped ^
  tracer:latest

REM Wait and check
echo Waiting 10 seconds for startup...
timeout /t 10 /nobreak >nul

echo Checking status...
docker logs tracer-app --tail 20

echo.
echo Testing health check...
curl -s http://localhost:8091/health >nul 2>&1
if %errorlevel% equ 0 (
    echo  ✓ Success!
) else (
    echo  ✗ Failed
)

echo.
echo If still failing, run: check-backend-error.bat

pause
