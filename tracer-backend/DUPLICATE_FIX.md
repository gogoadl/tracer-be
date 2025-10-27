# ✅ 중복 로그 수정 완료

## 문제
- 동일한 로그가 2개씩 쌓이는 현상

## 원인
- `startup_event`에서 모든 active 폴더를 시작
- `/api/folders/add`에서도 시작
- `start_watching`에 중복 체크가 없어서 2번 시작됨

## 해결
1. `start_watching` 메서드에 중복 체크 추가:
```python
if watch_folder.id in self.observers:
    print(f"⚠️  Already watching folder {watch_folder.id}, skipping...")
    return
```

2. `/api/folders/add` 엔드포인트에서도 체크:
```python
if watch_folder.id not in watcher_service.observers:
    watcher_service.start_watching(watch_folder)
```

## 결과
- 이제 각 폴더는 한 번만 시작됩니다
- 백엔드 재시작해도 중복 로그가 생성되지 않습니다
- 파일 변경 시 로그가 하나만 생성됩니다

