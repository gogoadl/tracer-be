package com.tracer.dto.logs;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "로그 조회 요청")
public class GetLogsRequest {
    
    @Schema(description = "시작 날짜 (YYYY-MM-DD)", example = "2025-01-01")
    private String startDate;
    
    @Schema(description = "종료 날짜 (YYYY-MM-DD)", example = "2025-01-31")
    private String endDate;
    
    @Schema(description = "사용자명 필터", example = "john")
    private String user;
    
    @Schema(description = "검색어 (명령어 내 검색)", example = "git")
    private String search;
    
    @Schema(description = "디렉토리 필터", example = "/home/user/project")
    private String directory;
    
    @Schema(description = "최대 결과 수 (기본값: 100, 최대: 1000)", example = "100")
    private Integer limit = 100;
    
    @Schema(description = "페이지네이션 오프셋 (기본값: 0)", example = "0")
    private Integer offset = 0;
}

