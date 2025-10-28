#!/bin/bash

echo "=== Tracer API Debug Script ==="

# Check if container is running
echo "1. Checking container status..."
docker ps | grep tracer-app

if [ $? -ne 0 ]; then
    echo "ERROR: tracer-app container is not running"
    echo "Starting container..."
    ./build-single.sh
    sleep 10
fi

echo ""
echo "2. Checking container logs..."
docker logs tracer-app --tail 50

echo ""
echo "3. Checking processes inside container..."
docker exec tracer-app ps aux

echo ""
echo "4. Checking nginx status..."
docker exec tracer-app nginx -t
docker exec tracer-app curl -s http://localhost:8091/ > /dev/null
if [ $? -eq 0 ]; then
    echo "✓ Nginx is responding"
else
    echo "✗ Nginx is not responding"
fi

echo ""
echo "5. Checking backend status..."
docker exec tracer-app curl -s http://localhost:8000/health
if [ $? -eq 0 ]; then
    echo "✓ Backend is responding"
else
    echo "✗ Backend is not responding"
fi

echo ""
echo "6. Checking API proxy..."
docker exec tracer-app curl -s http://localhost:8091/health
if [ $? -eq 0 ]; then
    echo "✓ API proxy is working"
else
    echo "✗ API proxy is not working"
fi

echo ""
echo "7. Testing from host..."
curl -s http://localhost:8091/health
if [ $? -eq 0 ]; then
    echo "✓ Host can reach the service"
else
    echo "✗ Host cannot reach the service"
fi

echo ""
echo "8. Checking port binding..."
docker port tracer-app

echo ""
echo "9. Checking network connectivity..."
docker exec tracer-app netstat -tlnp

echo ""
echo "=== Debug Complete ==="
