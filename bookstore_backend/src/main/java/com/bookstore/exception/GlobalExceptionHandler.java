package com.bookstore.exception;

import com.bookstore.common.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    //bắt lỗi custom
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorized(UnauthorizedException ex){
        ApiResponse<Void> res = ApiResponse.error(ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);

    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiResponse<Void>>  handleConflict(ConflictException ex){
        ApiResponse<Void> res = ApiResponse.error(ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(res);
    }

    @ExceptionHandler (Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneral (Exception ex){
        ApiResponse<Void> res = ApiResponse.error(ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(res);

    }
}
