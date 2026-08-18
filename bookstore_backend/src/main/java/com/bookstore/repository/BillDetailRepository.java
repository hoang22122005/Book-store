package com.bookstore.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookstore.models.BillDetail;

@Repository
public interface BillDetailRepository extends JpaRepository<BillDetail, Integer> {
    List<BillDetail> findByBillBillId(int billId);

    @Query("""
            SELECT COUNT(bd) > 0
            FROM BillDetail bd
            WHERE bd.book.bookId = :bookId
              AND bd.bill.user.userId = :userId
              AND bd.bill.status IN (
                  com.bookstore.models.enums.BillStatus.CONFIRMED,
                  com.bookstore.models.enums.BillStatus.SHIPPING,
                  com.bookstore.models.enums.BillStatus.COMPLETED
              )
            """)
    boolean hasUserPurchasedBook(@Param("userId") int userId, @Param("bookId") int bookId);
}
