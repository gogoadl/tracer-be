# Tracer Backend

Spring Boot 기반 백엔드 서비스로, 셸 명령어 로그와 파일 변경사항을 추적하고 분석합니다.

## 주요 기능

- 📝 **명령어 로깅**: 리눅스 시스템에서 자동 명령어 로깅
- 📊 **파일 감시**: 지정된 디렉토리의 파일 변경사항 모니터링
- 🔍 **검색 및 필터링**: 강력한 쿼리 및 필터링 기능
- 📈 **분석**: 차트 및 통계를 통한 시각적 분석
- 🌐 **RESTful API**: 모든 기능을 위한 포괄적인 API 엔드포인트

## 기술 스택

- **Spring Boot 3.3.0**: 웹 프레임워크
- **Java 17**: 프로그래밍 언어
- **Gradle**: 빌드 도구
- **Spring Data JPA**: 데이터 접근 계층
- **SQLite**: 경량 데이터베이스
- **Hibernate**: ORM 프레임워크
- **Lombok**: 보일러플레이트 코드 감소

## 프로젝트 구조

```
tracer-backend/
├── src/
│   ├── main/
│   │   ├── java/com/tracer/
│   │   │   ├── TracerApplication.java      # Spring Boot 메인 클래스
│   │   │   ├── controller/                 # REST 컨트롤러
│   │   │   │   ├── LogsController.java     # 명령어 로그 API
│   │   │   │   ├── FileWatchController.java # 파일 감시 API
│   │   │   │   ├── HealthController.java   # 헬스 체크
│   │   │   │   └── ConfigController.java   # 설정 API
│   │   │   ├── service/                    # 비즈니스 로직
│   │   │   │   ├── CommandLogService.java
│   │   │   │   └── FileWatchService.java
│   │   │   ├── repository/                 # 데이터 접근 계층
│   │   │   │   ├── CommandLogRepository.java
│   │   │   │   ├── FileChangeRepository.java
│   │   │   │   └── WatchFolderRepository.java
│   │   │   ├── entity/                     # 엔티티 모델
│   │   │   │   ├── CommandLog.java
│   │   │   │   ├── FileChange.java
│   │   │   │   └── WatchFolder.java
│   │   │   ├── config/                     # 설정 클래스
│   │   │   │   ├── DatabaseConfig.java
│   │   │   │   └── ApplicationConfig.java
│   │   │   └── util/                       # 유틸리티 클래스
│   │   │       └── CommandLineParser.java
│   │   └── resources/
│   │       └── application.properties      # 애플리케이션 설정
│   └── test/                               # 테스트 코드
├── data/                                   # 데이터 디렉터리
├── build.gradle                            # Gradle 빌드 설정
├── settings.gradle                         # Gradle 프로젝트 설정
└── README.md                               # 이 파일
```

## 설치 및 실행

### 사전 요구사항

- **Java 25 이상**
- **Gradle Wrapper** (프로젝트에 포함되어 있음, 별도 설치 불필요)
  - 또는 시스템에 **Gradle 8.10 이상** 설치

### 로컬 개발 환경 설정

#### 1. 저장소 클론

```bash
git clone <repository-url>
cd tracer-be/tracer-be/tracer-backend
```

#### 2. Gradle Wrapper 사용 (권장)

프로젝트에 Gradle Wrapper가 포함되어 있으면 시스템에 Gradle을 설치할 필요가 없습니다.

**Windows:**
```bash
# 실행 권한 부여 (필요시)
.\gradlew.bat wrapper

# 빌드
.\gradlew.bat build
```

**Linux/Mac:**
```bash
# 실행 권한 부여
chmod +x gradlew

# Gradle Wrapper 초기화 (처음 한 번만)
./gradlew wrapper

# 빌드
./gradlew build
```

**참고:** 처음 실행 시 Gradle Wrapper가 자동으로 필요한 파일을 다운로드합니다.

#### 3. 시스템 Gradle 사용

시스템에 Gradle이 설치되어 있다면:

```bash
gradle build
```

