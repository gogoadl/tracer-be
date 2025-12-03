package com.tracer.dto.config;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "설정 조회 응답 데이터")
public class GetConfigResponse {
    
    @Schema(description = "명령어 로그 파일 경로", example = "/home/user/.command_log.jsonl")
    private String commandHistoryPath;
    
    @Schema(description = "명령어 로그 파일 존재 여부", example = "true")
    private Boolean commandHistoryExists;
    
    @Schema(description = "추가 설정 정보")
    private Map<String, Object> config;
}

