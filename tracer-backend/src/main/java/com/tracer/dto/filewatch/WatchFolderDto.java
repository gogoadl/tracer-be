package com.tracer.dto.filewatch;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "감시 폴더 정보")
public class WatchFolderDto {
    
    @Schema(description = "폴더 ID", example = "1")
    private Integer id;
    
    @Schema(description = "폴더 경로", example = "/home/user/project")
    private String path;
    
    @Schema(description = "활성화 여부", example = "True")
    private String isActive;
    
    @Schema(description = "파일 패턴 (쉼표로 구분)", example = "*.yml,*.conf,*.json")
    private String filePatterns;
    
    @Schema(description = "재귀적 감시 여부", example = "True")
    private String recursive;
    
    @Schema(description = "생성 일시", example = "2025-01-27T09:15:22")
    private LocalDateTime createdAt;
    
    @Schema(description = "마지막 확인 일시", example = "2025-01-27T09:15:22")
    private LocalDateTime lastChecked;
}

