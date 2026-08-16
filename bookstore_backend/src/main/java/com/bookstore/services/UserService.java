package com.bookstore.services;

import org.springframework.web.multipart.MultipartFile;

import com.bookstore.dto.user.ChangePasswordRequest;
import com.bookstore.dto.user.UpdateUserRequest;
import com.bookstore.dto.user.UserResponse;

public interface UserService {
    UserResponse getMyProfile();
    UserResponse updateProfile(UpdateUserRequest request);
    void changePassword(ChangePasswordRequest request);
    UserResponse uploadAvatar(MultipartFile file);
    UserResponse saveUserGenrePreferences(com.bookstore.dto.user.GenrePreferenceRequest request);
    java.util.List<Integer> getUserGenrePreferences();
}
