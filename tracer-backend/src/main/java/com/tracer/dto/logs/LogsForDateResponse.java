package com.tracer.dto.logs;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "특정 날짜 로그 응답 데이터")
public class LogsForDateResponse {
    
    @Schema(description = "날짜", example = "2025-01-27")
    private String date;
    
    @Schema(description = "로그 수", example = "50")
    private Integer count;
    
    @Schema(description = "로그 목록")
    private List<CommandLogDto> logs;
}

