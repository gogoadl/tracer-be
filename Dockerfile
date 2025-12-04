# Multi-stage build for Tracer application
# Stage 1: Build Frontend
FROM node:18-alpine as frontend-build

WORKDIR /frontend

# Copy frontend package files
COPY tracer-frontend/package*.json ./

# Install frontend dependencies
# Use npm install instead of npm ci to handle package-lock.json sync issues
RUN npm install

# Copy frontend source code
COPY tracer-frontend/ ./

# Build frontend with API URL pointing to nginx proxy
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Verify frontend build output
RUN ls -la /frontend/dist/

# Stage 2: Build Spring Boot Backend
FROM gradle:8.5-jdk21 AS backend-build

WORKDIR /build

# Copy Gradle files
COPY tracer-backend/build.gradle tracer-backend/settings.gradle ./
COPY tracer-backend/src ./src

# Build Spring Boot application
RUN gradle clean bootJar --no-daemon -x test

# Stage 3: Setup Backend with Frontend
FROM eclipse-temurin:21-jre

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    curl \
    bash \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Setup command logging functionality
RUN mkdir -p /usr/local/bin && \
    echo '#!/bin/bash' > /usr/local/bin/install-command-logger.sh && \
    echo 'echo "Installing command logger for Tracer..."' >> /usr/local/bin/install-command-logger.sh && \
    echo 'LOG_FILE="$HOME/.command_log.jsonl"' >> /usr/local/bin/install-command-logger.sh && \
    echo 'SHELL_RC=""' >> /usr/local/bin/install-command-logger.sh && \
    echo 'if [ -n "$BASH_VERSION" ]; then' >> /usr/local/bin/install-command-logger.sh && \
    echo '    SHELL_RC="$HOME/.bashrc"' >> /usr/local/bin/install-command-logger.sh && \
    echo 'elif [ -n "$ZSH_VERSION" ]; then' >> /usr/local/bin/install-command-logger.sh && \
    echo '    SHELL_RC="$HOME/.zshrc"' >> /usr/local/bin/install-command-logger.sh && \
    echo 'else' >> /usr/local/bin/install-command-logger.sh && \
    echo '    SHELL_RC="$HOME/.profile"' >> /usr/local/bin/install-command-logger.sh && \
    echo 'fi' >> /usr/local/bin/install-command-logger.sh && \
    echo 'touch "$LOG_FILE"' >> /usr/local/bin/install-command-logger.sh && \
    echo 'if ! grep -q "command_log_function" "$SHELL_RC" 2>/dev/null; then' >> /usr/local/bin/install-command-logger.sh && \
    echo '    echo "" >> "$SHELL_RC"' >> /usr/local/bin/install-command-logger.sh && \
    echo '    echo "# Tracer Command Logging" >> "$SHELL_RC"' >> /usr/local/bin/install-command-logger.sh && \
    echo '    echo "command_log_function() {" >> "$SHELL_RC"' >> /usr/local/bin/install-command-logger.sh && \
    echo '    echo "    local cmd=\"\$1\"" >> "$SHELL_RC"' >> /usr/local/bin/install-command-logger.sh && \
    echo '    echo "    if [ -n \"\$cmd\" ] && [ \"\$cmd\" != \"command_log_function\" ]; then" >> "$SHELL_RC"' >> /usr/local/bin/install-command-logger.sh && \
    echo '    echo "        local timestamp=\$(date -u +\"%Y-%m-%dT%H:%M:%S\")" >> "$SHELL_RC"' >> /usr/local/bin/install-command-logger.sh && \
    echo '    echo "        local user=\$(whoami)" >> "$SHELL_RC"' >> /usr/local/bin/install-command-logger.sh && \
    echo '    echo "        local directory=\$(pwd)" >> "$SHELL_RC"' >> /usr/local/bin/install-command-logger.sh && \
    echo '    echo "        echo \"{\\\"timestamp\\\":\\\"\$timestamp\\\",\\\"user\\\":\\\"\$user\\\",\\\"directory\\\":\\\"\$directory\\\",\\\"command\\\":\\\"\$cmd\\\"}\" >> \"'$LOG_FILE'\"" >> "$SHELL_RC"' >> /usr/local/bin/install-command-logger.sh && \
    echo '    echo "    fi" >> "$SHELL_RC"' >> /usr/local/bin/install-command-logger.sh && \
    echo '    echo "}" >> "$SHELL_RC"' >> /usr/local/bin/install-command-logger.sh && \
    echo '    echo "export PROMPT_COMMAND=\"command_log_function \\\"\\\$(history 1 | sed \\\"s/^[ ]*[0-9]*[ ]*//\\\")\\\"\"" >> "$SHELL_RC"' >> /usr/local/bin/install-command-logger.sh && \
    echo '    echo "✅ Command logger installed. Run: source $SHELL_RC"' >> /usr/local/bin/install-command-logger.sh && \
    echo 'else' >> /usr/local/bin/install-command-logger.sh && \
    echo '    echo "ℹ️  Command logger already installed in $SHELL_RC"' >> /usr/local/bin/install-command-logger.sh && \
    echo 'fi' >> /usr/local/bin/install-command-logger.sh && \
    chmod +x /usr/local/bin/install-command-logger.sh

# Copy built Spring Boot JAR from build stage
COPY --from=backend-build /build/build/libs/tracer-backend-1.0.0.jar /app/tracer-backend.jar

# Copy data directory (will be mounted at runtime, but needed for initial setup)
COPY tracer-backend/data/ ./data/

# Ensure data directory exists
RUN mkdir -p /app/data

# Copy built frontend files to nginx directory
COPY --from=frontend-build /frontend/dist /usr/share/nginx/html

# Verify frontend files were copied
RUN ls -la /usr/share/nginx/html/

# Remove default nginx configs (if they exist)
RUN rm -f /etc/nginx/sites-enabled/default /etc/nginx/conf.d/default.conf || true

# Create supervisor configuration
RUN mkdir -p /var/log/supervisor
RUN cat > /etc/supervisor/conf.d/supervisord.conf << 'EOF'
[supervisord]
nodaemon=true
user=root
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid

[program:backend]
command=java -Xmx512m -Xms256m -jar /app/tracer-backend.jar
directory=/app
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/backend.err.log
stdout_logfile=/var/log/supervisor/backend.out.log
priority=100
environment=SPRING_DATASOURCE_URL="jdbc:sqlite:./data/logs.db",COMMAND_HISTORY_PATH="/app/data/.command_log.jsonl",DATABASE_URL="jdbc:sqlite:./data/logs.db",SERVER_PORT="8080"

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
    
    # Error logging
    error_log /var/log/nginx/error.log warn;
    access_log /var/log/nginx/access.log;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # API proxy to backend - catch all /api/ requests
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 10s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        proxy_buffering off;
        proxy_http_version 1.1;
        proxy_set_header Connection "";

    }

    # Health check proxy
    location /health {
        proxy_pass http://127.0.0.1:8080/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_connect_timeout 10s;
        proxy_send_timeout 10s;
        proxy_read_timeout 10s;
    }

    # Spring Boot Actuator endpoints (if enabled)
    location /actuator {
        proxy_pass http://127.0.0.1:8080/actuator;
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
