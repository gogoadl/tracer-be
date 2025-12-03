package com.tracer.dto.common;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 공통 API 응답 형식
 * @param <T> 응답 데이터 타입
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "공통 API 응답")
public class ApiResponse<T> {
    
    @Schema(description = "응답 상태 코드 (200: 성공, 400: 잘못된 요청, 500: 서버 오류)", example = "200")
    private String status;
    
    @Schema(description = "응답 메시지", example = "요청이 성공적으로 처리되었습니다")
    private String message;
    
    @Schema(description = "응답 데이터")
    private T data;
    
    /**
     * 성공 응답 생성
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>("200", "요청이 성공적으로 처리되었습니다", data);
    }
    
    /**
     * 성공 응답 생성 (커스텀 메시지)
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>("200", message, data);
    }
    
    /**
     * 실패 응답 생성
     */
    public static <T> ApiResponse<T> error(String status, String message) {
        return new ApiResponse<>(status, message, null);
    }
    
    /**
     * 실패 응답 생성 (데이터 포함)
     */
    public static <T> ApiResponse<T> error(String status, String message, T data) {
        return new ApiResponse<>(status, message, data);
    }
}

