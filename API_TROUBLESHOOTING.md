# API 응답 문제 해결 가이드

## 문제: 웹사이트 접근 시 API 응답을 받지 못함

Docker 컨테이너는 실행되지만 API 요청이 실패하는 경우의 해결 방법입니다.

## 1. 즉시 확인 사항

### 컨테이너 상태 확인
```bash
# 컨테이너가 실행 중인지 확인
docker ps | grep tracer-app

# 컨테이너 로그 확인
docker logs tracer-app --tail 50
```

### 서비스 응답 테스트
```bash
# 직접 API 테스트
curl http://localhost:8091/health
curl http://localhost:8091/api/logs

# 브라우저에서 확인
# http://localhost:8091
# http://localhost:8091/docs
```

## 2. 일반적인 원인과 해결책

### 원인 1: 백엔드 서비스가 시작되지 않음

**확인 방법:**
```bash
docker exec tracer-app ps aux | grep uvicorn
docker exec tracer-app curl http://localhost:8000/health
```

**해결책:**
```bash
# 컨테이너 재시작
docker restart tracer-app

# 또는 완전히 다시 빌드
docker stop tracer-app
docker rm tracer-app
./build-single.sh
```

### 원인 2: Nginx 프록시 설정 문제

**확인 방법:**
```bash
docker exec tracer-app nginx -t
docker exec tracer-app curl http://localhost:8091/health
```

**해결책:** Dockerfile의 nginx 설정 확인 및 수정

### 원인 3: 포트 바인딩 문제

**확인 방법:**
```bash
docker port tracer-app
netstat -an | grep 8091
```

**해결책:**
```bash
# 포트가 이미 사용 중인 경우
sudo lsof -i :8091
# 해당 프로세스 종료 후 재시작
```

### 원인 4: 방화벽 또는 네트워크 문제

**확인 방법:**
```bash
# 로컬 접근 테스트
curl http://127.0.0.1:8091/health
curl http://localhost:8091/health

# 네트워크 인터페이스 확인
docker exec tracer-app netstat -tlnp
```

## 3. 디버그 스크립트 실행

자동 진단을 위해 디버그 스크립트를 실행하세요:

```bash
# Linux/Mac
chmod +x debug-api.sh
./debug-api.sh

# Windows
debug-api.bat
```

## 4. 단계별 수동 디버깅

### 1단계: 컨테이너 내부 확인
```bash
docker exec -it tracer-app bash

# 내부에서 서비스 확인
ps aux
curl http://localhost:8000/health  # 백엔드 직접 테스트
curl http://localhost:8091/health  # nginx 프록시 테스트
exit
```

### 2단계: 로그 분석
```bash
# Supervisor 로그
docker exec tracer-app cat /var/log/supervisor/supervisord.log

# Nginx 로그
docker exec tracer-app cat /var/log/supervisor/nginx.err.log
docker exec tracer-app cat /var/log/supervisor/nginx.out.log

# 백엔드 로그
docker exec tracer-app cat /var/log/supervisor/backend.err.log
docker exec tracer-app cat /var/log/supervisor/backend.out.log
```

### 3단계: 설정 파일 확인
```bash
# Nginx 설정 확인
docker exec tracer-app cat /etc/nginx/conf.d/default.conf

# Supervisor 설정 확인
docker exec tracer-app cat /etc/supervisor/conf.d/supervisord.conf
```

## 5. 일반적인 오류 메시지와 해결책

### "Connection refused"
- 백엔드 서비스가 시작되지 않음
- 포트 바인딩 실패
- 방화벽 차단

**해결책:**
```bash
docker restart tracer-app
# 또는
docker stop tracer-app && docker rm tracer-app
./build-single.sh
```

### "502 Bad Gateway"
- Nginx는 실행되지만 백엔드에 연결할 수 없음
- 백엔드 포트 8000이 열리지 않음

**해결책:**
```bash
docker exec tracer-app curl http://localhost:8000/health
# 응답이 없으면 백엔드 재시작 필요
```

### "404 Not Found"
- API 경로 문제
- Nginx 프록시 설정 오류

**해결책:** nginx 설정에서 location 블록 확인

## 6. 프론트엔드 API 설정 확인

프론트엔드가 올바른 API URL을 사용하는지 확인:

```bash
# 브라우저 개발자 도구에서 Network 탭 확인
# API 요청이 올바른 URL로 가는지 확인
# 예: http://localhost:8091/api/logs
```

## 7. 대안 해결책

### 방법 1: 분리된 컨테이너 사용
```bash
# 단일 컨테이너 대신 분리된 방식 사용
docker-compose up --build
```

### 방법 2: 로컬 개발 환경
```bash
# 백엔드 로컬 실행
cd tracer-backend
python -m uvicorn app.main:app --reload --port 8000

# 프론트엔드 로컬 실행 (다른 터미널)
cd tracer-frontend
npm run dev
```

### 방법 3: 포트 변경
```bash
# 다른 포트로 실행
docker run -d --name tracer-app -p 8092:8091 tracer:latest
# http://localhost:8092 로 접근
```

## 8. 성공적인 실행 확인

다음 명령어들이 모두 성공해야 합니다:

```bash
curl http://localhost:8091/health          # 200 OK
curl http://localhost:8091/api/logs        # JSON 응답
curl http://localhost:8091/docs            # HTML 응답 (API 문서)
```

브라우저에서 http://localhost:8091 접근 시 React 애플리케이션이 로드되어야 합니다.

## 9. 추가 도움

문제가 지속되는 경우:
1. `debug-api.sh` 스크립트 결과를 확인
2. 모든 로그를 수집하여 분석
3. 네트워크 및 방화벽 설정 확인
4. Docker 버전 및 시스템 리소스 확인
