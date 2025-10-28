# Multi-stage build for Tracer application
# Stage 1: Build Frontend
FROM node:18-alpine as frontend-build

WORKDIR /frontend

# Copy frontend package files
COPY tracer-frontend/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source code
COPY tracer-frontend/ ./

# Build frontend with API URL pointing to nginx proxy
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Verify frontend build output
RUN ls -la /frontend/dist/

# Stage 2: Setup Backend with Frontend
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy backend requirements and install Python dependencies
COPY tracer-backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application files
COPY tracer-backend/app/ ./app/
COPY tracer-backend/data/ ./data/

# Ensure data directory exists
RUN mkdir -p /app/app/data

# Add Python path for imports
ENV PYTHONPATH="/app:/app/app"

# Copy built frontend files to nginx directory
COPY --from=frontend-build /frontend/dist /usr/share/nginx/html

# Verify frontend files were copied
RUN ls -la /usr/share/nginx/html/

# Remove default nginx configs
RUN rm -f /etc/nginx/sites-enabled/default /etc/nginx/conf.d/default.conf

# Create supervisor configuration
RUN mkdir -p /var/log/supervisor
RUN cat > /etc/supervisor/conf.d/supervisord.conf << 'EOF'
[supervisord]
nodaemon=true
user=root
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid

[program:backend]
command=python -m uvicorn main:app --host 0.0.0.0 --port 8000 --log-level info
directory=/app/app
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/backend.err.log
stdout_logfile=/var/log/supervisor/backend.out.log
priority=100
environment=PYTHONPATH="/app"

[program:nginx]
command=nginx -g "daemon off;"
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/nginx.err.log
stdout_logfile=/var/log/supervisor/nginx.out.log
priority=200
EOF

# Create nginx configuration to proxy API requests
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 8091;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # API proxy to backend - catch all /api/ requests
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Health check proxy
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_connect_timeout 10s;
        proxy_send_timeout 10s;
        proxy_read_timeout 10s;
    }

    # Docs proxy
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8000/openapi.json;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Frontend SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# Verify nginx configuration
RUN nginx -t

# Expose port 8091 (nginx will serve both frontend and proxy backend)
EXPOSE 8091

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8091/health || exit 1

# Start supervisor to manage both nginx and backend
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
