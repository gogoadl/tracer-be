@echo off

echo === Tracer API Debug Script ===

REM Check if container is running
echo 1. Checking container status...
docker ps | findstr tracer-app

if %errorlevel% neq 0 (
    echo ERROR: tracer-app container is not running
    echo Starting container...
    call build-single.bat
    timeout /t 10 /nobreak >nul
)

echo.
echo 2. Checking container logs...
docker logs tracer-app --tail 50

echo.
echo 3. Checking processes inside container...
docker exec tracer-app ps aux

echo.
echo 4. Checking nginx status...
docker exec tracer-app nginx -t
docker exec tracer-app curl -s http://localhost:8091/ >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Nginx is responding
) else (
    echo ✗ Nginx is not responding
)

echo.
echo 5. Checking backend status...
docker exec tracer-app curl -s http://localhost:8000/health
if %errorlevel% equ 0 (
    echo ✓ Backend is responding
) else (
    echo ✗ Backend is not responding
)

echo.
echo 6. Checking API proxy...
docker exec tracer-app curl -s http://localhost:8091/health
if %errorlevel% equ 0 (
    echo ✓ API proxy is working
) else (
    echo ✗ API proxy is not working
)

echo.
echo 7. Testing from host...
curl -s http://localhost:8091/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Host can reach the service
) else (
    echo ✗ Host cannot reach the service
)

echo.
echo 8. Checking port binding...
docker port tracer-app

echo.
echo 9. Checking network connectivity...
docker exec tracer-app netstat -tlnp

echo.
echo === Debug Complete ===

pause
