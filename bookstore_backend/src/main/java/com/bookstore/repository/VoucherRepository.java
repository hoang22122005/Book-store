package com.bookstore.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookstore.models.Voucher;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Integer> {
    Optional<Voucher> findByCode(String code);

    Optional<Voucher> findByCodeAndScopeIgnoreCase(String code, String scope);

    boolean existsByCode(String code);

    @Query("""
            SELECT v
            FROM Voucher v
            WHERE UPPER(v.scope) = 'GLOBAL'
              AND v.code NOT IN (
                  SELECT uv.voucher.code
                  FROM UserVoucher uv
                  WHERE uv.user.userId = :userId
              )
            """)
    Page<Voucher> findUnclaimedVouchers(@Param("userId") int userId, Pageable pageable);
}
