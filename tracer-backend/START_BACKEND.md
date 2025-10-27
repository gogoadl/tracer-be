# 🚀 백엔드 서버 시작하기

## 문제
- 백엔드 서버가 실행 중이지 않음
- watcher 서비스가 시작되지 않음
- 파일 이벤트가 감지되지 않음

## 해결 방법

### 1. 백엔드 서버 시작

**새 터미널 창에서:**

```bash
cd ai-log-backend/app
uvicorn main:app --reload --port 8000
```

### 2. 백엔드 로그 확인

다음과 같은 로그가 표시되어야 합니다:

```
Starting AI Log Backend...
🔍 [WATCHER] Starting all active folders...
   Found 1 active folder(s)
🔍 [WATCHER] Starting to watch folder: C:\Users\A93220\Documents\GitHub\hyeonwoo\knowledge
   - Recursive: True
   - File patterns: None
✅ [WATCHER] Successfully started watching: ...
✅ [WATCHER] Total active observers: 1

INFO:     Uvicorn running on http://127.0.0.1:8000
```

### 3. 파일 수정 테스트

1. 다른 터미널 창을 열어서:
   ```bash
   # 테스트 파일 수정
   echo "test" >> "C:\Users\A93220\Documents\GitHub\hyeonwoo\knowledge\test.txt"
   ```
   
   또는 Windows 탐색기에서 `ai-knowledge.md` 파일을 수정

2. 백엔드 로그에서 확인:
   ```
   ✏️  [FILE_EVENT] File modified: C:\Users\...\ai-knowledge.md
   ✅ [DB_LOG] Successfully saved file change: ai-knowledge.md (modified)
   ```

### 4. 프론트엔드 확인

http://localhost:5173 → "🔄 File Changes" 탭에서 확인

## 백엔드가 정상 실행 중이면

- 파일을 수정하면 자동으로 감지되고 DB에 저장됩니다
- 프론트엔드에서 즉시 조회 가능합니다

