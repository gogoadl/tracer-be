package com.tracer.dto.filewatch;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "특정 날짜 파일 변경 내역 응답 데이터")
public class ChangesForDateResponse {
    
    @Schema(description = "날짜", example = "2025-01-27")
    private String date;
    
    @Schema(description = "변경 내역 수", example = "25")
    private Integer count;
    
    @Schema(description = "변경 내역 목록")
    private List<FileChangeDto> changes;
}

