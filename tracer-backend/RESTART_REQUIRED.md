# ⚠️ RESTART REQUIRED

## Problem
The `file_changes` table was just created, but the backend server is using an old database session that doesn't see the new table.

## Solution

### Stop the Backend Server
Press `Ctrl+C` in the terminal where the backend is running.

### Restart the Backend Server
```bash
cd ai-log-backend/app
uvicorn main:app --reload
```

### Verify
Check the console for:
```
Starting AI Log Backend...
File watchers started
```

Then modify a file and check the console - you should see NO errors!

