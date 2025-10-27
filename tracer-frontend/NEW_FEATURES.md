# 새로운 기능

## 파일 감시 (File Watcher) 기능

### 기능 소개

프론트엔드에서 감시 폴더를 추가하고, 파일 변경 내역을 차트로 분석할 수 있습니다.

### 주요 기능

1. **폴더 추가 및 관리**
   - 감시할 폴더 추가
   - 파일 패턴 지정 (예: `*.yml,*.conf`)
   - 재귀적 하위 폴더 감시 설정
   - 폴더 활성화/비활성화
   - 폴더 제거

2. **실시간 파일 변경 감지**
   - 파일 생성 (created)
   - 파일 삭제 (deleted)
   - 파일 수정 (modified)
   - 파일 이동 (moved)

3. **데이터 분석 및 차트**
   - 이벤트 타입별 파이 차트
   - 시간별 변경 추이 라인 차트
   - 파일 확장자별 막대 차트
   - 가장 활발한 디렉토리 차트
   - 기간별 필터링 (7일, 14일, 30일, 1년)

## 사용 방법

### 1. 의존성 설치

```bash
cd tracer-fe/tracer-fe
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

### 3. 파일 감시 시작

1. **파일 Watcher 탭 클릭**
   - 상단의 "📁 File Watcher" 탭 클릭

2. **폴더 추가**
   - "Add Folder" 버튼 클릭
   - 폴더 경로 입력
   - 파일 패턴 입력 (선택사항)
   - "Watch subdirectories" 체크 (하위 폴더 포함)

3. **예시**
   ```
   Path: C:/Users/YourUser/myproject
   File Patterns: docker-compose.yml,nginx.conf,*.json
   Recursive: ✅ Yes
   ```

4. **차트 확인**
   - 파일 변경 내역이 실시간으로 차트에 표시됩니다

## API 엔드포인트

### 폴더 관리
- `GET /api/folders` - 감시 중인 폴더 목록
- `POST /api/folders/add` - 폴더 추가
- `DELETE /api/folders/{id}` - 폴더 제거
- `POST /api/folders/{id}/toggle` - 활성화/비활성화

### 파일 변경 내역
- `GET /api/changes` - 파일 변경 내역 조회
- `GET /api/changes/by-date` - 날짜별 통계
- `GET /api/changes/stats` - 전체 통계
- `GET /api/changes/date/{date}` - 특정 날짜 변경 내역

## 차트 종류

1. **Changes by Event Type (파이 차트)**
   - Created, Modified, Deleted, Moved 이벤트 비율

2. **Changes Over Time (라인 차트)**
   - 시간 경과에 따른 파일 변경 추이

3. **Top File Extensions (막대 차트)**
   - 가장 많이 변경된 파일 확장자

4. **Most Active Directories (막대 차트)**
   - 가장 활발한 디렉토리

## 파일 패턴 예시

| 패턴 | 설명 | 예시 매칭 |
|------|------|----------|
| `*.yml` | 모든 YAML 파일 | docker-compose.yml |
| `nginx.conf` | 정확한 파일명 | nginx.conf |
| `Dockerfile*` | Dockerfile 시작 | Dockerfile, Dockerfile.prod |
| `*.json` | 모든 JSON 파일 | package.json, tsconfig.json |

## 데이터베이스

파일 변경 내역은 `file_changes` 테이블에 저장됩니다:

```sql
- id
- timestamp
- date
- event_type (created, deleted, modified, moved)
- file_path
- directory
- file_name
- file_extension
- size
- is_directory
- src_path
```

## 주의사항

1. **백엔드 실행 필수**: 파일 감시는 백엔드가 실행되어야 합니다
2. **권한**: 폴더 접근 권한이 필요합니다
3. **성능**: 너무 많은 파일을 감시하면 시스템 리소스를 많이 사용합니다
4. **실시간**: 파일 변경은 실시간으로 감지되어 데이터베이스에 저장됩니다

## 트러블슈팅

### 차트가 표시되지 않음
- 백엔드가 실행 중인지 확인
- 폴더가 추가되고 활성화되었는지 확인
- API 연결 확인 (브라우저 콘솔)

### 폴더 추가 실패
- 경로가 올바른지 확인
- 폴더에 접근 권한이 있는지 확인
- 백엔드 로그 확인

## 예시 사용 사례

### Docker 프로젝트 모니터링
```
폴더: /home/user/docker-project
패턴: docker-compose.yml, Dockerfile*
```

### 설정 파일 모니터링
```
폴더: /etc/nginx
패턴: *.conf
```

### 전체 프로젝트 모니터링
```
폴더: /home/user/myproject
패턴: *.yml,*.json,*.md
재귀적: Yes
```

