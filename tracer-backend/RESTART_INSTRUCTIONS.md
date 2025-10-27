# 파일 감시 기능 재시작 가이드

## 문제 해결: 파일 변경이 감지되지 않음

### 증상
- 폴더를 추가했지만 파일 변경이 감지되지 않음
- 차트에 데이터가 표시되지 않음

### 해결 방법

#### 1. 백엔드 서버 재시작 (필수)

```bash
# 현재 실행 중인 서버 중지 (Ctrl+C)
# 새로 시작
cd ai-log-backend/app
uvicorn main:app --reload
```

#### 2. 폴더 다시 추가

백엔드가 재시작되면:
1. 프론트엔드에서 기존 폴더 제거
2. 폴더 다시 추가
3. 이제 실시간 감시 시작됨

#### 3. 테스트

1. `C:\Users\A93220\Documents\GitHub\hyeonwoo\knowledge` 폴더 추가
2. `ai-knowledge.md` 파일 수정
3. 변경사항 감지 확인
4. 차트에서 변경 내역 확인

### 디버깅

#### 로그 확인
백엔드 콘솔에서 다음 메시지를 확인하세요:
```
Started watching folder: C:\Users\A93220\Documents\GitHub\hyeonwoo\knowledge
File created: C:\Users\A93220\Documents\GitHub\hyeonwoo\knowledge\ai-knowledge.md
```

#### 데이터베이스 확인
```bash
# SQLite 데이터베이스 확인
cd ai-log-backend
sqlite3 data/logs.db "SELECT * FROM file_changes ORDER BY timestamp DESC LIMIT 10;"
```

### API 테스트

```bash
# 폴더 목록 확인
curl http://localhost:8000/api/folders

# 파일 변경 내역 확인
curl http://localhost:8000/api/changes?limit=10

# 통계 확인
curl http://localhost:8000/api/changes/stats
```

### 주의사항

1. **서버 재시작 필수**: 폴더 추가 후 서버를 재시작했어야 감시 시작됨
2. **이제는 즉시 시작**: 폴더 추가 시 자동으로 감시 시작
3. **실시간 감지**: 파일 변경 시 즉시 데이터베이스에 저장
4. **콘솔 로그**: 감시 시작 및 파일 변경 이벤트가 콘솔에 출력됨

