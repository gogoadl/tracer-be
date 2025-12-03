package com.tracer.dto.logs;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "로그 새로고침 응답 데이터")
public class RefreshLogsResponse {
    
    @Schema(description = "새로고침된 로그 파일 경로", example = "/home/user/.command_log.jsonl")
    private String source;
    
    @Schema(description = "새로고침된 로그 수", example = "100")
    private Integer reloadedCount;
}

