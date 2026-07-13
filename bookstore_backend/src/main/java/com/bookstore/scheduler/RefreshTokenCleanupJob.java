package com.bookstore.scheduler;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.repository.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RefreshTokenCleanupJob {

    private final RefreshTokenRepository refreshTokenRepository;

    private static final int RETENTION_DAYS = 15;

    @Scheduled(cron = "0 0 3 * * *") // chạy 3h sáng mỗi ngày
    @Transactional
    public void cleanupStaleTokens() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(RETENTION_DAYS);
        refreshTokenRepository.deleteStaleTokens(threshold, threshold);
    }
}