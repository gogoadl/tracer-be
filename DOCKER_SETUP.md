# Docker Setup Guide

This guide explains how to run the Tracer application using Docker Compose.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 1.29 or higher)

## Quick Start

### 1. Build and Start Services

```bash
docker-compose up --build
```

This will:
- Build both backend and frontend Docker images
- Start the backend service on port 8000
- Start the frontend service on port 3000
- Set up proper networking between services

### 2. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### 3. Stop Services

```bash
docker-compose down
```

To remove volumes as well:

```bash
docker-compose down -v
```

## Services

### Backend Service

- **Container Name**: `tracer-backend`
- **Port**: 8000
- **Health Check**: http://localhost:8000/health
- **Volumes**:
  - `./tracer-backend/data` - Database and configuration files
  - `~/.command_log.jsonl` - Command log file (Linux)

### Frontend Service

- **Container Name**: `tracer-frontend`
- **Port**: 3000
- **Built with**: React + Vite
- **Served by**: Nginx

## Development vs Production

### Development Mode

For development with hot reload:

**Backend** (run separately):
```bash
cd tracer-backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend** (run separately):
```bash
cd tracer-frontend
npm run dev
```

### Production Mode (Docker)

Build and run with Docker Compose for production deployment.

## Environment Variables

### Backend

- `DATABASE_URL`: SQLite database path (default: `sqlite:///./data/logs.db`)
- `COMMAND_HISTORY_PATH`: Path to command log file (default: `~/.command_log.jsonl`)

### Frontend

- `VITE_API_URL`: Backend API URL (default: `http://localhost:8000`)

## Troubleshooting

### Backend not starting

Check logs:
```bash
docker-compose logs backend
```

### Frontend not connecting to backend

1. Verify backend is running: `curl http://localhost:8000/health`
2. Check network connectivity between containers
3. Verify API URL is correctly configured in frontend

### Database issues

The database is stored in `./tracer-backend/data/logs.db` on the host. If you need to reset it:

```bash
rm ./tracer-backend/data/logs.db
docker-compose restart backend
```

### Command log file not found

On Linux, ensure `.command_log.jsonl` exists:
```bash
touch ~/.command_log.jsonl
```

Or mount a different file path in `docker-compose.yml`.

## Building Individual Services

### Backend Only

```bash
cd tracer-backend
docker build -t tracer-backend .
docker run -p 8000:8000 -v ./data:/app/app/data tracer-backend
```

### Frontend Only

```bash
cd tracer-frontend
docker build -t tracer-frontend .
docker run -p 3000:80 tracer-frontend
```

## Network Architecture

- `tracer-network`: Custom Docker network for service isolation
- Backend and Frontend communicate via Docker internal networking
- Frontend proxies API requests to backend

## Persistence

- Database: `./tracer-backend/data/logs.db`
- Configuration: `./tracer-backend/data/tracer_config.json`
- Command logs: `~/.command_log.jsonl` (Linux)

All data persists on the host filesystem via Docker volumes.

