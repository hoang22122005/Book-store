package com.bookstore.services;

import com.bookstore.dto.user.ChangePasswordRequest;
import com.bookstore.dto.user.UpdateUserRequest;
import com.bookstore.dto.user.UserResponse;

public interface UserService {
    UserResponse getMyProfile();
    UserResponse updateProfile(UpdateUserRequest request);
    void changePassword(ChangePasswordRequest request);
}
