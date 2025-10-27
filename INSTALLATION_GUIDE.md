# Tracer Installation Guide

Complete installation guide for Tracer - a command and file change tracking system.

## Overview

Tracer is composed of:
1. **Backend**: FastAPI service for logging and tracking
2. **Frontend**: React dashboard for visualization
3. **Command Logger**: Linux shell command logging tool (optional)

## Prerequisites

- Python 3.11+
- Node.js 18+
- Linux system (for command logger)
- Git

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tracer-be/tracer-be
```

### 2. Backend Setup

```bash
cd tracer-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Linux/Mac:
source venv/bin/activate
# Windows:
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### 3. Install Command Logger (Linux only)

리눅스 시스템에서 자동 명령어 로깅을 설정:

```bash
chmod +x install_logger.sh
./install_logger.sh
```

이 스크립트는:
- `~/.config/tracer/command_logger.sh` 생성
- `~/.bashrc` 또는 `~/.zshrc`에 로깅 코드 추가
- `~/.command_history` 파일 생성

새 터미널을 열거나 설정을 리로드:
```bash
source ~/.bashrc  # or ~/.zshrc
```

### 4. Start Backend

**Windows:**
```bash
.\start_backend.bat
```

**Linux/Mac:**
```bash
chmod +x run.sh
./run.sh
```

백엔드가 `http://localhost:8000`에서 실행됩니다.

### 5. Frontend Setup

```bash
cd ../tracer-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

프론트엔드가 `http://localhost:5173`에서 실행됩니다.

## Verification

### Check Backend

```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy"}
```

### Check Command Logs

```bash
# Check if logs are being captured
tail -f ~/.command_history

# Try a command
echo "test command"

# Check logs again
tail -n 5 ~/.command_history
```

### Check Frontend

브라우저에서 `http://localhost:5173`을 열어 대시보드를 확인합니다.

## Dashboard Overview

Tracer 대시보드는 4개의 메뉴로 구성됩니다:

1. **대시보드 (Dashboard)**
   - Command Log Analytics: 명령어 통계 및 차트
   - File Watcher Analytics: 파일 변경 통계 및 차트

2. **커맨드 로그 (Command Logs)**
   - 특정 날짜의 명령어 로그 확인
   - AI 요약 및 상세 검색

3. **파일 워처 (File Watcher)**
   - 감시할 폴더 추가/삭제
   - 파일 변경 실시간 모니터링

4. **파일 변경사항 (File Changes)**
   - 파일 변경 이벤트 목록
   - Diff 뷰로 변경 내용 확인

## File Watcher Setup

대시보드의 "파일 워처" 메뉴에서:

1. **폴더 추가**
   - 경로 입력: 예) `/path/to/watch/folder`
   - 파일 패턴 선택 (선택사항)
   - 재귀 옵션 선택

2. **파일 수정**
   - 감시 중인 폴더의 파일을 수정
   - "파일 변경사항" 메뉴에서 변경 내역 확인

3. **Diff 보기**
   - 파일 변경사항 클릭
   - 좌측: 이전 버전 (빨간색)
   - 우측: 새로운 버전 (초록색)
   - 노란색: 변경된 줄

## Command Logger Details

### 로그 형식

```
2025-01-15 10:30:45 [user] ~/project: ls -la
2025-01-15 10:31:12 [user] ~/project: git status
```

포맷: `YYYY-MM-DD HH:MM:SS [username] directory: command`

### 로그 확인

```bash
# 전체 로그
cat ~/.command_history

# 실시간 로그
tail -f ~/.command_history

# 특정 날짜
grep "2025-01-15" ~/.command_history

# 특정 명령어
grep "git" ~/.command_history
```

### 제거

```bash
cd tracer-backend
chmod +x uninstall_logger.sh
./uninstall_logger.sh
```

## Troubleshooting

### Command Logger가 작동하지 않음

1. 셸 설정 파일 확인:
   ```bash
   grep "Tracer" ~/.bashrc  # or ~/.zshrc
   ```

2. 로거 스크립트 권한 확인:
   ```bash
   chmod +x ~/.config/tracer/command_logger.sh
   ```

3. 설정 리로드:
   ```bash
   source ~/.bashrc  # or ~/.zshrc
   ```

### Backend가 시작되지 않음

1. Python 버전 확인:
   ```bash
   python --version  # Should be 3.11+
   ```

2. 의존성 재설치:
   ```bash
   pip install -r requirements.txt --force-reinstall
   ```

3. 포트 충돌 확인:
   ```bash
   # Linux/Mac
   lsof -i :8000
   
   # Windows
   netstat -ano | findstr :8000
   ```

### Frontend가 연결되지 않음

1. 백엔드가 실행 중인지 확인
2. CORS 설정 확인: `tracer-backend/app/main.py`
3. 브라우저 콘솔에서 에러 확인

### 로그가 데이터베이스에 나타나지 않음

1. 백엔드 로그 확인 (터미널 출력)
2. 데이터베이스 파일 위치 확인: `tracer-backend/data/logs.db`
3. 수동 새로고침: 대시보드의 "Refresh" 버튼 클릭

## Advanced Configuration

### 로그 파일 위치 변경

`~/.config/tracer/command_logger.sh` 수정:
```bash
LOG_FILE="$HOME/my_custom_log_history"
```

### 백엔드 포트 변경

`tracer-backend/start_backend.bat` 수정:
```bash
uvicorn main:app --host 0.0.0.0 --port 8080
```

프론트엔드도 같이 수정: `tracer-frontend/vite.config.js`

### 파일 패턴 설정

파일 워처에서 특정 파일만 감시:
- 예: `*.py` - Python 파일만
- 예: `*.md,*.txt` - 마크다운과 텍스트 파일만
- 예: `!*.log` - 로그 파일 제외

## Production Deployment

### Docker Compose

```bash
cd tracer-backend
docker-compose up -d
```

### Systemd Service (Linux)

`/etc/systemd/system/tracer-backend.service`:

```ini
[Unit]
Description=Tracer Backend Service
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/tracer-backend
Environment="PATH=/path/to/tracer-backend/venv/bin"
ExecStart=/path/to/tracer-backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

## Security Considerations

1. **로그 파일 보안**
   ```bash
   chmod 600 ~/.command_history
   ```

2. **민감한 정보 보호**
   - 비밀번호는 직접 입력하지 마세요
   - 로그에 민감한 정보가 포함되어 있을 수 있습니다

3. **네트워크 보안**
   - 프로덕션에서는 CORS 설정 제한
   - 적절한 방화벽 규칙 설정

## Support

문제가 발생하면:
1. 이 가이드의 Troubleshooting 섹션 확인
2. GitHub Issues에 문제 보고
3. 로그 파일 확인 (`~/.command_history`)

## Next Steps

- [Command Logger 자세한 가이드](./tracer-backend/README_COMMAND_LOGGER.md)
- [API 문서](http://localhost:8000/docs)
- [프론트엔드 가이드](./tracer-frontend/README.md)

