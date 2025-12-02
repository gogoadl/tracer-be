#!/bin/bash

# Run Tracer application using Docker Compose

echo "=== Starting Tracer Application ==="

# Check if container is running and stop/remove if needed
echo "Checking for existing containers..."
if docker ps --filter name=tracer-app --format "{{.Names}}" | grep -q "tracer-app"; then
    echo "Container is running. Stopping and removing..."
    docker compose -f docker-compose.single.yml down
elif docker ps -a --filter name=tracer-app --format "{{.Names}}" | grep -q "tracer-app"; then
    echo "Container exists but not running. Removing..."
    docker compose -f docker-compose.single.yml down
else
    echo "No existing container found."
fi

echo "Starting Tracer with Docker Compose..."
docker compose -f docker-compose.single.yml up -d

echo "⏳ Waiting for services to start..."
sleep 15

echo "📊 Checking container status..."
docker compose -f docker-compose.single.yml ps

echo ""
echo "📋 Recent logs:"
docker compose -f docker-compose.single.yml logs --tail 10

echo ""
echo "🔍 Testing services..."

# Test backend directly
echo "Testing backend (port 8000):"
if docker exec tracer-app curl -s http://127.0.0.1:8000/health > /dev/null; then
    echo "  ✅ Backend is responding"
    
    # Test specific API endpoints
    echo "  Testing API endpoints:"
    
    # Test folders endpoint
    if docker exec tracer-app curl -s http://127.0.0.1:8000/api/folders > /dev/null; then
        echo "    ✅ /api/folders endpoint working"
    else
        echo "    ❌ /api/folders endpoint failed"
    fi
    
    # Test docs endpoint
    if docker exec tracer-app curl -s http://127.0.0.1:8000/docs > /dev/null; then
        echo "    ✅ /docs endpoint working"
    else
        echo "    ❌ /docs endpoint failed"
    fi
    
else
    echo "  ❌ Backend is not responding"
    echo "  Backend error logs:"
    docker exec tracer-app cat /var/log/supervisor/backend.err.log 2>/dev/null || echo "  No backend error logs"
fi

# Test nginx proxy
echo "Testing nginx proxy (port 8091):"
if docker exec tracer-app curl -s http://127.0.0.1:8091/health > /dev/null; then
    echo "  ✅ Nginx proxy is working"
    
    # Test API proxy
    echo "  Testing API proxy:"
    
    # Test folders endpoint through proxy
    if docker exec tracer-app curl -s http://127.0.0.1:8091/api/folders > /dev/null; then
        echo "    ✅ /api/folders proxy working"
    else
        echo "    ❌ /api/folders proxy failed"
        echo "    Nginx access log:"
        docker exec tracer-app tail -5 /var/log/nginx/access.log 2>/dev/null || echo "    No access log"
        echo "    Nginx error log:"
        docker exec tracer-app tail -5 /var/log/nginx/error.log 2>/dev/null || echo "    No error log"
    fi
    
else
    echo "  ❌ Nginx proxy is not working"
    echo "  Nginx error logs:"
    docker exec tracer-app cat /var/log/supervisor/nginx.err.log 2>/dev/null || echo "  No nginx error logs"
fi

# Test from host
echo "Testing from host:"
if curl -s http://localhost:8091/health > /dev/null; then
    echo "  ✅ Host can reach the service"
else
    echo "  ❌ Host cannot reach the service"
    echo "  Check if port 8091 is blocked by firewall"
fi

echo ""
echo "🌐 Service URLs:"
echo "  Main app: http://localhost:8091"
echo "  API docs: http://localhost:8091/docs"
echo "  Health check: http://localhost:8091/health"

echo ""
echo "📝 Management commands:"
echo "  View logs: docker compose -f docker-compose.single.yml logs -f"
echo "  Debug: docker exec -it tracer-app bash"
echo "  Stop: docker compose -f docker-compose.single.yml down"
echo "  Restart: docker compose -f docker-compose.single.yml restart"

echo ""
echo "🔧 If API errors persist:"
echo "  1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "  2. Check browser dev tools Network tab"
echo "  3. Verify requests go to :8091, not :8000"
echo "  4. Test specific endpoints:"
echo "     curl http://localhost:8091/api/folders"
echo "     curl -X POST \"http://localhost:8091/api/folders/add?path=/host/current&recursive=true\""
echo ""
echo "📁 Available paths for file watching:"
echo "  /host/current - Current project directory"
echo "  /host/home - Your home directory (\$HOME)"
echo "  /host/root/path/to/folder - Any system path"
echo ""
echo "🔧 Command Logger Setup:"
echo "  To install command logging on host system:"
echo "  docker exec -it tracer-app install-command-logger.sh"
