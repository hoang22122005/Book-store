package com.bookstore.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookstore.models.User;
import com.bookstore.models.enums.AccountStatus;
import com.bookstore.models.enums.Role;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("""
            SELECT u FROM User u
            WHERE (:keyword IS NULL OR :keyword = ''
                   OR LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(u.phone) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:role IS NULL OR u.role = :role)
              AND (:status IS NULL OR u.status = :status)
              AND (:isDeleted IS NULL OR u.isDeleted = :isDeleted)
            """)
    Page<User> searchUsers(
            @Param("keyword") String keyword,
            @Param("role") Role role,
            @Param("status") AccountStatus status,
            @Param("isDeleted") Boolean isDeleted,
            Pageable pageable);

    long countByStatus(AccountStatus status);

    long countByIsDeletedTrue();

    long countByRole(Role role);

    long countByIsVipTrue();
}

