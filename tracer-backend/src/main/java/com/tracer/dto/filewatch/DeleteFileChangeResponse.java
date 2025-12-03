package com.tracer.dto.filewatch;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "파일 변경 내역 삭제 응답 데이터")
public class DeleteFileChangeResponse {
    
    @Schema(description = "삭제된 변경 내역 ID", example = "1")
    private Integer id;
}

