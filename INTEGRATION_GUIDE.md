# AI Log Integration Guide

This guide shows you how to run the AI Log Backend and Frontend together.

## Quick Start

### 1. Start the Backend

```bash
cd ai-log-backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1   # Windows
source venv/bin/activate       # Linux/Mac

# Setup sample data
python setup_sample_data.py

# Navigate to app directory and run server
cd app
uvicorn main:app --reload
```

Backend will run at: http://localhost:8000

### 2. Start the Frontend

Open a new terminal and run:

```bash
cd tracer-fe/tracer-fe

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Frontend will run at: http://localhost:5173

## Verify Integration

1. **Backend Health Check:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Backend API Docs:**
   - Visit: http://localhost:8000/docs
   - Interactive API documentation (Swagger UI)

3. **Frontend Application:**
   - Visit: http://localhost:5173
   - Should display the AI Command Log Viewer

## API Endpoints

### Backend Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info |
| `/health` | GET | Health check |
| `/api/logs` | GET | Get all logs with filters |
| `/api/logs/by-date` | GET | Get logs grouped by date |
| `/api/logs/stats` | GET | Get statistics |
| `/api/logs/date/{date}` | GET | Get logs for specific date |
| `/api/logs/refresh` | POST | Refresh logs from file |

### Frontend Expectations

The frontend expects:
- Dates list: Array of date strings from `/api/logs/by-date`
- Logs per date: From `/api/logs/date/{date}`
- Log entry format:
  ```json
  {
    "timestamp": "ISO string",
    "time": "HH:MM:SS",
    "user": "username",
    "working_directory": "path",
    "command": "command line"
  }
  ```

## Data Format

The backend expects command history in `~/.command_history` with this format:
```
2025-10-27 09:15:22 [user] ~/project: ls -la
```

Where:
- Date: `YYYY-MM-DD`
- Time: `HH:MM:SS`
- User: Enclosed in brackets
- Directory: Path before the colon
- Command: Everything after the colon

## Troubleshooting

### Backend won't start

1. **ModuleNotFoundError**: Make sure you activated the virtual environment
   ```bash
   # Windows
   .\venv\Scripts\Activate.ps1
   
   # Linux/Mac
   source venv/bin/activate
   ```

2. **Database not found**: The database will be created automatically in `ai-log-backend/data/logs.db`

### Frontend can't connect to backend

1. Check CORS settings in `ai-log-backend/app/main.py`
2. Verify backend is running on http://localhost:8000
3. Check browser console for CORS errors

### No data showing

1. Run `python setup_sample_data.py` to load sample data
2. Or create your own `~/.command_history` file
3. Use the refresh endpoint: `POST /api/logs/refresh`

## Development Workflow

1. **Backend changes**: Edit files in `ai-log-backend/app/`
   - Changes auto-reload with `--reload` flag

2. **Frontend changes**: Edit files in `tracer-fe/tracer-fe/src/`
   - Vite hot-reloads automatically

3. **Database updates**: SQLAlchemy will handle migrations automatically

## Production Deployment

### Docker

#### Backend:
```bash
cd ai-log-backend
docker-compose up --build
```

#### Frontend:
```bash
cd tracer-fe/tracer-fe
docker build -t ai-log-frontend .
docker run -p 8080:80 ai-log-frontend
```

### Environment Variables

#### Backend (.env or environment):
```
DATABASE_URL=sqlite:///./data/logs.db
```

#### Frontend (.env):
```
VITE_API_URL=http://localhost:8000
```

## Project Structure

```
tracer-be/
├── ai-log-backend/          # FastAPI Backend
│   ├── app/
│   │   ├── main.py         # FastAPI app
│   │   ├── models.py       # Database models
│   │   └── routes/
│   │       └── logs.py     # API routes
│   ├── data/               # Database & logs
│   └── requirements.txt
│
└── tracer-fe/
    └── tracer-fe/           # React Frontend
        ├── src/
        │   ├── api.js      # API client
        │   ├── App.jsx     # Main component
        │   └── components/
        ├── package.json
        └── vite.config.js
```

## Next Steps

- [ ] Add AI-powered log analysis
- [ ] Implement user authentication
- [ ] Add real-time log streaming
- [ ] Deploy to cloud hosting
- [ ] Add more visualization charts

