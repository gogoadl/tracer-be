#!/bin/bash

echo "=== Quick Fix for Backend Crash ==="

# Stop and remove existing container
echo "Stopping existing container..."
docker stop tracer-app 2>/dev/null || true
docker rm tracer-app 2>/dev/null || true

# Check backend error first
echo "Checking what went wrong..."
if docker exec tracer-app cat /var/log/supervisor/backend.err.log 2>/dev/null; then
    echo "Found error logs above"
else
    echo "No existing container to check"
fi

# Rebuild image
echo "Rebuilding with fixes..."
docker build -t tracer:latest . --no-cache

if [ $? -ne 0 ]; then
    echo "Build failed! Check the build output above."
    exit 1
fi

# Start container
echo "Starting fixed container..."
docker run -d \
  --name tracer-app \
  -p 8091:8091 \
  -v $(pwd)/tracer-backend/data:/app/app/data \
  -e DATABASE_URL=sqlite:///./data/logs.db \
  --restart unless-stopped \
  tracer:latest

# Wait and check
echo "Waiting 10 seconds for startup..."
sleep 10

echo "Checking status..."
docker logs tracer-app --tail 20

echo ""
echo "Testing health check..."
curl -s http://localhost:8091/health && echo " ✓ Success!" || echo " ✗ Failed"

echo ""
echo "If still failing, run: chmod +x check-backend-error.sh && ./check-backend-error.sh"
