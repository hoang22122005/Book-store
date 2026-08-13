package com.bookstore.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookstore.models.Bill;
import com.bookstore.models.enums.PaymentMethod;

import jakarta.persistence.LockModeType;

@Repository
public interface BillRepository extends JpaRepository<Bill, Integer> {
    Page<Bill> findByUserUserId(int userId, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Bill b where b.billId = :billId")
    java.util.Optional<Bill> findByIdForUpdate(@Param("billId") int billId);

    @Query(value = """
            select b
              from Bill b
             where exists (
                   select p.paymentId
                     from Payment p
                    where p.bill = b
                      and p.paymentMethod = :paymentMethod
                      and p.paymentId = (
                            select max(p2.paymentId)
                              from Payment p2
                             where p2.bill = b
                      )
             )
            """,
            countQuery = """
            select count(b)
              from Bill b
             where exists (
                   select p.paymentId
                     from Payment p
                    where p.bill = b
                      and p.paymentMethod = :paymentMethod
                      and p.paymentId = (
                            select max(p2.paymentId)
                              from Payment p2
                             where p2.bill = b
                      )
             )
            """)
    Page<Bill> findByLatestPaymentMethod(
            @Param("paymentMethod") PaymentMethod paymentMethod,
            Pageable pageable);
}
