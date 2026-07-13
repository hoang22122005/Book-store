package com.bookstore.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookstore.models.RefreshToken;
import com.bookstore.models.User;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String token);

    void deleteByUser(User user);

    @Modifying
    @Query("""
        DELETE FROM RefreshToken r
        WHERE (r.expiresAt < :expiredBefore)
           OR (r.revoked = true AND r.revokedAt < :revokedBefore)
        """)
    void deleteStaleTokens(
            @Param("expiredBefore") LocalDateTime expiredBefore,
            @Param("revokedBefore") LocalDateTime revokedBefore
    );

}

