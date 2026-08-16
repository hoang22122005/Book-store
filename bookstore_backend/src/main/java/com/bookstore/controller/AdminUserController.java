package com.bookstore.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.common.response.ApiResponse;
import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.user.AdminResetPasswordRequest;
import com.bookstore.dto.user.AdminUserResponse;
import com.bookstore.dto.user.AdminUserStatsResponse;
import com.bookstore.dto.user.CreateUserByAdminRequest;
import com.bookstore.dto.user.UpdateUserByAdminRequest;
import com.bookstore.dto.user.UpdateUserRoleRequest;
import com.bookstore.dto.user.UpdateUserStatusRequest;
import com.bookstore.models.enums.AccountStatus;
import com.bookstore.models.enums.Role;
import com.bookstore.services.AdminUserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminUserResponse>>> getAllUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) AccountStatus status,
            @RequestParam(required = false) Boolean isDeleted,
            @PageableDefault(size = 20, sort = "userId", direction = Sort.Direction.DESC) Pageable pageable) {

        PageResponse<AdminUserResponse> users = adminUserService.getAllUsers(keyword, role, status, isDeleted, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách người dùng thành công", users));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminUserStatsResponse>> getUserStats() {
        AdminUserStatsResponse stats = adminUserService.getUserStats();
        return ResponseEntity.ok(ApiResponse.success("Lấy thống kê người dùng thành công", stats));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getUserById(@PathVariable int userId) {
        AdminUserResponse user = adminUserService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin người dùng thành công", user));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminUserResponse>> createUser(
            @Valid @RequestBody CreateUserByAdminRequest request) {

        AdminUserResponse created = adminUserService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo người dùng thành công", created));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUser(
            @PathVariable int userId,
            @Valid @RequestBody UpdateUserByAdminRequest request) {

        AdminUserResponse updated = adminUserService.updateUser(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin người dùng thành công", updated));
    }

    @PatchMapping("/{userId}/role")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUserRole(
            @PathVariable int userId,
            @Valid @RequestBody UpdateUserRoleRequest request) {

        AdminUserResponse updated = adminUserService.updateUserRole(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật vai trò người dùng thành công", updated));
    }

    @PatchMapping("/{userId}/status")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUserStatus(
            @PathVariable int userId,
            @Valid @RequestBody UpdateUserStatusRequest request) {

        AdminUserResponse updated = adminUserService.updateUserStatus(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái người dùng thành công", updated));
    }

    @PostMapping("/{userId}/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @PathVariable int userId,
            @Valid @RequestBody AdminResetPasswordRequest request) {

        adminUserService.resetUserPassword(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Đặt lại mật khẩu thành công", null));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable int userId) {
        adminUserService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Thay đổi trạng thái tài khoản thành công", null));
    }
}
