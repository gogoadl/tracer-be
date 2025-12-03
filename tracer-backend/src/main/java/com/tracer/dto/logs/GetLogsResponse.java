package com.tracer.dto.logs;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "로그 조회 응답 데이터")
public class GetLogsResponse {
    
    @Schema(description = "전체 로그 수", example = "150")
    private Long total;
    
    @Schema(description = "현재 페이지의 로그 수", example = "100")
    private Integer count;
    
    @Schema(description = "로그 목록")
    private List<CommandLogDto> logs;
}

