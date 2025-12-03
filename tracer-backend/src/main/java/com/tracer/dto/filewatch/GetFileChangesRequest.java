package com.tracer.dto.filewatch;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "파일 변경 내역 조회 요청")
public class GetFileChangesRequest {
    
    @Schema(description = "시작 날짜 (YYYY-MM-DD)", example = "2025-01-01")
    private String startDate;
    
    @Schema(description = "종료 날짜 (YYYY-MM-DD)", example = "2025-01-31")
    private String endDate;
    
    @Schema(description = "이벤트 타입 필터 (created, deleted, modified, moved)", example = "modified")
    private String eventType;
    
    @Schema(description = "파일 확장자 필터", example = ".yml")
    private String fileExtension;
    
    @Schema(description = "최대 결과 수 (기본값: 100, 최대: 1000)", example = "100")
    private Integer limit = 100;
    
    @Schema(description = "페이지네이션 오프셋 (기본값: 0)", example = "0")
    private Integer offset = 0;
}

