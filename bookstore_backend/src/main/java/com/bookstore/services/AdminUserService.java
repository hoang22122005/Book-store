package com.bookstore.services;

import org.springframework.data.domain.Pageable;

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

public interface AdminUserService {
    PageResponse<AdminUserResponse> getAllUsers(
            String keyword,
            Role role,
            AccountStatus status,
            Boolean isDeleted,
            Pageable pageable);

    AdminUserResponse getUserById(int userId);

    AdminUserResponse createUser(CreateUserByAdminRequest request);

    AdminUserResponse updateUser(int userId, UpdateUserByAdminRequest request);

    AdminUserResponse updateUserRole(int userId, UpdateUserRoleRequest request);

    AdminUserResponse updateUserStatus(int userId, UpdateUserStatusRequest request);

    void resetUserPassword(int userId, AdminResetPasswordRequest request);

    void deleteUser(int userId);

    AdminUserStatsResponse getUserStats();
}
