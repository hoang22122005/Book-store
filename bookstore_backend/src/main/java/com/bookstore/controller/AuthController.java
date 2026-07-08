package com.bookstore.controller;

import com.bookstore.common.response.ApiResponse;
import com.bookstore.dto.auth.AuthResponse;
import com.bookstore.dto.auth.LoginRequest;
import com.bookstore.dto.auth.RefreshTokenRequest;import com.bookstore.dto.auth.RegisterRequest;
import com.bookstore.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest req){
        authService.register(req);
        ApiResponse<AuthResponse> res = ApiResponse.success("Register successfully ", null);

        return ResponseEntity.status(HttpStatus.CREATED).body(res);


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







}
