# 🔧 DB 경로 불일치 문제 해결

## 문제
- `main.py`: `ai-log-backend/data/logs.db` (15 records) 사용
- `file_watcher.py`: `ai-log-backend/app/data/logs.db` (0 records) 사용
- 두 파일이 서로 다른 DB를 사용해서 데이터가 분리됨

## 해결
- `file_watcher.py`를 `main.py`와 동일한 절대 경로로 수정

## 변경사항
```python
# 이전
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/logs.db")

# 이후 (main.py와 동일)
_db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "logs.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{_db_path}")
```

## 백엔드 재시작
1. Ctrl+C로 백엔드 중지
2. 재시작
3. 로그에서 "🔗 [FILE_WATCHER] Using database: ..." 확인
4. 경로가 `ai-log-backend/data/logs.db`인지 확인

## 테스트
1. 파일 수정
2. 로그 확인: "💾 DB Verified: Found record"
3. Swagger에서 조회: http://localhost:8000/docs

이제 DB 경로가 통일되어 정상 작동합니다!

