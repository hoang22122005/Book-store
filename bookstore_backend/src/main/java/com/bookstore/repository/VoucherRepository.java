package com.bookstore.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookstore.models.Voucher;

import jakarta.persistence.LockModeType;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Integer> {
    Optional<Voucher> findByCode(String code);

    Optional<Voucher> findByCodeAndScopeIgnoreCase(String code, String scope);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from Voucher v where v.code = :code and upper(v.scope) = upper(:scope)")
    Optional<Voucher> findByCodeAndScopeIgnoreCaseForUpdate(
            @Param("code") String code,
            @Param("scope") String scope);

    @Modifying(flushAutomatically = true)
    @Query("""
            update Voucher v
               set v.usageCount = case when v.usageCount > 0 then v.usageCount - 1 else 0 end
             where v.voucherId = :voucherId
               and upper(v.scope) = 'GLOBAL'
            """)
    int decrementGlobalUsageCount(@Param("voucherId") int voucherId);

    boolean existsByCode(String code);

    @Query("""
            SELECT v
            FROM Voucher v
            WHERE UPPER(v.scope) = 'GLOBAL'
              AND (v.usageLimit IS NULL OR v.usageCount < v.usageLimit)
              AND v.code NOT IN (
                  SELECT uv.voucher.code
                  FROM UserVoucher uv
                  WHERE uv.user.userId = :userId
              )
            """)
    Page<Voucher> findUnclaimedVouchers(@Param("userId") int userId, Pageable pageable);
}
