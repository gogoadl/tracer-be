package com.tracer.controller;

import com.tracer.dto.common.ApiResponse;
import com.tracer.dto.logs.*;
import com.tracer.dto.logs.CommandLogMapper;
import com.tracer.service.CommandLogService;
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
@RequestMapping("/api/logs")
@RequiredArgsConstructor
@Tag(name = "Logs", description = "명령어 로그 API")
public class LogsController {
    
    private final CommandLogService commandLogService;
    private final CommandLogMapper commandLogMapper;
    
    @GetMapping
    @Operation(summary = "로그 조회", description = "필터링 조건에 따라 로그를 조회합니다")
    public ResponseEntity<ApiResponse<GetLogsResponse>> getLogs(
            @Parameter(description = "시작 날짜 (YYYY-MM-DD)") @RequestParam(required = false) String start_date,
            @Parameter(description = "종료 날짜 (YYYY-MM-DD)") @RequestParam(required = false) String end_date,
            @Parameter(description = "사용자명 필터") @RequestParam(required = false) String user,
            @Parameter(description = "검색어 (명령어 내 검색)") @RequestParam(required = false) String search,
            @Parameter(description = "디렉토리 필터") @RequestParam(required = false) String directory,
            @Parameter(description = "최대 결과 수") @RequestParam(defaultValue = "100") int limit,
            @Parameter(description = "페이지네이션 오프셋") @RequestParam(defaultValue = "0") int offset) {
        
        Map<String, Object> result = commandLogService.getLogs(
            start_date, end_date, user, search, directory, limit, offset);
        
        GetLogsResponse response = new GetLogsResponse();
        response.setTotal((Long) result.getOrDefault("total", 0L));
        response.setCount((Integer) result.getOrDefault("count", 0));
        @SuppressWarnings("unchecked")
        List<com.tracer.entity.CommandLog> logs = (List<com.tracer.entity.CommandLog>) result.get("logs");
        response.setLogs(commandLogMapper.toDtoList(logs != null ? logs : List.of()));
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/by-date")
    @Operation(summary = "날짜별 로그 조회", description = "날짜별로 그룹화된 로그를 조회합니다")
    public ResponseEntity<ApiResponse<LogsByDateResponse>> getLogsByDate() {
        List<Map<String, Object>> logsByDate = commandLogService.getLogsByDate();
        LogsByDateResponse response = new LogsByDateResponse(logsByDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/stats")
    @Operation(summary = "로그 통계 조회", description = "로그 통계 정보를 조회합니다")
    public ResponseEntity<ApiResponse<LogStatsResponse>> getLogStats() {
        Map<String, Object> stats = commandLogService.getLogStats();
        LogStatsResponse response = new LogStatsResponse();
        response.setTotalLogs((Long) stats.getOrDefault("total_logs", 0L));
        response.setLogsByUser((Map<String, Long>) stats.getOrDefault("logs_by_user", new HashMap<>()));
        response.setLogsByDate((Map<String, Long>) stats.getOrDefault("logs_by_date", new HashMap<>()));
        response.setTopCommands((Map<String, Long>) stats.getOrDefault("top_commands", new HashMap<>()));
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/filter-options")
    @Operation(summary = "필터 옵션 조회", description = "사용 가능한 필터 옵션을 조회합니다")
    public ResponseEntity<ApiResponse<FilterOptionsResponse>> getFilterOptions() {
        Map<String, List<String>> options = commandLogService.getFilterOptions();
        FilterOptionsResponse response = new FilterOptionsResponse();
        response.setUsers(options.getOrDefault("users", List.of()));
        response.setDirectories(options.getOrDefault("directories", List.of()));
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/date/{date}")
    @Operation(summary = "특정 날짜 로그 조회", description = "특정 날짜의 로그를 조회합니다")
    public ResponseEntity<ApiResponse<LogsForDateResponse>> getLogsForDate(
            @Parameter(description = "날짜 (YYYY-MM-DD)", required = true) @PathVariable String date) {
        List<com.tracer.entity.CommandLog> logs = commandLogService.getLogsForDate(date);
        LogsForDateResponse response = new LogsForDateResponse();
        response.setDate(date);
        response.setCount(logs.size());
        response.setLogs(commandLogMapper.toDtoList(logs));
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping("/refresh")
    @Operation(summary = "로그 새로고침", description = "로그 파일에서 로그를 다시 로드합니다")
    public ResponseEntity<ApiResponse<RefreshLogsResponse>> refreshLogs() {
        RefreshLogsResponse response = new RefreshLogsResponse();
        response.setSource("Command history file");
        response.setReloadedCount(0);
        return ResponseEntity.ok(ApiResponse.success("로그 새로고침이 요청되었습니다", response));
    }
}
