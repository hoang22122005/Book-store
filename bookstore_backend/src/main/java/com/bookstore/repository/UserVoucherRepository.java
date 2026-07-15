package com.bookstore.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bookstore.models.UserVoucher;

@Repository
public interface UserVoucherRepository extends JpaRepository<UserVoucher, Integer> {
    Page<UserVoucher> findByUserUserId(int userId, Pageable pageable);
    List<UserVoucher> findByVoucherVoucherId(int voucherId);
    Optional<UserVoucher> findByUserUserIdAndVoucherCode(int userId, String code);
    boolean existsByUserUserIdAndVoucherCode(int userId, String code);
}
