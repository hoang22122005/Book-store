package com.bookstore.repository;

import java.math.BigDecimal;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.models.Cart;

import jakarta.persistence.LockModeType;

public interface CartRepo extends JpaRepository<Cart, Integer> {
    Optional<Cart> findByUser_UserId(int userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Cart c where c.user.userId = :userId")
    Optional<Cart> findByUserIdForUpdate(@Param("userId") int userId);

    @Modifying
    @Transactional
    @Query(value = """
            UPDATE cart SET total_amount = total_amount + ?1 WHERE cart_id = ?2
           """, nativeQuery = true)
    void updateTotalAmount(BigDecimal updateTotal, int cartId);
}
