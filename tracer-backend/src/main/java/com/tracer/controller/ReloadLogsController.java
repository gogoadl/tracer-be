package com.tracer.controller;

import com.tracer.dto.common.ApiResponse;
import com.tracer.dto.logs.RefreshLogsResponse;
import com.tracer.service.CommandLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping({"/reload-logs", "/api/reload-logs"})
@RequiredArgsConstructor
@Tag(name = "Reload Logs", description = "로그 새로고침 API")
public class ReloadLogsController {
    
    private final CommandLogService commandLogService;
    
    @PostMapping
    @Operation(summary = "로그 새로고침", description = "로그 파일에서 로그를 다시 로드합니다")
    public ResponseEntity<ApiResponse<RefreshLogsResponse>> reloadLogs() {
        String commandHistoryPath = System.getenv("COMMAND_HISTORY_PATH");
        if (commandHistoryPath == null || commandHistoryPath.isEmpty()) {
            commandHistoryPath = System.getProperty("user.home") + "/.command_log.jsonl";
        }
        
        Path path = Paths.get(commandHistoryPath);
        
        if (!Files.exists(path)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("404", "Command history file not found at " + commandHistoryPath));
        }
        
        try {
            commandLogService.loadLogsFromFile(path, 1000);
            RefreshLogsResponse response = new RefreshLogsResponse();
            response.setSource(commandHistoryPath);
            response.setReloadedCount(1000); // 실제로는 로드된 수를 반환해야 함
            return ResponseEntity.ok(ApiResponse.success("로그가 성공적으로 새로고침되었습니다", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("500", "Error reloading logs: " + e.getMessage()));
        }
    }
}
