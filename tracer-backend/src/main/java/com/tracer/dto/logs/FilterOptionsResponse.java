package com.tracer.dto.logs;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "필터 옵션 응답 데이터")
public class FilterOptionsResponse {
    
    @Schema(description = "사용 가능한 사용자 목록")
    private List<String> users;
    
    @Schema(description = "사용 가능한 디렉토리 목록")
    private List<String> directories;
}

