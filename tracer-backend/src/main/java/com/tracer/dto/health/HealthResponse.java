package com.tracer.dto.health;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "헬스 체크 응답 데이터")
public class HealthResponse {
    
    @Schema(description = "상태", example = "healthy")
    private String status;
}

