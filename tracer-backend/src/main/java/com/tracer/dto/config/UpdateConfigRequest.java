package com.tracer.dto.config;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.Map;

@Data
@Schema(description = "설정 업데이트 요청")
public class UpdateConfigRequest {
    
    @Schema(description = "설정 데이터")
    private Map<String, Object> config;
}

