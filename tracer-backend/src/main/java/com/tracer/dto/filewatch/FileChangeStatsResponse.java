package com.tracer.dto.filewatch;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "파일 변경 통계 응답 데이터")
public class FileChangeStatsResponse {
    
    @Schema(description = "전체 변경 내역 수", example = "500")
    private Long totalChanges;
    
    @Schema(description = "이벤트 타입별 변경 수")
    private Map<String, Long> changesByEventType;
    
    @Schema(description = "날짜별 변경 수")
    private Map<String, Long> changesByDate;
    
    @Schema(description = "파일 확장자별 변경 수")
    private Map<String, Long> changesByExtension;
}

