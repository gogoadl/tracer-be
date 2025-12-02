@echo off

REM Build and run single Docker image for Tracer

echo Building Tracer single image...
docker build -t tracer:latest .

echo Running Tracer container...
docker run -d ^
  --name tracer-app ^
  -p 8091:8091 ^
  -v "%cd%\tracer-backend\data:/app/data" ^
  -v "%USERPROFILE%\.command_log.jsonl:/app/data/.command_log.jsonl:ro" ^
  -e DATABASE_URL=jdbc:sqlite:./data/logs.db ^
  -e SPRING_DATASOURCE_URL=jdbc:sqlite:./data/logs.db ^
  -e COMMAND_HISTORY_PATH=/app/data/.command_log.jsonl ^
  --restart unless-stopped ^
  tracer:latest

echo Tracer is running at http://localhost:8091
echo Health check: http://localhost:8091/health
echo API: http://localhost:8091/api

echo.
echo To view logs:
echo   docker logs tracer-app
echo.
echo To stop:
echo   docker stop tracer-app
echo   docker rm tracer-app

pause
