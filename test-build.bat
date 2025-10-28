@echo off

echo === Testing Docker Build Process ===

REM Check if Docker is available
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not installed or not in PATH
    exit /b 1
)

REM Check if required directories exist
echo Checking project structure...
if not exist "tracer-frontend" (
    echo ERROR: tracer-frontend directory not found
    exit /b 1
)

if not exist "tracer-backend" (
    echo ERROR: tracer-backend directory not found
    exit /b 1
)

if not exist "tracer-frontend\package.json" (
    echo ERROR: tracer-frontend\package.json not found
    exit /b 1
)

if not exist "tracer-backend\requirements.txt" (
    echo ERROR: tracer-backend\requirements.txt not found
    exit /b 1
)

echo Project structure OK

REM Build the image
echo Building Docker image...
docker build -t tracer-test . --no-cache

if %errorlevel% equ 0 (
    echo Build successful!
    
    REM Test the built image
    echo Testing built image contents...
    docker run --rm tracer-test ls -la /usr/share/nginx/html/
    
    echo Testing nginx configuration...
    docker run --rm tracer-test nginx -t
    
    echo Testing backend files...
    docker run --rm tracer-test ls -la /app/app/
    
) else (
    echo Build failed!
    exit /b 1
)

pause
