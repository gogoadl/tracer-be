#!/bin/bash

# Build script for AI Log Frontend

echo "🚀 Building AI Log Frontend..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Build output in ./dist"
else
    echo "❌ Build failed!"
    exit 1
fi

