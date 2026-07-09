package com.bookstore.services.impl;

import com.bookstore.dto.auth.AuthResponse;
import com.bookstore.dto.auth.LoginRequest;
import com.bookstore.dto.auth.RegisterRequest;
import com.bookstore.exception.ConflictException;
import com.bookstore.exception.NotFoundException;
import com.bookstore.exception.UnauthorizedException;
import com.bookstore.models.RefreshToken;
import com.bookstore.models.User;
import com.bookstore.models.enums.Role;
import com.bookstore.repository.RefreshTokenRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.services.AuthService;
import com.bookstore.security.JwtService;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

import com.bookstore.services.RefreshTokenService;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService; 
   

    @Override
    public void register(RegisterRequest req) {
        // kiểm tra email tồn tại
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ConflictException("Email was existed");
        }

        String password = passwordEncoder.encode(req.getPassword());

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .role(Role.USER.name().toLowerCase())
                .address(req.getAddress())
                .dob(req.getDob())
                .phone(req.getPhone())
                .gender(req.getGender())
                .career(req.getCareer())
                .isDeleted(false)
                .password(password)
                .urlAvt(null)
                .isVip(false)
                .vipExpiration(null).build();

        userRepository.save(user);

    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest req) {
        // Tìm user theo email
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        // So sánh password
        boolean isValidPass = passwordEncoder.matches(req.getPassword(), user.getPassword());
        if (!isValidPass) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String accessToken = jwtService.generateToken(user);

        String refreshToken = refreshTokenService.createRefreshToken(user); 

        return AuthResponse.builder().accessToken(accessToken).refreshToken(refreshToken).build();

    }

    @Override
    public AuthResponse refreshToken(String refreshToken){

        RefreshToken oldToken = refreshTokenService.validateAndGet(refreshToken);

        //4. tạo access token mới
        String newAccessToken = jwtService.generateToken(oldToken.getUser());
        
        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    public void logout(String refreshToken) {
        RefreshToken token = refreshTokenService.validateAndGet(refreshToken);
        refreshTokenService.revoke(token);
    }

}
