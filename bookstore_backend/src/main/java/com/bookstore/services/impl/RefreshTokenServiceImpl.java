package com.bookstore.services.impl;

import com.bookstore.exception.UnauthorizedException;
import com.bookstore.models.RefreshToken;
import com.bookstore.models.User;
import com.bookstore.repository.RefreshTokenRepository;
import com.bookstore.services.RefreshTokenService;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.apache.commons.codec.digest.DigestUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;

    //@Value("${refresh-token.expiration-days}")
    private long expirationDays = 7;

    @Override
    public String createRefreshToken(User user) {
        String rawToken = UUID.randomUUID().toString();
        RefreshToken entity = RefreshToken.builder()
                .tokenHash(hash(rawToken))
                .user(user)
                .expiresAt(LocalDateTime.now().plusDays(expirationDays))
                .revoked(false)
                .build();
        refreshTokenRepository.save(entity);
        return rawToken;
    }

    private String hash(String raw) {
        return DigestUtils.sha256Hex(raw);
    }

    public RefreshToken validateAndGet(String rawToken) {
        RefreshToken entity = refreshTokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new UnauthorizedException("Refresh token không hợp lệ"));
        if (entity.isRevoked() || entity.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Refresh token đã hết hạn hoặc bị thu hồi");
        }
        return entity;
    }

    public void revoke(RefreshToken entity) {
        entity.setRevoked(true);
        entity.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(entity);
    }
    
}
