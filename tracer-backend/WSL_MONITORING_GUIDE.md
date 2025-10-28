# WSL 파일 모니터링 가이드

## 문제
WSL 경로 (`\\wsl.localhost\Ubuntu\...`)는 Python watchdog 라이브러리와 호환성 문제가 있어 파일 변경 감지가 되지 않습니다.

## 대안 방법

### 1. Windows 경로를 통한 WSL 파일 접근
WSL 파일을 Windows 경로로 접근하여 모니터링:

```bash
# WSL 내에서 Windows 경로 확인
pwd
# 예: /home/username/project

# Windows에서 해당 경로
# C:\Users\[사용자명]\AppData\Local\Packages\CanonicalGroupLimited.Ubuntu_...\LocalState\rootfs\home\username\project
```

### 2. 심볼릭 링크 사용
Windows에서 WSL 디렉터리로의 심볼릭 링크 생성:

```cmd
# 관리자 권한으로 실행
mklink /D C:\wsl-home \\wsl.localhost\Ubuntu\home\a93220
```

그 후 `C:\wsl-home` 경로를 모니터링

### 3. WSL 내부에서 모니터링
WSL 내부에서 별도의 파일 모니터링 스크립트 실행:

```bash
# WSL 내부에서 inotify 사용
sudo apt-get install inotify-tools

# 파일 변경 감지 스크립트
inotifywait -m -r -e create,modify,delete /home/a93220 --format '%w%f %e %T' --timefmt '%Y-%m-%d %H:%M:%S'
```

### 4. 폴링 방식 모니터링
주기적으로 파일 상태를 확인하는 방식:

```python
import os
import time
from pathlib import Path

def poll_directory(path, interval=5):
    """폴링 방식으로 디렉터리 변경 감지"""
    last_modified = {}
    
    while True:
        for file_path in Path(path).rglob("*"):
            if file_path.is_file():
                current_mtime = file_path.stat().st_mtime
                if str(file_path) not in last_modified:
                    last_modified[str(file_path)] = current_mtime
                    print(f"New file: {file_path}")
                elif last_modified[str(file_path)] != current_mtime:
                    last_modified[str(file_path)] = current_mtime
                    print(f"Modified: {file_path}")
        
        time.sleep(interval)
```

## 권장 사항
현재는 **Windows 네이티브 경로만 사용**하는 것을 권장합니다. WSL 파일을 모니터링해야 하는 경우 위의 대안 방법 중 하나를 선택하여 구현하세요.

## 현재 상태
- ❌ WSL 경로 직접 모니터링: 비활성화됨
- ✅ Windows 경로 모니터링: 정상 작동
- ✅ File Changes 화면: Windows 파일 변경사항 표시됨
