package com.bookstore.controller;

import com.bookstore.common.response.ApiResponse;
import com.bookstore.dto.auth.AuthResponse;
import com.bookstore.dto.auth.ForgotPasswordRequest;
import com.bookstore.dto.auth.LoginRequest;
import com.bookstore.dto.auth.RefreshTokenRequest;
import com.bookstore.dto.auth.RegisterRequest;
import com.bookstore.dto.auth.ResetPasswordRequest;
import com.bookstore.exception.BadRequestException;
import com.bookstore.services.AuthService;
import com.bookstore.services.PasswordResetService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    private final PasswordResetService passwordResetService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest req){
        authService.register(req);
        ApiResponse<AuthResponse> res = ApiResponse.success("Đăng ký tài khoản thành công!", null);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PostMapping("/send-verification-email")
    public ResponseEntity<ApiResponse<Void>> sendVerificationEmail(@RequestParam String email) {
        authService.sendVerificationEmail(email);
        return ResponseEntity.ok(ApiResponse.success("Email xác minh đã được gửi, vui lòng kiểm tra hộp thư.", null));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.success("Xác minh email thành công", null));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @RequestBody @Valid LoginRequest req
    ){
        ApiResponse<AuthResponse> res = ApiResponse.success("Login successfully ", authService.login(req));
        return ResponseEntity.ok(res);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @RequestBody RefreshTokenRequest req
    ){
        String refreshToken = req.getRefreshToken();
        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success("Access Token is  refreshed", response));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(
            "Nếu email tồn tại trong hệ thống, link đặt lại mật khẩu đã được gửi.", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Đặt lại mật khẩu thành công.", null));
    }
}
