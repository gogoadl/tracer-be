package com.tracer.controller;

import com.tracer.dto.common.ApiResponse;
import com.tracer.dto.health.HealthResponse;
import com.tracer.dto.health.RootResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Health", description = "헬스 체크 API")
public class HealthController {
    
    @GetMapping("/")
    @Operation(summary = "루트 엔드포인트", description = "API 기본 정보를 반환합니다")
    public ResponseEntity<ApiResponse<RootResponse>> root() {
        RootResponse response = new RootResponse("Tracer Backend API", "1.0.0");
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/health")
    @Operation(summary = "헬스 체크", description = "서비스 상태를 확인합니다")
    public ResponseEntity<ApiResponse<HealthResponse>> health() {
        HealthResponse response = new HealthResponse("healthy");
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
