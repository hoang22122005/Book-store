package com.bookstore.services.impl;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.exception.InvalidTokenException;
import com.bookstore.models.PasswordResetToken;
import com.bookstore.models.RefreshToken;
import com.bookstore.models.User;
import com.bookstore.repository.PasswordResetTokenRepository;
import com.bookstore.repository.RefreshTokenRepository;
import com.bookstore.repository.UserRepository;

import com.bookstore.services.PasswordResetService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PasswordResetServicImpl implements PasswordResetService {
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService; 

    private static final long EXPIRATION_MINUTES = 15;

      @Transactional
    public void forgotPassword(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return; // tránh lộ email có tồn tại hay không 
        }
        User user = userOpt.get();

        //xóa cái cũ
        tokenRepository.deleteByUser(user);
        tokenRepository.flush();

        String rawToken = UUID.randomUUID().toString();
        String tokenHash = hash(rawToken);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setTokenHash(tokenHash);
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES));
        resetToken.setUsed(false);
        tokenRepository.save(resetToken);

        //gửi email chưa link reset, link này dẫn tới giao diện frontend, frontend lấy token từ url xuống
        String resetLink = "http://localhost:3000/reset-password?token=" + rawToken;
        emailService.sendResetPasswordEmail(user.getEmail(), resetLink);
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        String tokenHash = hash(rawToken);

        PasswordResetToken resetToken = tokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new InvalidTokenException("Token không hợp lệ"));

        if (resetToken.isUsed()) {
            throw new InvalidTokenException("Token đã được sử dụng");
        }
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Token đã hết hạn");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        resetToken.setUsedAt(LocalDateTime.now());
        tokenRepository.save(resetToken);

        
    }

    private String hash(String raw) {
        return DigestUtils.sha256Hex(raw);
    }



    
}
