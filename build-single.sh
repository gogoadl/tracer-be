#!/bin/bash

# Build and run single Docker image for Tracer

echo "=== Building Tracer Single Image ==="

# Stop and remove existing container
echo "Stopping existing container..."
docker stop tracer-app 2>/dev/null || true
docker rm tracer-app 2>/dev/null || true

# Build with no cache for clean build
echo "Building Tracer image..."
docker build -t tracer:latest . --no-cache

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Check the build output above."
    exit 1
fi

echo "✅ Build successful! Starting container..."

# Run container
docker run -d \
  --name tracer-app \
  -p 8091:8091 \
  -v $(pwd)/tracer-backend/data:/app/app/data \
  -v ~/.command_log.jsonl:/app/app/data/.command_log.jsonl:ro \
  -e DATABASE_URL=sqlite:///./data/logs.db \
  -e COMMAND_HISTORY_PATH=/app/app/data/.command_log.jsonl \
  --restart unless-stopped \
  tracer:latest

echo "⏳ Waiting for services to start..."
sleep 15

echo "📊 Checking container status..."
docker ps | grep tracer-app

echo ""
echo "📋 Recent logs:"
docker logs tracer-app --tail 10

echo ""
echo "🔍 Testing health check..."
if curl -s http://localhost:8091/health > /dev/null; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
    echo ""
    echo "🔧 Debugging info:"
    echo "Backend logs:"
    docker exec tracer-app cat /var/log/supervisor/backend.err.log 2>/dev/null || echo "No backend error logs"
    echo ""
    echo "Nginx logs:"
    docker exec tracer-app cat /var/log/supervisor/nginx.err.log 2>/dev/null || echo "No nginx error logs"
fi

echo ""
echo "🌐 Service URLs:"
echo "  Main app: http://localhost:8091"
echo "  API docs: http://localhost:8091/docs"
echo "  Health check: http://localhost:8091/health"

echo ""
echo "📝 Management commands:"
echo "  View logs: docker logs tracer-app"
echo "  Debug: docker exec -it tracer-app bash"
echo "  Stop: docker stop tracer-app"
echo "  Remove: docker rm tracer-app"