#### 4. 애플리케이션 실행

**로컬 개발 모드 (H2 인메모리 데이터베이스 사용 - 권장):**

로컬 개발 시 H2 인메모리 데이터베이스를 사용하면 별도의 데이터베이스 파일 없이 빠르게 개발할 수 있습니다.

```bash
# Windows
.\gradlew.bat bootRun --args='--spring.profiles.active=local'

# Linux/Mac
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

**빌드 후 실행:**
```bash
# 빌드
./gradlew build

# JAR 파일 실행 (로컬 프로파일)
java -jar build/libs/tracer-backend-1.0.0.jar --spring.profiles.active=local

# JAR 파일 실행 (기본 SQLite)
java -jar build/libs/tracer-backend-1.0.0.jar
```

애플리케이션이 `http://localhost:8080`에서 실행됩니다.

**H2 콘솔 접속 (로컬 프로파일 사용 시):**
- URL: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:tracerdb`
- 사용자명: `sa`
- 비밀번호: (비어있음)

### 환경 변수 설정

애플리케이션은 다음 환경 변수를 지원합니다:

| 변수명 | 기본값 | 설명 |
|--------|--------|------|
| `SPRING_PROFILES_ACTIVE` | (없음) | 활성 프로파일 (`local`로 설정 시 H2 인메모리 DB 사용) |
| `SPRING_DATASOURCE_URL` | `jdbc:sqlite:./data/logs.db` | 데이터베이스 연결 URL (기본 프로파일) |
| `COMMAND_HISTORY_PATH` | `./data/.command_log.jsonl` | 명령어 로그 파일 경로 |
| `SERVER_PORT` | `8000` | 서버 포트 |

### 데이터베이스 설정

#### 로컬 개발 환경 (H2 인메모리)

로컬 개발 시 H2 인메모리 데이터베이스를 사용하려면 `local` 프로파일을 활성화하세요:

```bash
export SPRING_PROFILES_ACTIVE=local
./gradlew bootRun
```

특징:
- 별도의 데이터베이스 파일 불필요
- 애플리케이션 재시작 시 데이터 초기화
- H2 콘솔 제공 (http://localhost:8000/h2-console)
- 빠른 개발 및 테스트에 적합

#### 프로덕션 환경 (SQLite)

기본 설정은 SQLite를 사용합니다. Docker 배포나 프로덕션 환경에서는 SQLite를 사용합니다:

```bash
./gradlew bootRun
```

특징:
- 데이터 영구 저장 (`./data/logs.db`)
- 프로덕션 환경에 적합
- 경량 데이터베이스

환경 변수 설정 예시:

**Windows (PowerShell):**
```powershell
$env:SPRING_DATASOURCE_URL="jdbc:sqlite:./data/logs.db"
$env:COMMAND_HISTORY_PATH="./data/.command_log.jsonl"
.\gradlew.bat bootRun
```

**Linux/Mac:**
```bash
export SPRING_DATASOURCE_URL="jdbc:sqlite:./data/logs.db"
export COMMAND_HISTORY_PATH="./data/.command_log.jsonl"
./gradlew bootRun
```

## 명령어 로그 파일 형식

서비스는 다음 형식의 로그 파일을 읽습니다:

```jsonl
{"timestamp":"2025-01-27T09:15:22","user":"username","directory":"/home/user/project","command":"ls -la"}
{"timestamp":"2025-01-27T09:16:30","user":"username","directory":"/home/user/project","command":"cd src"}
```

각 줄은 JSON 형식이며 다음 필드를 포함합니다:
- `timestamp`: ISO 8601 형식의 타임스탬프
- `user`: 명령어를 실행한 사용자
- `directory`: 명령어가 실행된 디렉토리
- `command`: 실행된 명령어

## 명령어 로거 설치 (리눅스)

리눅스 시스템에서 자동 명령어 로깅을 설정하려면:

```bash
chmod +x install_logger.sh
./install_logger.sh
```

이 스크립트는:
- `~/.command_log.jsonl` 파일 생성
- Shell 설정 파일(`~/.bashrc` 또는 `~/.zshrc`)에 로깅 스크립트 추가
- 백엔드가 자동으로 이 파일을 읽어서 데이터베이스에 저장

## API 문서 (Swagger)

애플리케이션 실행 후 다음 URL에서 인터랙티브 API 문서를 확인할 수 있습니다:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api-docs

Swagger UI를 통해:
- 모든 API 엔드포인트 확인
- 요청/응답 스키마 확인
- 직접 API 테스트 (Try it out 기능)
- 요청 예제 확인

## API 엔드포인트

### 명령어 로그

- `GET /api/logs` - 로그 조회 (필터링 지원)
- `GET /api/logs/by-date` - 날짜별 그룹화된 로그
- `GET /api/logs/stats` - 통계 정보
- `GET /api/logs/filter-options` - 필터 옵션 조회
- `GET /api/logs/date/{date}` - 특정 날짜 로그
- `POST /api/logs/refresh` - 로그 파일 새로고침

### 파일 감시

- `GET /api/folders` - 감시 중인 폴더 목록
- `POST /api/folders/add` - 폴더 추가
- `DELETE /api/folders/{id}` - 폴더 제거
- `POST /api/folders/{id}/toggle` - 활성화/비활성화

### 파일 변경 내역

- `GET /api/changes` - 파일 변경 내역 조회
- `GET /api/changes/by-date` - 날짜별 통계
- `GET /api/changes/stats` - 전체 통계
- `GET /api/changes/date/{date}` - 특정 날짜 변경 내역

### 헬스 체크

- `GET /health` - 서비스 상태 확인

## 쿼리 파라미터

### GET /api/logs

- `start_date`: 시작 날짜 (YYYY-MM-DD)
- `end_date`: 종료 날짜 (YYYY-MM-DD)
- `user`: 사용자명 필터
- `search`: 명령어 검색어
- `limit`: 최대 결과 수 (기본값: 100, 최대: 1000)
- `offset`: 페이지네이션 오프셋 (기본값: 0)

## 사용 예제

```bash
# 모든 로그 조회
curl http://localhost:8080/api/logs

