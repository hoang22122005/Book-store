package com.bookstore.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bookstore.models.PasswordResetToken;
import com.bookstore.models.User;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    // optional: invalidate token cũ khi user request forgot-password nhiều lần
    List<PasswordResetToken> findByUser_UserIdAndUsedFalse(Long userId);

    void deleteByUser(User user);
}
