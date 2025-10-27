# File Watch Feature Guide

파일 감시 기능을 사용하여 특정 폴더 내 파일 변경사항을 실시간으로 추적할 수 있습니다.

## 기능 소개

이 기능은 다음을 감지합니다:
- 파일 생성 (created)
- 파일 삭제 (deleted)
- 파일 수정 (modified)
- 파일 이동 (moved)

## API 엔드포인트

### 1. 폴더 추가

```bash
POST /api/folders/add?path=/path/to/folder&file_patterns=*.yml,*.conf&recursive=true
```

**파라미터:**
- `path` (필수): 감시할 폴더 경로
- `file_patterns` (선택): 감시할 파일 패턴 (쉼표로 구분, 예: `*.yml,*.conf`)
- `recursive` (선택): 하위 폴더까지 감시 여부 (기본값: true)

**예시:**
```bash
curl -X POST "http://localhost:8000/api/folders/add?path=/home/user/project&file_patterns=*.yml,*.conf,*.json&recursive=true"
```

### 2. 감시 중인 폴더 목록

```bash
GET /api/folders
```

**응답:**
```json
{
  "total": 2,
  "folders": [
    {
      "id": 1,
      "path": "/home/user/project",
      "is_active": "True",
      "file_patterns": "*.yml,*.conf",
      "recursive": "True",
      "created_at": "2025-10-27T09:00:00"
    }
  ]
}
```

### 3. 폴더 제거

```bash
DELETE /api/folders/{folder_id}
```

### 4. 폴더 활성화/비활성화 토글

```bash
POST /api/folders/{folder_id}/toggle
```

### 5. 파일 변경 내역 조회

```bash
GET /api/changes?start_date=2025-10-01&end_date=2025-10-27&event_type=modified&limit=100
```

**파라미터:**
- `start_date`: 시작 날짜 (YYYY-MM-DD)
- `end_date`: 종료 날짜 (YYYY-MM-DD)
- `event_type`: 이벤트 타입 (created, deleted, modified, moved)
- `file_extension`: 파일 확장자 (예: .yml, .conf)
- `limit`: 최대 결과 수 (기본값: 100)
- `offset`: 페이지 오프셋 (기본값: 0)

### 6. 날짜별 파일 변경 통계

```bash
GET /api/changes/by-date
```

### 7. 파일 변경 통계

```bash
GET /api/changes/stats
```

**응답:**
```json
{
  "total_changes": 150,
  "date_range": {
    "first_change": "2025-10-01T08:00:00",
    "last_change": "2025-10-27T18:00:00"
  },
  "event_types": {
    "created": 50,
    "modified": 80,
    "deleted": 15,
    "moved": 5
  },
  "top_extensions": [
    {"extension": ".yml", "count": 30},
    {"extension": ".conf", "count": 20}
  ],
  "top_directories": [
    {"directory": "/home/user/project", "count": 100}
  ]
}
```

### 8. 특정 날짜의 파일 변경 내역

```bash
GET /api/changes/date/2025-10-27
```

## 사용 예시

### Docker Compose 파일 감시

```bash
# 폴더 추가
curl -X POST "http://localhost:8000/api/folders/add?path=/home/user/project&file_patterns=docker-compose.yml,docker-compose.yaml"

# 파일 변경 내역 확인
curl "http://localhost:8000/api/changes?file_extension=.yml&limit=10"
```

### Nginx 설정 파일 감시

```bash
# 폴더 추가
curl -X POST "http://localhost:8000/api/folders/add?path=/etc/nginx&file_patterns=nginx.conf,*.conf"

# 수정된 파일만 확인
curl "http://localhost:8000/api/changes?event_type=modified"
```

### 특정 프로젝트 전체 감시

```bash
# 프로젝트 폴더 전체 감시 (특정 확장자만)
curl -X POST "http://localhost:8000/api/folders/add?path=/home/user/myproject&file_patterns=*.js,*.json,*.yml,*.md&recursive=true"

# 지난 일주일 변경 내역
curl "http://localhost:8000/api/changes?start_date=2025-10-20"
```

## 파일 패턴 예시

| 패턴 | 설명 | 예시 |
|------|------|------|
| `*.yml` | YAML 파일 | docker-compose.yml |
| `*.conf` | 설정 파일 | nginx.conf |
| `*.json` | JSON 파일 | package.json |
| `*test*` | test가 포함된 파일 | test_file.js |
| `Dockerfile*` | Dockerfile로 시작하는 파일 | Dockerfile, Dockerfile.prod |

## 데이터베이스

파일 변경 내역은 `file_changes` 테이블에 저장되며 다음 정보를 포함합니다:
- 타임스탬프
- 이벤트 타입 (created, deleted, modified, moved)
- 파일 경로
- 디렉토리
- 파일명
- 파일 확장자
- 파일 크기
- 이동 시 원본 경로

## 주의사항

1. **성능**: 너무 많은 파일을 감시하면 시스템 리소스를 많이 사용할 수 있습니다.
2. **권한**: 감시하려는 폴더에 대한 읽기 권한이 필요합니다.
3. **재시작**: 서버를 재시작하면 활성 상태인 폴더들이 자동으로 다시 감시를 시작합니다.
4. **파일 패턴**: 패턴을 지정하지 않으면 폴더 내 모든 파일이 감시됩니다.

## 프론트엔드 연동

프론트엔드에서 파일 변경 내역을 표시하려면:

```javascript
// 날짜별 변경 통계
const changes = await fetch('http://localhost:8000/api/changes/by-date');
const data = await changes.json();

// 특정 날짜의 변경 내역
const dateChanges = await fetch('http://localhost:8000/api/changes/date/2025-10-27');
const dateData = await dateChanges.json();
```

