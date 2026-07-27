package com.bookstore.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookstore.models.Bill;

import jakarta.persistence.LockModeType;

@Repository
public interface BillRepository extends JpaRepository<Bill, Integer> {
    Page<Bill> findByUserUserId(int userId, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Bill b where b.billId = :billId")
    java.util.Optional<Bill> findByIdForUpdate(@Param("billId") int billId);
}
