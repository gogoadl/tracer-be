@echo off

echo === Backend Error Analysis ===

echo 1. Checking backend error logs...
docker exec tracer-app cat /var/log/supervisor/backend.err.log

echo.
echo 2. Checking backend output logs...
docker exec tracer-app cat /var/log/supervisor/backend.out.log

echo.
echo 3. Checking if backend files exist...
docker exec tracer-app ls -la /app/app/

echo.
echo 4. Checking Python environment...
docker exec tracer-app python --version
docker exec tracer-app pip list | findstr "uvicorn fastapi sqlalchemy"

echo.
echo 5. Testing manual backend start...
docker exec tracer-app bash -c "cd /app/app && python -c 'import main; print(\"Import successful\")'"

echo.
echo 6. Checking database file...
docker exec tracer-app ls -la /app/app/data/

echo.
echo 7. Testing uvicorn directly...
start /b docker exec tracer-app bash -c "cd /app/app && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --log-level debug"
timeout /t 5 /nobreak >nul
docker exec tracer-app curl -s http://127.0.0.1:8000/health || echo Direct uvicorn test failed

pause
