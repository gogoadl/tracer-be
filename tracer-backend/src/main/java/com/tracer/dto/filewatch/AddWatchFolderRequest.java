package com.tracer.dto.filewatch;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "감시 폴더 추가 요청")
public class AddWatchFolderRequest {
    
    @Schema(description = "폴더 경로", required = true, example = "/home/user/project")
    private String path;
    
    @Schema(description = "파일 패턴 (쉼표로 구분)", example = "*.yml,*.conf,*.json")
    private String filePatterns;
    
    @Schema(description = "재귀적 감시 여부 (기본값: true)", example = "true")
    private Boolean recursive = true;
}