# 날짜 범위로 필터링
curl "http://localhost:8080/api/logs?start_date=2025-01-01&end_date=2025-01-31"

# 키워드 검색
curl "http://localhost:8080/api/logs?search=git"

# 날짜별 그룹화된 로그
curl http://localhost:8080/api/logs/by-date

# 통계 조회
curl http://localhost:8080/api/logs/stats

# 특정 날짜 로그
curl http://localhost:8080/api/logs/date/2025-01-27

# 폴더 추가
curl -X POST "http://localhost:8080/api/folders/add?path=/home/user/project&recursive=true"

# 헬스 체크
curl http://localhost:8080/health
```

## Docker 빌드

Docker를 사용하여 빌드하고 실행:

```bash
# 루트 디렉토리에서 빌드
cd ../..
docker build -t tracer:latest .

# Docker Compose로 실행
docker-compose -f docker-compose.single.yml up -d
```

## 개발

### 빌드

```bash
./gradlew build
```

### 테스트 실행

```bash
./gradlew test
```

### 테스트 제외하고 빌드

```bash
./gradlew build -x test
```

### 의존성 확인

```bash
./gradlew dependencies
```

## 트러블슈팅

### 포트가 이미 사용 중인 경우

다른 포트로 실행:

```bash
# 환경 변수로 포트 변경
export SERVER_PORT=8081
./gradlew bootRun
```

또는 `application.yml` 파일 수정:

```yaml
server:
  port: 8081
```

### 데이터베이스 파일 권한 문제

데이터 디렉토리에 쓰기 권한이 있는지 확인:

```bash
chmod -R 755 data/
```

### 로그 파일을 찾을 수 없는 경우

환경 변수로 로그 파일 경로 지정:

```bash
export COMMAND_HISTORY_PATH="/path/to/.command_log.jsonl"
./gradlew bootRun
```

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.
