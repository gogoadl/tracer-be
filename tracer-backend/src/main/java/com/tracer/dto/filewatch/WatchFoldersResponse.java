package com.tracer.dto.filewatch;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "감시 폴더 목록 응답 데이터")
public class WatchFoldersResponse {
    
    @Schema(description = "전체 폴더 수", example = "5")
    private Integer total;
    
    @Schema(description = "폴더 목록")
    private List<WatchFolderDto> folders;
}

