package com.bookstore.services.impl;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.dto.auth.AuthResponse;
import com.bookstore.dto.auth.LoginRequest;
import com.bookstore.dto.auth.RegisterRequest;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ConflictException;
import com.bookstore.exception.UnauthorizedException;
import com.bookstore.mapper.UserMapper;
import com.bookstore.models.RefreshToken;
import com.bookstore.models.User;
import com.bookstore.models.VerificationToken;
import com.bookstore.models.enums.AccountStatus;
import com.bookstore.models.enums.Role;
import com.bookstore.repository.UserRepository;
import com.bookstore.repository.VerificationTokenRepository;
import com.bookstore.security.JwtService;
import com.bookstore.services.AuthService;
import com.bookstore.services.RefreshTokenService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final EmailService emailService;
    private final UserMapper userMapper;

    @Override
    public void register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ConflictException("Email was existed");
        }

        String password = passwordEncoder.encode(req.getPassword());

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .role(Role.USER)
                .status(AccountStatus.ACTIVE)
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
    public void sendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Email không tồn tại trong hệ thống"));

        String token = UUID.randomUUID().toString();
        VerificationToken vt = VerificationToken.builder()
                .token(token)
                .user(user)
                .expiresAt(LocalDateTime.now().plusMinutes(30))
                .build();
        verificationTokenRepository.save(vt);

        try {
            emailService.sendVerificationEmail(user.getEmail(), token);
        } catch (Exception e) {
            System.err.println("Gửi email xác minh thất bại: " + e.getMessage());
            throw new BadRequestException("Không thể gửi email xác minh: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        boolean isValidPass = passwordEncoder.matches(req.getPassword(), user.getPassword());
        if (!isValidPass) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String accessToken = jwtService.generateToken(user);
        String refreshToken = refreshTokenService.createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .role(user.getRole().name())
                .user(userMapper.toResponse(user))
                .build();
    }

    @Override
    public void verifyEmail(String token) {
        VerificationToken vt = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Token khong hop le"));

        if (vt.getExpiresAt().isBefore(LocalDateTime.now())) {
            verificationTokenRepository.delete(vt);
            throw new BadRequestException("Token da het han, vui long dang ky lai");
        }

        User user = vt.getUser();
        user.setStatus(AccountStatus.ACTIVE);
        userRepository.save(user);
        verificationTokenRepository.delete(vt);
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        RefreshToken oldToken = refreshTokenService.validateAndGet(refreshToken);
        String newAccessToken = jwtService.generateToken(oldToken.getUser());
        String newRefreshToken = refreshTokenService.rotate(oldToken);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    @Override
    public void logout(String refreshToken) {
        RefreshToken token = refreshTokenService.validateAndGet(refreshToken);
        refreshTokenService.revoke(token);
    }
}
