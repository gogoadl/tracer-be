package com.tracer.dto.filewatch;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "감시 폴더 추가 응답 데이터")
public class AddWatchFolderResponse {
    
    @Schema(description = "추가된 폴더 정보")
    private WatchFolderDto folder;
}

