package com.bookstore.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.bookstore.dto.user.ChangePasswordRequest;
import com.bookstore.dto.user.GenrePreferenceRequest;
import com.bookstore.dto.user.UpdateUserRequest;
import com.bookstore.dto.user.UserResponse;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.NotFoundException;
import com.bookstore.mapper.UserMapper;
import com.bookstore.models.Genre;
import com.bookstore.models.User;
import com.bookstore.models.UserGenrePreference;
import com.bookstore.repository.GenreRepo;
import com.bookstore.repository.UserGenrePreferenceRepo;
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
    private final UserGenrePreferenceRepo userGenrePreferenceRepo;
    private final GenreRepo genreRepo;

    private User findCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new NotFoundException("User not found"));
    }

    @Override
    public UserResponse getMyProfile() {
        User user = findCurrentUser();
        UserResponse response = userMapper.toResponse(user);
        List<Integer> preferredGenreIds = userGenrePreferenceRepo.findGenreIdsByUserId(user.getUserId());
        response.setPreferredGenreIds(preferredGenreIds);
        return response;
    }

    @Override
    public UserResponse updateProfile(UpdateUserRequest req) {
        User user = findCurrentUser();

        // Cập nhật trường text bằng mapper
        userMapper.updateProfile(req, user);

        User savedUser = userRepository.save(user);
        UserResponse response = userMapper.toResponse(savedUser);
        List<Integer> preferredGenreIds = userGenrePreferenceRepo.findGenreIdsByUserId(savedUser.getUserId());
        response.setPreferredGenreIds(preferredGenreIds);
        return response;
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
        UserResponse response = userMapper.toResponse(savedUser);
        List<Integer> preferredGenreIds = userGenrePreferenceRepo.findGenreIdsByUserId(savedUser.getUserId());
        response.setPreferredGenreIds(preferredGenreIds);
        return response;
    }

    @Override
    @Transactional
    public UserResponse saveUserGenrePreferences(GenrePreferenceRequest request) {
        User user = findCurrentUser();
        List<Integer> genreIds = request.getGenreIds().stream().distinct().collect(Collectors.toList());

        if (genreIds.isEmpty()) {
            throw new BadRequestException("Vui lòng chọn ít nhất 1 thể loại yêu thích");
        }

        List<Genre> genres = genreRepo.findAllById(genreIds);
        if (genres.size() != genreIds.size()) {
            throw new BadRequestException("Một số thể loại đã chọn không tồn tại trong hệ thống");
        }

        // Xóa các lựa chọn cũ
        userGenrePreferenceRepo.deleteByUserId(user.getUserId());

        // Lưu danh sách lựa chọn mới
        List<UserGenrePreference> preferences = genres.stream()
                .map(genre -> UserGenrePreference.builder()
                        .user(user)
                        .genre(genre)
                        .build())
                .collect(Collectors.toList());

        userGenrePreferenceRepo.saveAll(preferences);

        // Cập nhật trạng thái hasSelectedPreferences của user
        user.setHasSelectedPreferences(true);
        User savedUser = userRepository.save(user);

        UserResponse response = userMapper.toResponse(savedUser);
        response.setPreferredGenreIds(genreIds);
        return response;
    }

    @Override
    public List<Integer> getUserGenrePreferences() {
        User user = findCurrentUser();
        return userGenrePreferenceRepo.findGenreIdsByUserId(user.getUserId());
    }
}