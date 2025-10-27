# Tracer - 빠른 시작 가이드

Tracer는 리눅스 시스템의 명령어와 파일 변경사항을 추적하고 시각화하는 도구입니다.

## 🚀 5분 완성 설치

### 1단계: 저장소 클론

```bash
git clone <repository-url>
cd tracer-be/tracer-be
```

### 2단계: 백엔드 설치

```bash
cd tracer-backend

# 가상환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\Activate.ps1  # Windows

# 의존성 설치
pip install -r requirements.txt
```

### 3단계: 명령어 로거 설치 (리눅스만)

```bash
chmod +x install_logger.sh
./install_logger.sh
```

이제 터미널에서 실행한 모든 명령어가 자동으로 로깅됩니다!

### 4단계: 백엔드 시작

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

### 5단계: 프론트엔드 시작

새 터미널에서:
```bash
cd ../tracer-frontend
npm install
npm run dev
```

프론트엔드는 `http://localhost:5173`에서 실행됩니다.

### 완료! 🎉

브라우저에서 `http://localhost:5173`을 열고 대시보드를 확인하세요.

## 📊 대시보드 사용법

### 1. 명령어 로그 보기

1. 왼쪽 사이드바에서 "커맨드 로그" 클릭
2. 날짜 선택 드롭다운에서 원하는 날짜 선택
3. 명령어 목록과 AI 요약 확인

### 2. 파일 변경 추적

1. "파일 워처" 메뉴로 이동
2. "추가" 버튼 클릭하여 폴더 추가
3. 파일 수정하면 자동으로 감지됨
4. "파일 변경사항" 메뉴에서 변경 내역 확인

### 3. 차트 보기

"대시보드" 메뉴에서:
- 명령어 통계 차트
- 파일 변경 통계 차트
- 시간별 활동 추이

## 🔍 실전 예제

### 예제 1: 프로젝트 폴더 모니터링

```bash
# Dashboard → File Watcher → + Folder
# 경로: /home/user/my-project
# 파일 패턴: *.py,*.js,*.md
# 재귀: 켜기
```

이제 `my-project` 폴더의 Python, JavaScript, Markdown 파일이 변경될 때마다 추적됩니다.

### 예제 2: Git 작업 추적

```bash
# 터미널에서 작업
cd ~/my-project
git status
git add .
git commit -m "Update features"
git push
```

대시보드의 "커맨드 로그"에서 이 명령어들을 모두 확인할 수 있습니다.

### 예제 3: Diff 보기

```bash
# 파일 수정
nano ~/my-project/main.py
# 내용 변경 후 저장
```

대시보드 → "파일 변경사항" → 변경된 파일 클릭 → Diff 뷰에서 변경 내용 확인

## 💡 유용한 팁

### 1. 로그 확인

터미널에서 실시간 로그 확인:
```bash
tail -f ~/.command_history
```

### 2. 특정 명령어 검색

```bash
# Git 명령어만
grep "git" ~/.command_history

# 특정 날짜
grep "2025-01-15" ~/.command_history
```

### 3. 로그 크기 관리

자동으로 마지막 10,000줄만 유지되도록 설정되어 있습니다.
로그 위치: `~/.command_history`

## 🛠️ 문제 해결

### 명령어가 로깅되지 않음

```bash
# 설정 리로드
source ~/.bashrc  # or ~/.zshrc

# 또는 새 터미널 열기
```

### 파일 변경이 감지되지 않음

1. 파일 워처가 활성화되어 있는지 확인
2. 경로가 올바른지 확인
3. 백엔드 재시작: `Ctrl+C` 후 `.\start_backend.bat` (Windows) 또는 `./run.sh` (Linux/Mac)

### 프론트엔드 연결 안 됨

백엔드가 실행 중인지 확인:
```bash
curl http://localhost:8000/health
# {"status":"healthy"} 응답이 나와야 함
```

## 📚 더 알아보기

- [전체 설치 가이드](./INSTALLATION_GUIDE.md)
- [명령어 로거 가이드](./tracer-backend/README_COMMAND_LOGGER.md)
- [API 문서](http://localhost:8000/docs)

## 🎯 다음 단계

1. **파일 추적 시작**: 대시보드에서 중요한 폴더 추가
2. **애널리틱스 확인**: 대시보드에서 활동 패턴 분석
3. **Diff 기능 활용**: 코드 변경 내역 상세 추적

행운을 빕니다! 🚀

