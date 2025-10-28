#!/bin/bash

echo "=== Rebuilding with Syntax Fix ==="

# Stop existing container
docker stop tracer-app 2>/dev/null || true
docker rm tracer-app 2>/dev/null || true

# Clean build
echo "Building with syntax fix..."
docker build -t tracer:latest . --no-cache

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo "Build successful! Starting container..."

# Start container
docker run -d \
  --name tracer-app \
  -p 8091:8091 \
  -v $(pwd)/tracer-backend/data:/app/app/data \
  -e DATABASE_URL=sqlite:///./data/logs.db \
  --restart unless-stopped \
  tracer:latest

echo "Waiting for services to start..."
sleep 15

echo "Checking container status..."
docker ps | grep tracer-app

echo ""
echo "Checking logs..."
docker logs tracer-app --tail 10

echo ""
echo "Testing health check..."
curl -s http://localhost:8091/health && echo " ✓ Success!" || echo " ✗ Failed"

echo ""
echo "Service URLs:"
echo "- Main app: http://localhost:8091"
echo "- API docs: http://localhost:8091/docs"
echo "- Health check: http://localhost:8091/health"
