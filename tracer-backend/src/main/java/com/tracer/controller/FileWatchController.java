package com.tracer.controller;

import com.tracer.dto.common.ApiResponse;
import com.tracer.dto.filewatch.*;
import com.tracer.dto.filewatch.FileChangeMapper;
import com.tracer.dto.filewatch.WatchFolderMapper;
import com.tracer.service.FileWatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "File Watch", description = "파일 감시 API")
public class FileWatchController {
    
    private final FileWatchService fileWatchService;
    private final WatchFolderMapper watchFolderMapper;
    private final FileChangeMapper fileChangeMapper;
    
    @PostMapping("/folders/add")
    @Operation(summary = "감시 폴더 추가", description = "새로운 폴더를 감시 목록에 추가합니다")
    public ResponseEntity<ApiResponse<AddWatchFolderResponse>> addWatchFolder(
            @Parameter(description = "폴더 경로", required = true) @RequestParam String path,
            @Parameter(description = "파일 패턴 (쉼표로 구분)") @RequestParam(required = false) String file_patterns,
            @Parameter(description = "재귀적 감시 여부") @RequestParam(defaultValue = "true") boolean recursive) {
        
        com.tracer.entity.WatchFolder folder = fileWatchService.addWatchFolder(path, file_patterns, recursive);
        AddWatchFolderResponse response = new AddWatchFolderResponse();
        response.setFolder(watchFolderMapper.toDto(folder));
        return ResponseEntity.ok(ApiResponse.success("폴더가 감시 목록에 추가되었습니다", response));
    }
    
    @GetMapping("/folders")
    @Operation(summary = "감시 폴더 목록 조회", description = "감시 중인 폴더 목록을 조회합니다")
    public ResponseEntity<ApiResponse<WatchFoldersResponse>> getWatchFolders() {
        List<com.tracer.entity.WatchFolder> folders = fileWatchService.getAllWatchFolders();
        WatchFoldersResponse response = new WatchFoldersResponse();
        response.setTotal(folders.size());
        response.setFolders(watchFolderMapper.toDtoList(folders));
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @DeleteMapping("/folders/{folderId}")
    @Operation(summary = "감시 폴더 제거", description = "감시 목록에서 폴더를 제거합니다")
    public ResponseEntity<ApiResponse<Void>> removeWatchFolder(
            @Parameter(description = "폴더 ID", required = true) @PathVariable Integer folderId) {
        fileWatchService.removeWatchFolder(folderId);
        return ResponseEntity.ok(ApiResponse.success("폴더가 감시 목록에서 제거되었습니다", null));
    }
    
    @PostMapping("/folders/{folderId}/toggle")
    @Operation(summary = "감시 폴더 활성화/비활성화", description = "감시 폴더의 활성화 상태를 변경합니다")
    public ResponseEntity<ApiResponse<ToggleWatchFolderResponse>> toggleWatchFolder(
            @Parameter(description = "폴더 ID", required = true) @PathVariable Integer folderId) {
        com.tracer.entity.WatchFolder folder = fileWatchService.toggleWatchFolder(folderId);
        ToggleWatchFolderResponse response = new ToggleWatchFolderResponse();
        response.setIsActive(folder.getIsActive());
        return ResponseEntity.ok(ApiResponse.success("폴더 상태가 업데이트되었습니다", response));
    }
    
    @GetMapping("/changes")
    @Operation(summary = "파일 변경 내역 조회", description = "필터링 조건에 따라 파일 변경 내역을 조회합니다")
    public ResponseEntity<ApiResponse<FileChangesResponse>> getFileChanges(
            @Parameter(description = "시작 날짜 (YYYY-MM-DD)") @RequestParam(required = false) String start_date,
            @Parameter(description = "종료 날짜 (YYYY-MM-DD)") @RequestParam(required = false) String end_date,
            @Parameter(description = "이벤트 타입 필터") @RequestParam(required = false) String event_type,
            @Parameter(description = "파일 확장자 필터") @RequestParam(required = false) String file_extension,
            @Parameter(description = "최대 결과 수") @RequestParam(defaultValue = "100") int limit,
            @Parameter(description = "페이지네이션 오프셋") @RequestParam(defaultValue = "0") int offset) {
        
        Map<String, Object> result = fileWatchService.getFileChanges(
            start_date, end_date, event_type, file_extension, limit, offset);
        
        FileChangesResponse response = new FileChangesResponse();
        response.setTotal((Long) result.getOrDefault("total", 0L));
        response.setCount((Integer) result.getOrDefault("count", 0));
        @SuppressWarnings("unchecked")
        List<com.tracer.entity.FileChange> changes = (List<com.tracer.entity.FileChange>) result.get("changes");
        response.setChanges(fileChangeMapper.toDtoList(changes != null ? changes : List.of()));
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/changes/by-date")
    @Operation(summary = "날짜별 파일 변경 내역 조회", description = "날짜별로 그룹화된 파일 변경 내역을 조회합니다")
    public ResponseEntity<ApiResponse<ChangesByDateResponse>> getChangesByDate() {
        List<Map<String, Object>> changesByDate = fileWatchService.getChangesByDate();
        ChangesByDateResponse response = new ChangesByDateResponse(changesByDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/changes/stats")
    @Operation(summary = "파일 변경 통계 조회", description = "파일 변경 통계 정보를 조회합니다")
    public ResponseEntity<ApiResponse<FileChangeStatsResponse>> getFileChangeStats() {
        Map<String, Object> stats = fileWatchService.getFileChangeStats();
        FileChangeStatsResponse response = new FileChangeStatsResponse();
        response.setTotalChanges((Long) stats.getOrDefault("total_changes", 0L));
        response.setChangesByEventType((Map<String, Long>) stats.getOrDefault("changes_by_event_type", new HashMap<>()));
        response.setChangesByDate((Map<String, Long>) stats.getOrDefault("changes_by_date", new HashMap<>()));
        response.setChangesByExtension((Map<String, Long>) stats.getOrDefault("changes_by_extension", new HashMap<>()));
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/changes/date/{date}")
    @Operation(summary = "특정 날짜 파일 변경 내역 조회", description = "특정 날짜의 파일 변경 내역을 조회합니다")
    public ResponseEntity<ApiResponse<ChangesForDateResponse>> getChangesForDate(
            @Parameter(description = "날짜 (YYYY-MM-DD)", required = true) @PathVariable String date) {
        List<com.tracer.entity.FileChange> changes = fileWatchService.getChangesForDate(date);
        ChangesForDateResponse response = new ChangesForDateResponse();
        response.setDate(date);
        response.setCount(changes.size());
        response.setChanges(fileChangeMapper.toDtoList(changes));
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @DeleteMapping("/changes/{changeId}")
    @Operation(summary = "파일 변경 내역 삭제", description = "파일 변경 내역을 삭제합니다")
    public ResponseEntity<ApiResponse<DeleteFileChangeResponse>> deleteFileChange(
            @Parameter(description = "변경 내역 ID", required = true) @PathVariable Integer changeId) {
        fileWatchService.deleteFileChange(changeId);
        DeleteFileChangeResponse response = new DeleteFileChangeResponse();
        response.setId(changeId);
        return ResponseEntity.ok(ApiResponse.success("파일 변경 내역이 삭제되었습니다", response));
    }
}
