# 파일 감시 디버깅 가이드

## 변경 사항
상세한 로그를 추가했습니다. 다음 정보를 확인할 수 있습니다:

- 🔍 [WATCHER]: 감시 시작 정보
- 📄 [FILE_EVENT]: 파일 이벤트 감지
- ✓/✗ [FILTER]: 파일 패턴 매칭 결과
- 🔍 [DB_LOG]: 데이터베이스 저장 시도
- ✅ [DB_LOG]: 성공 메시지
- ❌ [DB_LOG]: 에러 메시지

## 백엔드 재시작

### 1. 현재 서버 중지
백엔드 터미널에서 `Ctrl+C`

### 2. 재시작
```bash
cd ai-log-backend/app
uvicorn main:app --reload
```

### 3. 로그 확인
시작 시 다음 메시지가 보여야 합니다:
```
Starting AI Log Backend...
🔍 [WATCHER] Starting all active folders...
   Found 1 active folder(s)
🔍 [WATCHER] Starting to watch folder: C:\Users\A93220\Documents\GitHub\hyeonwoo\knowledge
   - Recursive: True
   - File patterns: *.md
✅ [WATCHER] Successfully started watching: C:\Users\A93220\Documents\GitHub\hyeonwoo\knowledge
   - Observer ID: 1
   - Active observers: 1
✅ [WATCHER] Total active observers: 1
```

### 4. 파일 수정 테스트
`ai-knowledge.md` 파일을 수정하면 콘솔에 다음과 같이 표시됩니다:
```
✏️  [FILE_EVENT] File modified: C:\Users\...\ai-knowledge.md
✓ [FILTER] Match: ai-knowledge.md matches pattern *.md
🔍 [DB_LOG] Creating log for modified: ...
✅ [DB_LOG] Successfully saved file change: ai-knowledge.md (modified)
```

## 문제 진단

### 감시가 시작되지 않는 경우
```
Found 0 active folder(s)
```
→ 프론트엔드에서 폴더를 추가하세요.

### 파일 이벤트가 감지되지 않는 경우
- 파일 패턴이 파일과 일치하는지 확인
- ✗ [FILTER] 메시지 확인

### DB 저장 실패
- ❌ [DB_LOG] 에러 메시지 확인
- 트레이스백 확인

## 테스트 방법

1. 백엔드 재시작
2. 파일 수정: `ai-knowledge.md`
3. 콘솔 로그 확인
4. 프론트엔드에서 "File Changes" 탭 확인

