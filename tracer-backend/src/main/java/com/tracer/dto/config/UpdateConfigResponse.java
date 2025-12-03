package com.tracer.dto.config;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "설정 업데이트 응답 데이터")
public class UpdateConfigResponse {
    
    @Schema(description = "업데이트된 설정 데이터")
    private Map<String, Object> config;
    
    @Schema(description = "참고 사항", example = "Please restart the backend for changes to take effect")
    private String note;
}

