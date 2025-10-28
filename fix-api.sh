#!/bin/bash

echo "=== Fixing API Connection Issues ==="

# Stop existing container
echo "Stopping existing container..."
docker stop tracer-app 2>/dev/null || true
docker rm tracer-app 2>/dev/null || true

# Rebuild with no cache
echo "Rebuilding Docker image..."
docker build -t tracer:latest . --no-cache

# Run with additional debugging
echo "Starting container with debugging..."
docker run -d \
  --name tracer-app \
  -p 8091:8091 \
  -v $(pwd)/tracer-backend/data:/app/app/data \
  -v ~/.command_log.jsonl:/app/app/data/.command_log.jsonl:ro \
  -e DATABASE_URL=sqlite:///./data/logs.db \
  -e COMMAND_HISTORY_PATH=/app/app/data/.command_log.jsonl \
  --restart unless-stopped \
  tracer:latest

echo "Waiting for services to start..."
sleep 15

echo "Testing services..."

# Test backend directly
echo "1. Testing backend (port 8000)..."
docker exec tracer-app curl -s http://127.0.0.1:8000/health
if [ $? -eq 0 ]; then
    echo "✓ Backend is responding"
else
    echo "✗ Backend is not responding"
    echo "Backend logs:"
    docker exec tracer-app cat /var/log/supervisor/backend.err.log
fi

# Test nginx proxy
echo "2. Testing nginx proxy (port 8091)..."
docker exec tracer-app curl -s http://127.0.0.1:8091/health
if [ $? -eq 0 ]; then
    echo "✓ Nginx proxy is working"
else
    echo "✗ Nginx proxy is not working"
    echo "Nginx logs:"
    docker exec tracer-app cat /var/log/supervisor/nginx.err.log
fi

# Test from host
echo "3. Testing from host..."
curl -s http://localhost:8091/health
if [ $? -eq 0 ]; then
    echo "✓ Host can reach the service"
else
    echo "✗ Host cannot reach the service"
fi

echo ""
echo "Service URLs:"
echo "- Main app: http://localhost:8091"
echo "- API docs: http://localhost:8091/docs"
echo "- Health check: http://localhost:8091/health"

echo ""
echo "To view logs: docker logs tracer-app"
echo "To debug: docker exec -it tracer-app bash"
