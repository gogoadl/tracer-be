package com.tracer.controller;

import com.tracer.dto.common.ApiResponse;
import com.tracer.dto.config.GetConfigResponse;
import com.tracer.dto.config.UpdateConfigRequest;
import com.tracer.dto.config.UpdateConfigResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping({"/config", "/api/config"})
@RequiredArgsConstructor
@Tag(name = "Config", description = "설정 API")
public class ConfigController {
    
    @GetMapping
    @Operation(summary = "설정 조회", description = "현재 설정 정보를 조회합니다")
    public ResponseEntity<ApiResponse<GetConfigResponse>> getConfig() {
        String commandHistoryPath = System.getenv("COMMAND_HISTORY_PATH");
        if (commandHistoryPath == null || commandHistoryPath.isEmpty()) {
            commandHistoryPath = System.getProperty("user.home") + "/.command_log.jsonl";
        }
        
        Path path = Paths.get(commandHistoryPath);
        GetConfigResponse response = new GetConfigResponse();
        response.setCommandHistoryPath(commandHistoryPath);
        response.setCommandHistoryExists(Files.exists(path));
        response.setConfig(new HashMap<>());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping
    @Operation(summary = "설정 업데이트", description = "설정을 업데이트합니다")
    public ResponseEntity<ApiResponse<UpdateConfigResponse>> updateConfig(@RequestBody UpdateConfigRequest request) {
        UpdateConfigResponse response = new UpdateConfigResponse();
        response.setConfig(request.getConfig());
        response.setNote("Please restart the backend for changes to take effect");
        return ResponseEntity.ok(ApiResponse.success("설정이 업데이트되었습니다", response));
    }
}
