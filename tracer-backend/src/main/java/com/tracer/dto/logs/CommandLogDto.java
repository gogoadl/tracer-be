package com.tracer.dto.logs;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "명령어 로그 정보")
public class CommandLogDto {
    
    @Schema(description = "로그 ID", example = "1")
    private Integer id;
    
    @Schema(description = "타임스탬프", example = "2025-01-27T09:15:22")
    private LocalDateTime timestamp;
    
    @Schema(description = "날짜", example = "2025-01-27")
    private String date;
    
    @Schema(description = "시간", example = "09:15:22")
    private String time;
    
    @Schema(description = "사용자명", example = "john")
    private String user;
    
    @Schema(description = "디렉토리", example = "/home/user/project")
    private String directory;
    
    @Schema(description = "실행된 명령어", example = "ls -la")
    private String command;
}

