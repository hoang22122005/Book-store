package com.bookstore.mapper;

import org.springframework.stereotype.Component;

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
                .role(user.getRole() != null ? user.getRole().toUpperCase() : "USER")
                .phoneNumber(user.getPhone())
                .address(user.getAddress())
                .gender(user.getGender())
                .career(user.getCareer())
                .urlAvt(user.getUrlAvt())
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
}
