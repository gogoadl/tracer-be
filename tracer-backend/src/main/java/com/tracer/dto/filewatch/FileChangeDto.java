package com.tracer.dto.filewatch;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "파일 변경 정보")
public class FileChangeDto {
    
    @Schema(description = "변경 ID", example = "1")
    private Integer id;
    
    @Schema(description = "타임스탬프", example = "2025-01-27T09:15:22")
    private LocalDateTime timestamp;
    
    @Schema(description = "날짜", example = "2025-01-27")
    private String date;
    
    @Schema(description = "이벤트 타입 (created, deleted, modified, moved)", example = "modified")
    private String eventType;
    
    @Schema(description = "파일 경로", example = "/home/user/project/config.yml")
    private String filePath;
    
    @Schema(description = "디렉토리", example = "/home/user/project")
    private String directory;
    
    @Schema(description = "파일명", example = "config.yml")
    private String fileName;
    
    @Schema(description = "파일 확장자", example = ".yml")
    private String fileExtension;
    
    @Schema(description = "파일 크기 (바이트)", example = "1024")
    private Integer size;
    
    @Schema(description = "디렉토리 여부", example = "False")
    private String isDirectory;
    
    @Schema(description = "원본 경로 (이동 이벤트의 경우)", example = "/home/user/old/config.yml")
    private String srcPath;
}

