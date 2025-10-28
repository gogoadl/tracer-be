# Docker 빌드 문제 해결 가이드

## 문제: nginx와 dist 폴더가 없음

Docker 빌드 후 결과물에 nginx와 dist 폴더가 없는 경우 다음 단계를 따라 문제를 해결하세요.

## 1. 빌드 테스트

먼저 테스트 스크립트를 실행하여 빌드 과정을 확인하세요:

```bash
# Linux/Mac
chmod +x test-build.sh
./test-build.sh

# Windows
test-build.bat
```

## 2. 수동 빌드 및 검증

### 단계별 빌드 확인

```bash
# 1. 프론트엔드만 빌드 테스트
docker build --target frontend-build -t tracer-frontend-test .

# 2. 프론트엔드 빌드 결과 확인
docker run --rm tracer-frontend-test ls -la /frontend/dist/

# 3. 전체 빌드
docker build -t tracer-test . --no-cache

# 4. 최종 이미지 내용 확인
docker run --rm tracer-test ls -la /usr/share/nginx/html/
docker run --rm tracer-test ls -la /app/app/
docker run --rm tracer-test nginx -t
```

## 3. 일반적인 문제와 해결책

### 문제 1: 프론트엔드 빌드 실패

**증상**: `npm run build` 실패
**해결책**:
```bash
# 로컬에서 프론트엔드 빌드 테스트
cd tracer-frontend
npm install
npm run build
ls -la dist/
```

### 문제 2: 파일 복사 실패

**증상**: COPY 명령어 실패
**해결책**:
```bash
# 파일 구조 확인
ls -la tracer-frontend/
ls -la tracer-backend/
```

### 문제 3: nginx 설정 오류

**증상**: nginx 시작 실패
**해결책**:
```bash
# nginx 설정 테스트
docker run --rm tracer-test nginx -t
```

## 4. 디버깅 명령어

### 빌드 과정 상세 로그
```bash
docker build -t tracer-test . --no-cache --progress=plain
```

### 중간 단계 이미지 확인
```bash
# 프론트엔드 빌드 단계만
docker build --target frontend-build -t tracer-frontend .
docker run --rm -it tracer-frontend sh

# 최종 이미지
docker run --rm -it tracer-test bash
```

### 실행 중인 컨테이너 디버깅
```bash
# 컨테이너 실행
docker run -d --name tracer-debug -p 8091:8091 tracer-test

# 컨테이너 내부 확인
docker exec -it tracer-debug bash

# 로그 확인
docker logs tracer-debug
```

## 5. 수정된 Dockerfile 주요 변경사항

1. **검증 명령어 추가**: 각 단계에서 파일이 제대로 복사되었는지 확인
2. **nginx 설정 순서 변경**: 기본 설정 삭제 후 새 설정 생성
3. **supervisor 설정 방식 변경**: COPY 대신 RUN cat 사용

## 6. 빌드 성공 확인

빌드가 성공하면 다음과 같은 출력을 볼 수 있어야 합니다:

```
# 프론트엔드 빌드 결과
total 12
drwxr-xr-x 3 root root 4096 ... .
drwxr-xr-x 3 root root 4096 ... ..
-rw-r--r-- 1 root root  xxx ... index.html
drwxr-xr-x 2 root root 4096 ... assets

# nginx 설정 테스트
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

## 7. 최종 실행 테스트

```bash
# 컨테이너 실행
docker run -d --name tracer-app -p 8091:8091 tracer-test

# 서비스 확인
curl http://localhost:8091/health
curl http://localhost:8091/

# 정리
docker stop tracer-app
docker rm tracer-app
```

## 8. 문제가 지속되는 경우

1. **Docker 버전 확인**: `docker --version`
2. **디스크 공간 확인**: `docker system df`
3. **캐시 정리**: `docker system prune -a`
4. **로그 확인**: 빌드 과정의 모든 출력을 저장하여 분석

## 9. 대안 방법

문제가 계속 발생하는 경우, 기존의 분리된 docker-compose.yml을 사용하세요:

```bash
docker-compose up --build
```

이 방법은 백엔드와 프론트엔드를 별도 컨테이너로 실행하므로 더 안정적입니다.
