#!/bin/bash

echo "=== Testing Docker Build Process ==="

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed or not in PATH"
    exit 1
fi

# Check if required directories exist
echo "Checking project structure..."
if [ ! -d "tracer-frontend" ]; then
    echo "ERROR: tracer-frontend directory not found"
    exit 1
fi

if [ ! -d "tracer-backend" ]; then
    echo "ERROR: tracer-backend directory not found"
    exit 1
fi

if [ ! -f "tracer-frontend/package.json" ]; then
    echo "ERROR: tracer-frontend/package.json not found"
    exit 1
fi

if [ ! -f "tracer-backend/requirements.txt" ]; then
    echo "ERROR: tracer-backend/requirements.txt not found"
    exit 1
fi

echo "Project structure OK"

# Build the image
echo "Building Docker image..."
docker build -t tracer-test . --no-cache

if [ $? -eq 0 ]; then
    echo "Build successful!"
    
    # Test the built image
    echo "Testing built image contents..."
    docker run --rm tracer-test ls -la /usr/share/nginx/html/
    
    echo "Testing nginx configuration..."
    docker run --rm tracer-test nginx -t
    
    echo "Testing backend files..."
    docker run --rm tracer-test ls -la /app/app/
    
else
    echo "Build failed!"
    exit 1
fi
