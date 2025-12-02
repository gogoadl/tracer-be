@echo off

REM Run Tracer application using Docker Compose

echo === Starting Tracer Application ===

REM Stop and remove existing container
echo Stopping existing containers...
docker compose -f docker-compose.single.yml down

echo Starting Tracer with Docker Compose...
docker compose -f docker-compose.single.yml up -d

echo Waiting for services to start...
timeout /t 15 /nobreak >nul

echo Checking container status...
docker compose -f docker-compose.single.yml ps

echo.
echo Recent logs:
docker compose -f docker-compose.single.yml logs --tail 10

echo.
echo Service URLs:
echo   Main app: http://localhost:8091
echo   Health check: http://localhost:8091/health
echo   API: http://localhost:8091/api

echo.
echo Management commands:
echo   View logs: docker compose -f docker-compose.single.yml logs -f
echo   View backend logs: docker exec tracer-app tail -f /var/log/supervisor/backend.out.log
echo   Debug: docker exec -it tracer-app bash
echo   Stop: docker compose -f docker-compose.single.yml down
echo   Restart: docker compose -f docker-compose.single.yml restart

echo.
echo Available paths for file watching:
echo   /host/current - Current project directory
echo   /host/home - Your home directory
echo   /host/root/path/to/folder - Any system path

echo.
echo Command Logger Setup:
echo   To install command logging on host system:
echo   docker exec -it tracer-app install-command-logger.sh

pause
