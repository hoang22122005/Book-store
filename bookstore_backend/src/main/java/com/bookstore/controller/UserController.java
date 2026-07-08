package com.bookstore.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.common.response.ApiResponse;
import com.bookstore.dto.auth.RefreshTokenRequest;
import com.bookstore.dto.user.ChangePasswordRequest;
import com.bookstore.dto.user.UpdateUserRequest;
import com.bookstore.dto.user.UserResponse;
import com.bookstore.services.AuthService;
import com.bookstore.services.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestBody @Valid RefreshTokenRequest req
    ){
        String refreshToken = req.getRefreshToken();
        authService.logout(refreshToken);
        ApiResponse<Void> res = ApiResponse.success("Logout successfully ", null);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMyProfile(){
        ApiResponse<UserResponse> res = ApiResponse.success("Get profile successfully", userService.getMyProfile());
        return ResponseEntity.ok(res);
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @RequestBody @Valid UpdateUserRequest request
    ){
        ApiResponse<UserResponse> res = ApiResponse.success("Update profile successfully", userService.updateProfile(request));
        return ResponseEntity.ok(res);
    }

    @PatchMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestBody @Valid ChangePasswordRequest request
    ){
        userService.changePassword(request);
        ApiResponse<Void> res = ApiResponse.success("Change password successfully", null);
        return ResponseEntity.ok(res);
    }

}
