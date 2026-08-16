package com.bookstore.services.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.user.AdminResetPasswordRequest;
import com.bookstore.dto.user.AdminUserResponse;
import com.bookstore.dto.user.AdminUserStatsResponse;
import com.bookstore.dto.user.CreateUserByAdminRequest;
import com.bookstore.dto.user.UpdateUserByAdminRequest;
import com.bookstore.dto.user.UpdateUserRoleRequest;
import com.bookstore.dto.user.UpdateUserStatusRequest;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ConflictException;
import com.bookstore.exception.NotFoundException;
import com.bookstore.mapper.UserMapper;
import com.bookstore.models.User;
import com.bookstore.models.enums.AccountStatus;
import com.bookstore.models.enums.Role;
import com.bookstore.repository.UserRepository;
import com.bookstore.services.AdminUserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    private String getCurrentUserEmail() {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            return null;
        }
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AdminUserResponse> getAllUsers(
            String keyword,
            Role role,
            AccountStatus status,
            Boolean isDeleted,
            Pageable pageable) {

        String trimmedKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        Page<User> userPage = userRepository.searchUsers(trimmedKeyword, role, status, isDeleted, pageable);
        Page<AdminUserResponse> responsePage = userPage.map(userMapper::toAdminResponse);

        return PageResponse.toPageResponse(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserResponse getUserById(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng với ID: " + userId));
        return userMapper.toAdminResponse(user);
    }

    @Override
    @Transactional
    public AdminUserResponse createUser(CreateUserByAdminRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email " + request.getEmail() + " đã tồn tại trong hệ thống");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        AccountStatus accountStatus = request.getStatus() != null ? request.getStatus() : AccountStatus.ACTIVE;

        User user = User.builder()
                .email(request.getEmail())
                .password(hashedPassword)
                .name(request.getName())
                .role(request.getRole())
                .status(accountStatus)
                .phone(request.getPhone())
                .address(request.getAddress())
                .dob(request.getDob())
                .gender(request.getGender())
                .career(request.getCareer())
                .isVip(request.getIsVip() != null ? request.getIsVip() : false)
                .isDeleted(false)
                .build();

        User saved = userRepository.save(user);
        return userMapper.toAdminResponse(saved);
    }

    @Override
    @Transactional
    public AdminUserResponse updateUser(int userId, UpdateUserByAdminRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng với ID: " + userId));

        String currentEmail = getCurrentUserEmail();
        if (currentEmail != null && currentEmail.equalsIgnoreCase(user.getEmail())) {
            if (request.getRole() != null && request.getRole() != Role.ADMIN) {
                throw new BadRequestException("Bạn không thể tự hạ vai trò ADMIN của chính mình");
            }
            if (request.getStatus() != null && request.getStatus() != AccountStatus.ACTIVE) {
                throw new BadRequestException("Bạn không thể tự khóa tài khoản của chính mình");
            }
            if (request.getIsDeleted() != null && request.getIsDeleted()) {
                throw new BadRequestException("Bạn không thể tự xóa tài khoản của chính mình");
            }
        }

        userMapper.updateFromAdminRequest(request, user);
        User updated = userRepository.save(user);
        return userMapper.toAdminResponse(updated);
    }

    @Override
    @Transactional
    public AdminUserResponse updateUserRole(int userId, UpdateUserRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng với ID: " + userId));

        String currentEmail = getCurrentUserEmail();
        if (currentEmail != null && currentEmail.equalsIgnoreCase(user.getEmail()) && request.getRole() != Role.ADMIN) {
            throw new BadRequestException("Bạn không thể tự hạ vai trò ADMIN của chính mình");
        }

        user.setRole(request.getRole());
        User updated = userRepository.save(user);
        return userMapper.toAdminResponse(updated);
    }

    @Override
    @Transactional
    public AdminUserResponse updateUserStatus(int userId, UpdateUserStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng với ID: " + userId));

        String currentEmail = getCurrentUserEmail();
        if (currentEmail != null && currentEmail.equalsIgnoreCase(user.getEmail())) {
            if (request.getStatus() != null && request.getStatus() != AccountStatus.ACTIVE) {
                throw new BadRequestException("Bạn không thể tự khóa tài khoản của chính mình");
            }
            if (request.getIsDeleted() != null && request.getIsDeleted()) {
                throw new BadRequestException("Bạn không thể tự vô hiệu hóa tài khoản của chính mình");
            }
        }

        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }
        if (request.getIsDeleted() != null) {
            user.setDeleted(request.getIsDeleted());
        }

        User updated = userRepository.save(user);
        return userMapper.toAdminResponse(updated);
    }

    @Override
    @Transactional
    public void resetUserPassword(int userId, AdminResetPasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng với ID: " + userId));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng với ID: " + userId));

        String currentEmail = getCurrentUserEmail();
        if (currentEmail != null && currentEmail.equalsIgnoreCase(user.getEmail())) {
            throw new BadRequestException("Bạn không thể tự xóa tài khoản của chính mình");
        }

        // Toggle soft-delete
        user.setDeleted(!user.isDeleted());
        if (user.isDeleted()) {
            user.setStatus(AccountStatus.LOCKED);
        } else {
            user.setStatus(AccountStatus.ACTIVE);
        }
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserStatsResponse getUserStats() {
        long total = userRepository.count();
        long active = userRepository.countByStatus(AccountStatus.ACTIVE);
        long locked = userRepository.countByStatus(AccountStatus.LOCKED) + userRepository.countByIsDeletedTrue();
        long staff = userRepository.countByRole(Role.ADMIN)
                + userRepository.countByRole(Role.STAFF)
                + userRepository.countByRole(Role.ACCOUNTANT)
                + userRepository.countByRole(Role.WAREHOUSE_KEEPER);
        long vip = userRepository.countByIsVipTrue();

        return AdminUserStatsResponse.builder()
                .totalUsers(total)
                .activeUsers(active)
                .lockedUsers(locked)
                .staffAndAdmins(staff)
                .vipUsers(vip)
                .build();
    }
}
