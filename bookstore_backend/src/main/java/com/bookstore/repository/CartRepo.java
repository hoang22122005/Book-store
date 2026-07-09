package com.bookstore.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bookstore.models.Cart;

public interface CartRepo extends JpaRepository<Cart, Integer> {
    Optional<Cart> findByUser_UserId(int userId);

    @Modifying
    @Transactional
    @Query(value = """
            UPDATE cart SET total_amount = total_amount + ?1 WHERE cart_id = ?2
           """, nativeQuery = true)
    void updateTotalAmount(BigDecimal updateTotal, int cartId);
}
