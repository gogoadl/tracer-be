package com.tracer.dto.filewatch;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "감시 폴더 토글 응답 데이터")
public class ToggleWatchFolderResponse {
    
    @Schema(description = "활성화 여부", example = "True")
    private String isActive;
}

