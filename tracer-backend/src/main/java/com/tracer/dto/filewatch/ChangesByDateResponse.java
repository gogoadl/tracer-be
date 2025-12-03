package com.tracer.dto.filewatch;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "날짜별 파일 변경 내역 응답 데이터")
public class ChangesByDateResponse {
    
    @Schema(description = "날짜별 변경 내역 목록")
    private List<Map<String, Object>> changesByDate;
}

