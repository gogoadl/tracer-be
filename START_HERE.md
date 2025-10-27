# 🚀 Quick Start Guide
ㅁㄴㅇㅁㄴ
## 실행 방법 (Windows)

### 백엔드 시작

**옵션 1: 스크립트 사용**
```bash
cd ai-log-backend
.\start_backend.bat
```

**옵션 2: 수동 실행**
```bash
cd ai-log-backend
.\venv\Scripts\Activate.ps1
python setup_sample_data.py  # 첫 실행 시
cd app
uvicorn main:app --reload
```

백엔드가 http://localhost:8000 에서 실행됩니다.

### 프론트엔드 시작

새 터미널에서:
```bash
cd tracer-fe/tracer-fe
npm install   # 첫 실행 시
npm run dev
```

프론트엔드가 http://localhost:5173 에서 실행됩니다.

## 확인

1. **API 문서**: http://localhost:8000/docs
2. **프론트엔드**: http://localhost:5173
3. **백엔드 상태**: http://localhost:8000/health

## 샘플 데이터

백엔드는 자동으로 `~/.command_history`에서 데이터를 로드합니다.
샘플 데이터는 `setup_sample_data.py`를 실행하면 로드됩니다.

## 전체 가이드

더 자세한 내용은 `INTEGRATION_GUIDE.md`를 참조하세요.

