package com.tracer.dto.health;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "루트 엔드포인트 응답 데이터")
public class RootResponse {
    
    @Schema(description = "API 메시지", example = "Tracer Backend API")
    private String message;
    
    @Schema(description = "API 버전", example = "1.0.0")
    private String version;
}

