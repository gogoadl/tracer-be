package com.tracer.dto.logs;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "로그 통계 응답 데이터")
public class LogStatsResponse {
    
    @Schema(description = "전체 로그 수", example = "1000")
    private Long totalLogs;
    
    @Schema(description = "사용자별 로그 수")
    private Map<String, Long> logsByUser;
    
    @Schema(description = "날짜별 로그 수")
    private Map<String, Long> logsByDate;
    
    @Schema(description = "가장 많이 사용된 명령어")
    private Map<String, Long> topCommands;
}

