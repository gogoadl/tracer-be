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

# Check if container is actually running
if ! docker ps --filter name=tracer-app --format "{{.Names}}" | grep -q "tracer-app"; then
    echo "❌ ERROR: Container is not running!"
    echo "Container logs:"
    docker compose -f docker-compose.single.yml logs --tail 50
    exit 1
fi

echo ""
echo "🔍 Diagnosing container health..."

# Check supervisor status
echo "Checking supervisor processes..."
if docker exec tracer-app supervisorctl status 2>/dev/null; then
    echo "  ✅ Supervisor is running"
else
    echo "  ❌ Supervisor is not responding"
    echo "  Supervisor log:"
    docker exec tracer-app cat /var/log/supervisor/supervisord.log 2>/dev/null | tail -20 || echo "  No supervisor log"
fi

# Check if backend process is running
echo "Checking backend process..."
if docker exec tracer-app ps aux | grep -q "[j]ava.*tracer-backend.jar"; then
    echo "  ✅ Backend process (Spring Boot) is running"
else
    echo "  ❌ Backend process is not running"
    echo "  Backend error log:"
    docker exec tracer-app cat /var/log/supervisor/backend.err.log 2>/dev/null | tail -30 || echo "  No backend error log"
    echo "  Backend output log:"
    docker exec tracer-app cat /var/log/supervisor/backend.out.log 2>/dev/null | tail -30 || echo "  No backend output log"
fi

# Check if nginx process is running
echo "Checking nginx process..."
if docker exec tracer-app ps aux | grep -q "[n]ginx"; then
    echo "  ✅ Nginx process is running"
    # Test nginx configuration
    if docker exec tracer-app nginx -t 2>&1 | grep -q "successful"; then
        echo "  ✅ Nginx configuration is valid"
    else
        echo "  ⚠️  Nginx configuration may have issues:"
        docker exec tracer-app nginx -t 2>&1
    fi
else
    echo "  ❌ Nginx process is not running"
    echo "  Testing nginx configuration:"
    docker exec tracer-app nginx -t 2>&1 || echo "  Cannot test nginx config"
    echo "  Nginx error log:"
    docker exec tracer-app cat /var/log/supervisor/nginx.err.log 2>/dev/null | tail -30 || echo "  No nginx error log"
    echo "  Nginx output log:"
    docker exec tracer-app cat /var/log/supervisor/nginx.out.log 2>/dev/null | tail -30 || echo "  No nginx output log"
fi

# Check if ports are listening
echo "Checking port listeners..."
if docker exec tracer-app netstat -tlnp 2>/dev/null | grep -q ":8091"; then
    echo "  ✅ Port 8091 is listening"
else
    echo "  ❌ Port 8091 is not listening"
    echo "  Checking all listening ports:"
    docker exec tracer-app netstat -tlnp 2>/dev/null || docker exec tracer-app ss -tlnp 2>/dev/null || echo "  Cannot check ports"
fi

if docker exec tracer-app netstat -tlnp 2>/dev/null | grep -q ":8000"; then
    echo "  ✅ Port 8000 is listening"
else
    echo "  ❌ Port 8000 is not listening"
fi

echo ""
echo "📋 Recent logs:"
docker compose -f docker-compose.single.yml logs --tail 20

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
    
    # Test root endpoint
    if docker exec tracer-app curl -s http://127.0.0.1:8000/ > /dev/null; then
        echo "    ✅ / endpoint working"
    else
        echo "    ❌ / endpoint failed"
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
        docker exec tracer-app tail -10 /var/log/nginx/access.log 2>/dev/null || echo "    No access log"
        echo "    Nginx error log:"
        docker exec tracer-app tail -20 /var/log/nginx/error.log 2>/dev/null || echo "    No error log"
        echo "    Testing backend connectivity from nginx:"
        docker exec tracer-app curl -v http://127.0.0.1:8000/health 2>&1 | head -15 || echo "    Cannot connect to backend"
    fi
    
else
    echo "  ❌ Nginx proxy is not working"
    echo "  Nginx error logs:"
    docker exec tracer-app cat /var/log/supervisor/nginx.err.log 2>/dev/null || echo "  No nginx error logs"
fi

# Test from host
echo "Testing from host:"
if curl -s -v http://localhost:8091/health 2>&1 | grep -q "HTTP"; then
    echo "  ✅ Host can reach the service"
    echo "  Response:"
    curl -s http://localhost:8091/health | head -5
else
    echo "  ❌ Host cannot reach the service"
    echo "  Detailed connection test:"
    curl -v http://localhost:8091/health 2>&1 | head -20
    echo ""
    echo "  Checking if port is accessible:"
    if command -v nc >/dev/null 2>&1; then
        if nc -zv localhost 8091 2>&1; then
            echo "    Port 8091 is open"
        else
            echo "    Port 8091 is not accessible"
        fi
    fi
    echo "  Check if port 8091 is blocked by firewall"
    echo ""
    echo "  🔧 Troubleshooting steps:"
    echo "    1. Check container logs: docker compose -f docker-compose.single.yml logs"
    echo "    2. Check supervisor status: docker exec tracer-app supervisorctl status"
    echo "    3. Check nginx config: docker exec tracer-app nginx -t"
    echo "    4. Check processes: docker exec tracer-app ps aux"
    echo "    5. Test from inside container: docker exec tracer-app curl http://localhost:8091/health"
fi

echo ""
echo "🌐 Service URLs:"
echo "  Main app: http://localhost:8091"
echo "  Health check: http://localhost:8091/health"
echo "  API: http://localhost:8091/api"

echo ""
echo "📝 Management commands:"
echo "  View logs: docker compose -f docker-compose.single.yml logs -f"
echo "  View backend logs: docker exec tracer-app tail -f /var/log/supervisor/backend.out.log"
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
