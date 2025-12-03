package com.tracer.dto.logs;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "날짜별 로그 그룹화 응답 데이터")
public class LogsByDateResponse {
    
    @Schema(description = "날짜별 로그 목록")
    private List<Map<String, Object>> logsByDate;
}

