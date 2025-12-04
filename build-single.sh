#!/bin/bash

# Build single Docker image for Tracer

echo "=== Building Tracer Single Image ==="

# Build with no cache for clean build
echo "Building Tracer image..."
echo "⚠️  This will rebuild the frontend with updated API settings"
echo "⚠️  Removing old images and containers..."
docker compose -f docker-compose.single.yml down 2>/dev/null || true
docker rmi tracer:latest 2>/dev/null || true
echo "Building fresh image..."
docker build -t tracer:latest . --no-cache

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Check the build output above."
    exit 1
fi

echo "✅ Build successful!"

echo ""
echo "🚀 To run the application:"
echo "  docker compose -f docker-compose.single.yml up -d"
echo ""
echo "📝 To view logs:"
echo "  docker compose -f docker-compose.single.yml logs -f"
echo ""
echo "🛑 To stop:"
echo "  docker compose -f docker-compose.single.yml down"
echo ""
echo "🌐 After starting, access:"
echo "  Main app: http://localhost:8091"
echo "  Health check: http://localhost:8091/health"
echo "  API: http://localhost:8091/api"
