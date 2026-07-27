package com.bookstore.repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bookstore.models.Payment;
import com.bookstore.models.enums.PaymentMethod;
import com.bookstore.models.enums.PaymentStatus;

import jakarta.persistence.LockModeType;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByTxnRef(String txnRef);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Payment p where p.txnRef = :txnRef")
    Optional<Payment> findByTxnRefForUpdate(@Param("txnRef") String txnRef);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select p
              from Payment p
             where p.bill.billId = :billId
             order by p.paymentId desc
            """)
    List<Payment> findByBillIdForUpdate(@Param("billId") int billId);

    @Query("""
            select p
              from Payment p
             where p.status = :status
               and p.paymentMethod = :method
               and p.expiresAt <= :now
             order by p.paymentId
            """)
    List<Payment> findExpiredPayments(
            @Param("status") PaymentStatus status,
            @Param("method") PaymentMethod method,
            @Param("now") OffsetDateTime now);
}
