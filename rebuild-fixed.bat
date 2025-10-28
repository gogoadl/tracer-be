@echo off

echo === Rebuilding with Syntax Fix ===

REM Stop existing container
docker stop tracer-app 2>nul
docker rm tracer-app 2>nul

REM Clean build
echo Building with syntax fix...
docker build -t tracer:latest . --no-cache

if %errorlevel% neq 0 (
    echo Build failed!
    exit /b 1
)

echo Build successful! Starting container...

REM Start container
docker run -d ^
  --name tracer-app ^
  -p 8091:8091 ^
  -v "%cd%\tracer-backend\data:/app/app/data" ^
  -e DATABASE_URL=sqlite:///./data/logs.db ^
  --restart unless-stopped ^
  tracer:latest

echo Waiting for services to start...
timeout /t 15 /nobreak >nul

echo Checking container status...
docker ps | findstr tracer-app

echo.
echo Checking logs...
docker logs tracer-app --tail 10

echo.
echo Testing health check...
curl -s http://localhost:8091/health >nul 2>&1
if %errorlevel% equ 0 (
    echo  ✓ Success!
) else (
    echo  ✗ Failed
)

echo.
echo Service URLs:
echo - Main app: http://localhost:8091
echo - API docs: http://localhost:8091/docs
echo - Health check: http://localhost:8091/health

pause
