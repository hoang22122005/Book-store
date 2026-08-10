package com.bookstore.services.impl;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.bookstore.dto.user.ChangePasswordRequest;
import com.bookstore.dto.user.UpdateUserRequest;
import com.bookstore.dto.user.UserResponse;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.NotFoundException;
import com.bookstore.mapper.UserMapper;
import com.bookstore.models.User;
import com.bookstore.repository.UserRepository;
import com.bookstore.services.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final CloudinaryService cloudinaryService;

    private User findCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new NotFoundException("User not found"));
    }

    @Override
    public UserResponse getMyProfile() {
        User user = findCurrentUser();
        return userMapper.toResponse(user);
    }

    @Override
    public UserResponse updateProfile(UpdateUserRequest req) {
        User user = findCurrentUser();

        // Cập nhật trường text bằng mapper
        userMapper.updateProfile(req, user);

        User savedUser = userRepository.save(user);

        return userMapper.toResponse(savedUser);
    }

    @Override
    public void changePassword(ChangePasswordRequest req) {
        User user = findCurrentUser();

        if(!passwordEncoder.matches(req.getOldPassword(), user.getPassword())){
            throw new BadRequestException("Wrong password");
        }

        if(passwordEncoder.matches(req.getNewPassword(), user.getPassword())){
            throw new BadRequestException("New password cannot be same as old password");
        }
        
        if(!req.getNewPassword().equals(req.getConfirmPassword())){
            throw new BadRequestException("Confirm password not match");
        }
        String hashPassword = passwordEncoder.encode(req.getNewPassword());
        user.setPassword(hashPassword);

        userRepository.save(user);
    }

    @Override
    public UserResponse uploadAvatar(MultipartFile file) {
        User user = findCurrentUser();

        // Xóa ảnh cũ trên Cloudinary nếu tồn tại
        if (user.getUrlAvt() != null && !user.getUrlAvt().isBlank()) {
            cloudinaryService.deleteImage(user.getUrlAvt());
        }

        // Upload ảnh mới và lưu URL vào DB
        String newAvatarUrl = cloudinaryService.uploadAvatar(file);
        user.setUrlAvt(newAvatarUrl);

        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }
}