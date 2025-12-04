# Tracer

Tracer는 리눅스 시스템의 셸 명령어 로그와 파일 변경사항을 추적하고 분석하는 통합 모니터링 시스템입니다.

## 📋 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [빠른 시작](#빠른-시작)
- [설치 방법](#설치-방법)
- [사용 방법](#사용-방법)
- [Docker 배포](#docker-배포)
- [API 문서](#api-문서)
- [프로젝트 구조](#프로젝트-구조)
- [트러블슈팅](#트러블슈팅)
- [기여하기](#기여하기)

## ✨ 주요 기능

### 📝 명령어 로깅
- **자동 명령어 추적**: 리눅스 시스템에서 실행된 모든 셸 명령어를 자동으로 로깅
- **스마트 파싱**: 명령어, 사용자, 디렉토리, 타임스탬프 자동 추출
- **검색 및 필터링**: 날짜, 사용자, 키워드로 명령어 검색
- **통계 및 분석**: 명령어 사용 패턴 분석 및 시각화

### 📁 파일 변경 감시
- **실시간 파일 모니터링**: 지정된 디렉토리의 파일 변경사항 실시간 감지
- **다양한 이벤트 추적**: 파일 생성, 수정, 삭제, 이동 이벤트 추적
- **패턴 필터링**: 파일 확장자 및 패턴 기반 필터링 지원
- **재귀적 감시**: 하위 디렉토리까지 자동 감시

### 📊 데이터 시각화
- **대시보드**: 명령어 및 파일 변경 통계를 한눈에 확인
- **인터랙티브 차트**: 
  - 명령어 사용 통계 차트
  - 파일 변경 추이 라인 차트
  - 이벤트 타입별 파이 차트
  - 파일 확장자별 막대 차트
- **날짜별 필터링**: 7일, 14일, 30일, 1년 단위 분석

### 🌐 사용자 인터페이스
- **모던한 UI**: React 기반 반응형 웹 인터페이스
- **다크 모드**: 눈에 편안한 다크/라이트 테마 지원
- **다국어 지원**: 한국어/영어 자동 전환
- **실시간 업데이트**: WebSocket을 통한 실시간 데이터 업데이트

## 🛠 기술 스택

### Backend
- **Spring Boot 3.3.0**: Java 기반 웹 프레임워크
- **Java 17**: 프로그래밍 언어
- **Gradle**: 빌드 도구
- **Spring Data JPA**: 데이터 접근 계층
- **SQLite**: 경량 데이터베이스
- **Hibernate**: ORM 프레임워크

### Frontend
- **React 18**: UI 라이브러리
- **Vite**: 빌드 도구 및 개발 서버
- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **Recharts**: 차트 라이브러리
- **Axios**: HTTP 클라이언트

### DevOps
- **Docker**: 컨테이너화
- **Docker Compose**: 멀티 컨테이너 오케스트레이션
- **Nginx**: 리버스 프록시 및 정적 파일 서빙
- **Supervisor**: 프로세스 관리

## 🚀 빠른 시작

### Docker를 사용한 빠른 시작 (권장)

가장 간단한 방법으로 Tracer를 실행할 수 있습니다:

```bash
# 1. 이미지 빌드
./build-single.sh    # Linux/Mac
build-single.bat     # Windows

# 2. 애플리케이션 실행
./run-single.sh      # Linux/Mac
run-single.bat       # Windows
```

서비스가 실행되면 다음 URL로 접속하세요:
- **메인 애플리케이션**: http://localhost:8091
- **API 문서**: http://localhost:8091/docs
- **Health Check**: http://localhost:8091/health

자세한 내용은 [SINGLE_DOCKER_DEPLOYMENT.md](./SINGLE_DOCKER_DEPLOYMENT.md)를 참조하세요.

## 📦 설치 방법

### 사전 요구사항

- **Java 25+**
- **Gradle Wrapper** (프로젝트에 포함되어 있음, 별도 설치 불필요)
  - 또는 시스템에 **Gradle 8.10+** 설치
- **Node.js 18+** 및 npm
- **Docker** 및 Docker Compose (Docker 배포 시)
- **Git**

### 수동 설치

#### 1. 저장소 클론

```bash
git clone <repository-url>
cd tracer-be/tracer-be
```

#### 2. Backend 설정

```bash
cd tracer-backend

# Gradle Wrapper를 사용하여 빌드 (권장)
# Windows:
.\gradlew.bat build

# Linux/Mac:
chmod +x gradlew
./gradlew build

# 또는 시스템에 설치된 Gradle 사용
gradle build
```

#### 3. 명령어 로거 설치 (리눅스만)

리눅스 시스템에서 자동 명령어 로깅을 설정:

```bash
chmod +x install_logger.sh
./install_logger.sh
```

이 스크립트는:
- `~/.command_log.jsonl` 파일 생성
- Shell 설정 파일(`~/.bashrc` 또는 `~/.zshrc`)에 로깅 스크립트 추가
- 백엔드가 자동으로 이 파일을 읽어서 데이터베이스에 저장

#### 4. Backend 실행

**로컬 개발 모드 (H2 인메모리 데이터베이스 사용 - 권장):**

로컬 개발 시 H2 인메모리 데이터베이스를 사용하면 별도의 데이터베이스 파일 없이 빠르게 개발할 수 있습니다.

**Windows:**
```bash
.\gradlew.bat bootRun --args='--spring.profiles.active=local'
```

**Linux/Mac:**
```bash
./gradlew bootRun --args='--spring.profiles.active=local'
```

또는 환경 변수로 설정:
```bash
# Windows (PowerShell)
$env:SPRING_PROFILES_ACTIVE="local"
.\gradlew.bat bootRun

# Linux/Mac
export SPRING_PROFILES_ACTIVE=local
./gradlew bootRun
```

**프로덕션 모드 (SQLite 사용):**
```bash
# Windows
.\gradlew.bat bootRun

# Linux/Mac
./gradlew bootRun
```

또는 빌드 후 실행:
```bash
# 빌드
./gradlew build

# JAR 파일 실행 (로컬 프로파일)
java -jar build/libs/tracer-backend-1.0.0.jar --spring.profiles.active=local

# JAR 파일 실행 (기본 SQLite)
java -jar build/libs/tracer-backend-1.0.0.jar
```

Backend가 `http://localhost:8080`에서 실행됩니다.

**참고:** 로컬 프로파일 사용 시 H2 콘솔이 http://localhost:8080/h2-console 에서 제공됩니다.

#### 5. Frontend 설정

새 터미널에서:

```bash
cd tracer-frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

Frontend가 `http://localhost:5173`에서 실행됩니다.

자세한 설치 가이드는 [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)를 참조하세요.

## 📖 사용 방법

### 명령어 로그 보기

1. 브라우저에서 `http://localhost:8091` (Docker) 또는 `http://localhost:5173` (개발 모드) 접속
2. 왼쪽 사이드바에서 "Command Logs" 또는 "커맨드 로그" 클릭
3. 날짜 선택 드롭다운에서 원하는 날짜 선택
4. 명령어 목록과 통계 확인

### 파일 변경 추적

1. "File Watcher" 또는 "파일 워처" 메뉴로 이동
2. "Add Folder" 버튼 클릭하여 감시할 폴더 추가
3. 파일 패턴 지정 (예: `*.yml,*.conf,*.json`)
4. "Watch subdirectories" 체크하여 하위 폴더 포함
5. 파일 변경 시 자동으로 감지되어 데이터베이스에 저장

### 대시보드

"Dashboard" 메뉴에서:
- 명령어 통계 차트
- 파일 변경 통계 차트
- 시간별 활동 추이
- 기간별 필터링 (7일, 14일, 30일, 1년)

### 파일 변경 내역 보기

1. "File Changes" 또는 "파일 변경사항" 메뉴로 이동
2. 날짜별로 그룹화된 파일 변경 내역 확인
3. 파일별 상세 변경 내역 및 Diff 보기

자세한 사용 가이드는 [GETTING_STARTED.md](./GETTING_STARTED.md)를 참조하세요.

## 🐳 Docker 배포

### 단일 Docker 이미지 배포

Tracer는 백엔드와 프론트엔드를 하나의 Docker 이미지로 통합하여 배포할 수 있습니다.

```bash
# 이미지 빌드
docker build -t tracer:latest .

# Docker Compose로 실행
docker-compose -f docker-compose.single.yml up -d

# 로그 확인
docker-compose -f docker-compose.single.yml logs -f
```

**아키텍처:**
```
┌─────────────────────────────────────┐
│       Docker Container             │
├─────────────────────────────────────┤
│  Nginx (Port 8091)                 │
│  ├─ Frontend (React SPA)           │
│  └─ API Proxy → Backend             │
├─────────────────────────────────────┤
│  Spring Boot Backend (Port 8000)   │
│  ├─ File Watcher Service           │
│  ├─ Command Log API                │
│  └─ SQLite Database                │
├─────────────────────────────────────┤
│  Supervisor                        │
│  ├─ nginx process                  │
│  └─ java process                   │
└─────────────────────────────────────┘
```

자세한 내용은 [SINGLE_DOCKER_DEPLOYMENT.md](./SINGLE_DOCKER_DEPLOYMENT.md)를 참조하세요.

### 환경 변수

| 변수명 | 기본값 | 설명 |
|--------|--------|------|
| `SPRING_DATASOURCE_URL` | `jdbc:sqlite:./data/logs.db` | 데이터베이스 연결 URL |
| `DATABASE_URL` | `jdbc:sqlite:./data/logs.db` | 데이터베이스 연결 URL (호환성) |
| `COMMAND_HISTORY_PATH` | `/app/data/.command_log.jsonl` | 명령어 로그 파일 경로 |
| `VITE_API_URL` | `http://localhost` | 프론트엔드 API 기본 URL |
| `SERVER_PORT` | `8000` | 백엔드 서버 포트 |

### 볼륨 마운트

```yaml
volumes:
  # 데이터 지속성을 위한 데이터 디렉터리
  - ./tracer-backend/data:/app/data
  
  # 명령어 로그 파일 (선택사항)
  - ~/.command_log.jsonl:/app/data/.command_log.jsonl:ro
  
  # 호스트 파일시스템 접근 (파일 감시용)
  - .:/host/current
  - ${HOME}:/host/home
  - /:/host/root
```

## 📡 API 문서

### Swagger UI

애플리케이션 실행 후 다음 URL에서 인터랙티브 API 문서를 확인할 수 있습니다:

- **Swagger UI**: http://localhost:8091/swagger-ui.html (Docker) 또는 http://localhost:8080/swagger-ui.html (로컬)
- **OpenAPI JSON**: http://localhost:8091/api-docs (Docker) 또는 http://localhost:8080/api-docs (로컬)

Swagger UI를 통해:
- 모든 API 엔드포인트 확인
- 요청/응답 스키마 확인
- 직접 API 테스트 (Try it out 기능)
- 요청 예제 확인

### 주요 엔드포인트

#### 명령어 로그
- `GET /api/logs` - 로그 조회 (필터링 지원)
- `GET /api/logs/by-date` - 날짜별 그룹화된 로그
- `GET /api/logs/stats` - 통계 정보
- `GET /api/logs/date/{date}` - 특정 날짜 로그
- `POST /api/logs/refresh` - 로그 파일 새로고침

#### 파일 감시
- `GET /api/folders` - 감시 중인 폴더 목록
- `POST /api/folders/add` - 폴더 추가
- `DELETE /api/folders/{id}` - 폴더 제거
- `POST /api/folders/{id}/toggle` - 활성화/비활성화

#### 파일 변경 내역
- `GET /api/changes` - 파일 변경 내역 조회
- `GET /api/changes/by-date` - 날짜별 통계
- `GET /api/changes/stats` - 전체 통계
- `GET /api/changes/date/{date}` - 특정 날짜 변경 내역

#### 헬스 체크
- `GET /health` - 서비스 상태 확인

### API 문서 접속

서비스 실행 후 다음 URL에서 API를 확인할 수 있습니다:
- **API Base**: http://localhost:8091/api
- **Swagger UI**: http://localhost:8091/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8091/api-docs
- **Health Check**: http://localhost:8091/health

### 예제 요청

```bash
# 모든 로그 조회
curl http://localhost:8091/api/logs

# 날짜 범위로 필터링
curl "http://localhost:8091/api/logs?start_date=2025-01-01&end_date=2025-01-31"

# 키워드 검색
curl "http://localhost:8091/api/logs?search=git"

# 통계 조회
curl http://localhost:8091/api/logs/stats

# 폴더 추가
curl -X POST "http://localhost:8091/api/folders/add?path=/host/current&recursive=true"
```

## 📁 프로젝트 구조

```
tracer-be/
├── tracer-backend/          # Backend 서비스
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/tracer/
│   │   │   │   ├── TracerApplication.java  # Spring Boot 메인 클래스
│   │   │   │   ├── controller/             # REST 컨트롤러
│   │   │   │   │   ├── LogsController.java
│   │   │   │   │   ├── FileWatchController.java
│   │   │   │   │   └── HealthController.java
│   │   │   │   ├── service/                # 비즈니스 로직
│   │   │   │   ├── repository/            # 데이터 접근 계층
│   │   │   │   ├── entity/                 # 엔티티 모델
│   │   │   │   └── config/                 # 설정 클래스
│   │   │   └── resources/                  # 설정 파일
│   │   └── test/                           # 테스트 코드
│   ├── data/                # 데이터 디렉터리
│   ├── build.gradle         # Gradle 빌드 설정
│   ├── settings.gradle      # Gradle 프로젝트 설정
│   └── README.md            # Backend README
│
├── tracer-frontend/         # Frontend 애플리케이션
│   ├── src/
│   │   ├── components/      # React 컴포넌트
│   │   │   ├── LogEntry.jsx
│   │   │   ├── FileWatcher.jsx
│   │   │   ├── FileChangeChart.jsx
│   │   │   └── ...
│   │   ├── contexts/        # React Context
│   │   ├── i18n/            # 다국어 번역
│   │   ├── App.jsx          # 메인 컴포넌트
│   │   └── api.js           # API 클라이언트
│   ├── package.json         # Node.js 의존성
│   ├── Dockerfile           # Frontend Dockerfile
│   └── README.md            # Frontend README
│
├── Dockerfile               # 통합 Docker 이미지
├── docker-compose.single.yml # 단일 이미지 배포 설정
├── docker-compose.yml       # 멀티 컨테이너 배포 설정
├── run-single.sh            # 단일 이미지 실행 스크립트
├── build-single.sh          # 단일 이미지 빌드 스크립트
└── README.md                # 프로젝트 README (이 파일)
```

## 🔧 트러블슈팅

### 컨테이너가 시작되지 않는 경우

```bash
# 로그 확인
docker logs tracer-app

# 컨테이너 상태 확인
docker ps -a
```

### API 요청이 실패하는 경우

1. Health check 확인:
   ```bash
   curl http://localhost:8091/health
   ```

2. Backend 로그 확인:
   ```bash
   docker exec tracer-app cat /var/log/supervisor/backend.err.log
   ```

3. Nginx 로그 확인:
   ```bash
   docker exec tracer-app cat /var/log/supervisor/nginx.err.log
   ```

### 프론트엔드가 로드되지 않는 경우

1. 브라우저 캐시 삭제 (Ctrl+Shift+R 또는 Cmd+Shift+R)
2. 브라우저 개발자 도구의 Network 탭 확인
3. 요청이 `:8091`로 가는지 확인 (`:8080`이 아님)
4. Nginx 로그 확인

### 명령어가 로깅되지 않는 경우

1. 명령어 로거 설치 확인:
   ```bash
   cat ~/.bashrc | grep command_log
   ```

2. 로그 파일 확인:
   ```bash
   tail -f ~/.command_log.jsonl
   ```

3. 백엔드가 로그 파일을 읽을 수 있는지 확인:
   ```bash
   docker exec tracer-app ls -la /app/data/.command_log.jsonl
   ```

자세한 트러블슈팅 가이드는 다음 문서를 참조하세요:
- [API_TROUBLESHOOTING.md](./API_TROUBLESHOOTING.md)
- [DOCKER_BUILD_TROUBLESHOOTING.md](./DOCKER_BUILD_TROUBLESHOOTING.md)

## 🤝 기여하기

기여를 환영합니다! 다음 단계를 따라주세요:

1. 이 저장소를 Fork하세요
2. 기능 브랜치를 생성하세요 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push하세요 (`git push origin feature/AmazingFeature`)
5. Pull Request를 열어주세요

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 📚 추가 문서

- [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) - 상세 설치 가이드
- [GETTING_STARTED.md](./GETTING_STARTED.md) - 빠른 시작 가이드
- [SINGLE_DOCKER_DEPLOYMENT.md](./SINGLE_DOCKER_DEPLOYMENT.md) - Docker 배포 가이드
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - 통합 가이드
- [tracer-backend/README.md](./tracer-backend/README.md) - Backend 상세 문서
- [tracer-frontend/README.md](./tracer-frontend/README.md) - Frontend 상세 문서

## 💬 지원

문제가 발생하거나 질문이 있으시면:
- GitHub Issues를 열어주세요
- 프로젝트 문서를 확인해주세요

---

**Tracer** - 명령어와 파일 변경을 추적하는 스마트한 모니터링 시스템 🚀

