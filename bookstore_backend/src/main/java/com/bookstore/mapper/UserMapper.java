package com.bookstore.mapper;

import org.springframework.stereotype.Component;

import com.bookstore.dto.user.AdminUserResponse;
import com.bookstore.dto.user.UpdateUserByAdminRequest;
import com.bookstore.dto.user.UpdateUserRequest;
import com.bookstore.dto.user.UserResponse;
import com.bookstore.models.User;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }
        return UserResponse.builder()
                .id(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getName())
                .role(user.getRole() != null ? user.getRole().name() : "USER")
                .phoneNumber(user.getPhone())
                .address(user.getAddress())
                .gender(user.getGender())
                .career(user.getCareer())
                .urlAvt(user.getUrlAvt())
                .build();
    }

    public AdminUserResponse toAdminResponse(User user) {
        if (user == null) {
            return null;
        }
        return AdminUserResponse.builder()
                .id(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getName())
                .role(user.getRole())
                .status(user.getStatus())
                .phoneNumber(user.getPhone())
                .address(user.getAddress())
                .dob(user.getDob())
                .gender(user.getGender())
                .career(user.getCareer())
                .urlAvt(user.getUrlAvt())
                .isVip(user.isVip())
                .vipExpiration(user.getVipExpiration())
                .isDeleted(user.isDeleted())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public void updateProfile(UpdateUserRequest req, User user) {
        if (req == null || user == null) {
            return;
        }
        if (req.getName() != null) user.setName(req.getName());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getAddress() != null) user.setAddress(req.getAddress());
        if (req.getGender() != null) user.setGender(req.getGender());
        if (req.getCareer() != null) user.setCareer(req.getCareer());
        if (req.getUrlAvt() != null) user.setUrlAvt(req.getUrlAvt());
    }

    public void updateFromAdminRequest(UpdateUserByAdminRequest req, User user) {
        if (req == null || user == null) {
            return;
        }
        if (req.getName() != null) user.setName(req.getName());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getAddress() != null) user.setAddress(req.getAddress());
        if (req.getDob() != null) user.setDob(req.getDob());
        if (req.getGender() != null) user.setGender(req.getGender());
        if (req.getCareer() != null) user.setCareer(req.getCareer());
        if (req.getUrlAvt() != null) user.setUrlAvt(req.getUrlAvt());
        if (req.getRole() != null) user.setRole(req.getRole());
        if (req.getStatus() != null) user.setStatus(req.getStatus());
        if (req.getIsDeleted() != null) user.setDeleted(req.getIsDeleted());
        if (req.getIsVip() != null) user.setVip(req.getIsVip());
        if (req.getVipExpiration() != null) user.setVipExpiration(req.getVipExpiration());
    }
}

