# Linux Setup Guide

## Command Logger Path Configuration

Tracer 백엔드는 리눅스 환경에서 `~/.command_history` 파일을 자동으로 읽습니다.

### 기본 설정

**install_logger.sh**를 실행하면:
- 로그 파일 위치: `~/.command_history`
- 백엔드 시작 시 자동으로 이 파일을 읽어서 데이터베이스에 저장

### 환경 변수 설정 (선택사항)

다른 경로를 사용하고 싶다면 환경 변수를 설정:

```bash
export COMMAND_HISTORY_PATH="/custom/path/to/history.log"
cd tracer-backend
cd app
uvicorn main:app --reload
```

### 백엔드 시작 시 동작

백엔드는 시작할 때 다음 순서로 동작합니다:

1. **경로 확인**: 환경 변수 또는 `~/.command_history` 확인
2. **파일 존재 확인**: 파일이 있는지 체크
3. **데이터 로드**: 파일을 읽어서 데이터베이스에 저장
4. **중복 방지**: 이미 저장된 로그는 건너뜀

로그 출력 예시:

```
Starting Tracer Backend...
Looking for command history at: /home/user/.command_history
Loading logs from /home/user/.command_history
Successfully loaded logs from /home/user/.command_history
```

파일이 없을 경우:

```
Starting Tracer Backend...
Looking for command history at: /home/user/.command_history
No command history found at /home/user/.command_history
To set up command logging on Linux, run: cd tracer-backend && ./install_logger.sh
```

### 수동 새로고침

API를 통해 수동으로 새로고침 가능:

```bash
curl -X POST http://localhost:8000/api/logs/refresh
```

응답:

```json
{
  "message": "Logs refreshed successfully",
  "source": "/home/user/.command_history",
  "path": "/home/user/.command_history"
}
```

### 확인 방법

로그 파일 확인:

```bash
# 최근 로그 확인
tail -20 ~/.command_history

# 특정 명령어 검색
grep "git" ~/.command_history

# 실시간 로그 확인
tail -f ~/.command_history
```

백엔드 로그:

```bash
cd tracer-backend
cd app
uvicorn main:app --reload
```

터미널에서 실행한 명령어가 백엔드 로그에 표시되는지 확인.

### 문제 해결

**1. 파일을 찾지 못하는 경우**

확인:
```bash
ls -la ~/.command_history
```

해결:
```bash
cd tracer-backend
./install_logger.sh
source ~/.bashrc  # or source ~/.zshrc
```

**2. 중복 로그가 생성되는 경우**

이는 정상 동작입니다. 각 터미널 세션마다 개별적으로 로깅됩니다.

**3. 백엔드가 데이터를 읽지 않는 경우**

수동 새로고침:
```bash
curl -X POST http://localhost:8000/api/logs/refresh
```

백엔드 재시작:
```bash
cd tracer-backend
cd app
uvicorn main:app --reload
```

## Custom Path

환경 변수로 경로 변경:

```bash
# 환경 변수 설정
export COMMAND_HISTORY_PATH="/path/to/custom/history.log"

# 백엔드 시작
cd tracer-backend/app
uvicorn main:app --reload
```

또는 Docker에서:

```yaml
# docker-compose.yml
environment:
  - COMMAND_HISTORY_PATH=/custom/path/history.log
```

## 제거

로그 시스템 제거:

```bash
cd tracer-backend
./uninstall_logger.sh
```

또는 수동:

1. `~/.bashrc` 또는 `~/.zshrc`에서 Tracer 관련 라인 삭제
2. 설정 디렉토리 삭제: `rm -rf ~/.config/tracer`
3. (선택) 로그 파일 삭제: `rm ~/.command_history`

