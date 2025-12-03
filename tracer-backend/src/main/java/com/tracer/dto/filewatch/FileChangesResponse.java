package com.tracer.dto.filewatch;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "파일 변경 내역 조회 응답 데이터")
public class FileChangesResponse {
    
    @Schema(description = "전체 변경 내역 수", example = "200")
    private Long total;
    
    @Schema(description = "현재 페이지의 변경 내역 수", example = "100")
    private Integer count;
    
    @Schema(description = "변경 내역 목록")
    private List<FileChangeDto> changes;
}

