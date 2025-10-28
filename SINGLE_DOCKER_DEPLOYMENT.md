# Single Docker Image Deployment Guide

이 가이드는 Tracer 애플리케이션을 단일 Docker 이미지로 빌드하고 배포하는 방법을 설명합니다.

## 개요

단일 Docker 이미지에는 다음이 포함됩니다:
- **Backend**: FastAPI 서버 (포트 8000)
- **Frontend**: React 애플리케이션 (Nginx로 서빙)
- **Nginx**: 리버스 프록시 및 정적 파일 서빙 (포트 80)
- **Supervisor**: 백엔드와 Nginx를 동시에 관리

## 빌드 및 실행

### 방법 1: Docker Compose 사용 (권장)

```bash
# 단일 서비스로 실행
docker-compose -f docker-compose.single.yml up --build

# 백그라운드 실행
docker-compose -f docker-compose.single.yml up --build -d
```

### 방법 2: 빌드 스크립트 사용

**Linux/Mac:**
```bash
chmod +x build-single.sh
./build-single.sh
```

**Windows:**
```cmd
build-single.bat
```

### 방법 3: 수동 Docker 명령어

```bash
# 이미지 빌드
docker build -t tracer:latest .

# 컨테이너 실행
docker run -d \
  --name tracer-app \
  -p 8091:8091 \
  -v $(pwd)/tracer-backend/data:/app/app/data \
  tracer:latest
```

## 접속 정보

서비스 실행 후 다음 URL로 접속할 수 있습니다:

- **메인 애플리케이션**: http://localhost:8091
- **API 문서**: http://localhost:8091/docs
- **Health Check**: http://localhost:8091/health

## 아키텍처

```
┌─────────────────────────────────────┐
│           Docker Container          │
├─────────────────────────────────────┤
│  Nginx (Port 8091)                  │
│  ├─ Frontend (React SPA)            │
│  └─ API Proxy → Backend             │
├─────────────────────────────────────┤
│  FastAPI Backend (Port 8000)        │
│  ├─ File Watcher Service            │
│  ├─ Command Log API                 │
│  └─ SQLite Database                 │
├─────────────────────────────────────┤
│  Supervisor                         │
│  ├─ nginx process                   │
│  └─ uvicorn process                 │
└─────────────────────────────────────┘
```

## 환경 변수

| 변수명 | 기본값 | 설명 |
|--------|--------|------|
| `DATABASE_URL` | `sqlite:///./data/logs.db` | 데이터베이스 연결 URL |
| `COMMAND_HISTORY_PATH` | `/app/app/data/.command_log.jsonl` | 명령어 로그 파일 경로 |
| `VITE_API_URL` | `http://localhost` | 프론트엔드 API 기본 URL |

## 볼륨 마운트

```yaml
volumes:
  # 데이터 지속성을 위한 데이터 디렉터리
  - ./tracer-backend/data:/app/app/data
  
  # 명령어 로그 파일 (선택사항)
  - ~/.command_log.jsonl:/app/app/data/.command_log.jsonl:ro
```

## 포트 매핑

- **8091**: Nginx (프론트엔드 + API 프록시)
- **8000**: 내부 FastAPI 백엔드 (외부 노출 안됨)

## 로그 확인

```bash
# 전체 로그
docker logs tracer-app

# 실시간 로그
docker logs -f tracer-app

# Supervisor 로그
docker exec tracer-app cat /var/log/supervisor/supervisord.log

# Nginx 로그
docker exec tracer-app cat /var/log/supervisor/nginx.out.log

# Backend 로그
docker exec tracer-app cat /var/log/supervisor/backend.out.log
```

## 컨테이너 관리

```bash
# 컨테이너 중지
docker stop tracer-app

# 컨테이너 재시작
docker restart tracer-app

# 컨테이너 삭제
docker rm tracer-app

# 이미지 삭제
docker rmi tracer:latest
```

## 프로덕션 배포

### 1. 환경별 설정

```bash
# 프로덕션 빌드
docker build -t tracer:prod \
  --build-arg VITE_API_URL=https://your-domain.com .

# 프로덕션 실행
docker run -d \
  --name tracer-prod \
  -p 8091:8091 \
  -v /path/to/data:/app/app/data \
  --restart unless-stopped \
  tracer:prod
```

### 2. Docker Hub 배포

```bash
# 태그 지정
docker tag tracer:latest your-username/tracer:latest

# 푸시
docker push your-username/tracer:latest

# 다른 서버에서 실행
docker run -d \
  --name tracer-app \
  -p 8091:8091 \
  -v ./data:/app/app/data \
  --restart unless-stopped \
  your-username/tracer:latest
```

## 트러블슈팅

### 1. 컨테이너가 시작되지 않는 경우
```bash
docker logs tracer-app
```

### 2. API 요청이 실패하는 경우
- Health check 확인: `curl http://localhost:8091/health`
- Backend 로그 확인: `docker exec tracer-app cat /var/log/supervisor/backend.err.log`

### 3. 프론트엔드가 로드되지 않는 경우
- Nginx 로그 확인: `docker exec tracer-app cat /var/log/supervisor/nginx.err.log`
- 빌드 과정 확인: `docker build --no-cache -t tracer:latest .`

## 장점

1. **단순한 배포**: 하나의 컨테이너로 전체 애플리케이션 실행
2. **포트 통합**: 80번 포트 하나만 노출
3. **내장 프록시**: Nginx가 API 요청을 자동으로 백엔드로 전달
4. **프로세스 관리**: Supervisor가 백엔드와 Nginx를 안정적으로 관리
5. **쉬운 확장**: Docker Swarm이나 Kubernetes에서 쉽게 확장 가능

## 주의사항

1. **개발 환경**: 개발 시에는 여전히 별도 서비스 사용 권장
2. **로그 관리**: 프로덕션에서는 로그 수집 시스템 구성 필요
3. **데이터 백업**: 볼륨 마운트된 데이터 디렉터리 정기 백업 필요
