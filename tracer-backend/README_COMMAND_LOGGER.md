# Tracer Command Logger

리눅스 시스템에서 자동으로 명령어를 로깅하는 기능입니다.

## 기능

- ✅ 모든 명령어 자동 로깅
- ✅ 타임스탬프 포함
- ✅ 사용자 및 디렉토리 정보 포함
- ✅ bash 및 zsh 지원
- ✅ 쉬운 설치 및 제거

## 설치 방법

### 자동 설치

```bash
cd tracer-backend
chmod +x install_logger.sh
./install_logger.sh
```

### 수동 설치

#### 1. 로거 스크립트 생성

```bash
mkdir -p ~/.config/tracer

cat > ~/.config/tracer/command_logger.sh << 'EOF'
#!/bin/bash
# Tracer Command Logger

LOG_FILE="$HOME/.command_history"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
USERNAME=$(whoami)
DIR=$(pwd)
COMMAND=$(history 1 | sed 's/^[ ]*[0-9]*[ ]*//')

if [ -z "$COMMAND" ] || [[ "$COMMAND" == *"command_logger.sh"* ]]; then
    return
fi

echo "$TIMESTAMP [$USERNAME] $DIR: $COMMAND" >> "$LOG_FILE"
EOF

chmod +x ~/.config/tracer/command_logger.sh
```

#### 2. Bash 설정

`~/.bashrc` 파일에 추가:

```bash
# Tracer Command Logger
source ~/.config/tracer/command_logger.sh
PROMPT_COMMAND="~/.config/tracer/command_logger.sh; $PROMPT_COMMAND"
```

#### 3. Zsh 설정

`~/.zshrc` 파일에 추가:

```bash
# Tracer Command Logger
source ~/.config/tracer/command_logger.sh
precmd() {
    ~/.config/tracer/command_logger.sh
}
```

#### 4. 설정 적용

```bash
source ~/.bashrc  # or ~/.zshrc
```

## 로그 형식

로그 파일 (`~/.command_history`) 형식:

```
2025-01-15 10:30:45 [user] ~/project: ls -la
2025-01-15 10:31:12 [user] ~/project: git status
2025-01-15 10:32:00 [user] ~/project: cd src
2025-01-15 10:32:15 [user] ~/project/src: python app.py
```

## 로그 확인

```bash
# 실시간 로그 확인
tail -f ~/.command_history

# 최근 로그 확인
tail -20 ~/.command_history

# 특정 날짜 로그 확인
grep "2025-01-15" ~/.command_history
```

## 백엔드 연동

Tracer 백엔드는 시작 시 `~/.command_history` 파일을 자동으로 로드합니다:

```bash
cd tracer-backend
./start_backend.bat  # Windows
# or
cd app && uvicorn main:app --reload  # Linux/Mac
```

## 제거 방법

### 자동 제거

```bash
cd tracer-backend
chmod +x uninstall_logger.sh
./uninstall_logger.sh
```

### 수동 제거

1. 셸 설정 파일에서 Tracer 관련 라인 삭제
2. 로거 스크립트 삭제:

```bash
rm -rf ~/.config/tracer
rm ~/.command_history  # 선택사항: 로그 파일도 삭제
```

## 보안 고려사항

- 로그 파일은 개인 정보를 포함할 수 있습니다
- 로그 파일의 권한은 기본적으로 600 (소유자만 읽기/쓰기)으로 설정됩니다
- 민감한 명령어(비밀번호 등)를 직접 입력하지 마세요
- 로그 파일의 백업을 정기적으로 확인하세요

## 고급 설정

### 로그 파일 위치 변경

`~/.config/tracer/command_logger.sh` 파일에서 `LOG_FILE` 변수를 수정:

```bash
LOG_FILE="$HOME/my_custom_log_history"
```

### 로그 회전 설정

로그 파일이 너무 커지지 않도록 자동으로 로그를 관리하려면:

```bash
# ~/.config/tracer/command_logger.sh 파일 수정
# 파일 끝에 추가:
tail -n 10000 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
```

## 문제 해결

### 로깅이 작동하지 않는 경우

1. 셸 설정 파일이 올바르게 로드되었는지 확인:
   ```bash
   grep "Tracer" ~/.bashrc  # or ~/.zshrc
   ```

2. 로거 스크립트 실행 권한 확인:
   ```bash
   ls -l ~/.config/tracer/command_logger.sh
   chmod +x ~/.config/tracer/command_logger.sh
   ```

3. 로그 파일 권한 확인:
   ```bash
   ls -l ~/.command_history
   chmod 600 ~/.command_history
   ```

### 중복 로깅

여러 터미널 세션을 열 경우 같은 명령어가 여러 번 기록될 수 있습니다.
이는 정상적인 동작이며, 각 터미널 세션의 명령어가 독립적으로 로깅됩니다.

## 참고 자료

- [bash-preexec](https://github.com/rcaloras/bash-preexec): 고급 명령어 로깅
- [auditd](https://linux.die.net/man/8/auditd): 시스템 레벨 로깅
- [history command](https://www.gnu.org/software/bash/manual/html_node/Bash-History-Facilities.html): Bash 히스토리 기능

