package com.bookstore.services.impl;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.dto.auth.AuthResponse;
import com.bookstore.dto.auth.LoginRequest;
import com.bookstore.dto.auth.RegisterRequest;
import com.bookstore.exception.AccountNotVerifiedException;
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
            throw new ConflictException("Email này đã được đăng ký trong hệ thống. Vui lòng đăng nhập hoặc sử dụng email khác.");
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
                .vipExpiration(null)
                .hasSelectedPreferences(false)
                .build();

        userRepository.save(user);
    }

    @Override
    public void sendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Email không tồn tại trong hệ thống"));

        // Xóa token cũ nếu có
        verificationTokenRepository.deleteByUser(user);
        verificationTokenRepository.flush();

        String token = UUID.randomUUID().toString();
        VerificationToken vt = VerificationToken.builder()
                .token(token)
                .user(user)
                .expiresAt(LocalDateTime.now().plusMinutes(30))
                .build();
        verificationTokenRepository.save(vt);
        verificationTokenRepository.flush();

        // Gửi email bất đồng bộ (Background worker)
        try {
            emailService.sendVerificationEmail(user.getEmail(), token);
        } catch (Exception e) {
            // Không chặn luồng nếu gửi mail gặp sự cố
        }
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Email hoặc mật khẩu không chính xác"));

        boolean isValidPass = passwordEncoder.matches(req.getPassword(), user.getPassword());
        if (!isValidPass) {
            throw new UnauthorizedException("Email hoặc mật khẩu không chính xác");
        }

        if (user.getStatus() == AccountStatus.LOCKED || user.isDeleted()) {
            throw new UnauthorizedException("Tài khoản đã bị khóa hoặc không tồn tại.");
        }

        // Tự động kích hoạt nếu tài khoản cũ còn ở trạng thái PENDING
        if (user.getStatus() == AccountStatus.PENDING) {
            user.setStatus(AccountStatus.ACTIVE);
            userRepository.save(user);
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
    

        Optional<VerificationToken> vtOpt = verificationTokenRepository.findByToken(token);
        
        if (vtOpt.isEmpty()) {
          
            return;
        }

        VerificationToken vt = vtOpt.get();
       

        if (vt.getExpiresAt().isBefore(LocalDateTime.now())) {
        
            verificationTokenRepository.delete(vt);
            throw new BadRequestException("Token đã hết hạn, vui lòng đăng ký lại");
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
