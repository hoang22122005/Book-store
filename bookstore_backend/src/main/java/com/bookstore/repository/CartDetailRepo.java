package com.bookstore.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.bookstore.models.CartDetail;
import com.bookstore.models.CartDetailId;

import jakarta.transaction.Transactional;

public interface CartDetailRepo extends JpaRepository<CartDetail, CartDetailId> {
    @Query(value = """
            SELECT * FROM cart_detail WHERE cart_id = ?1
            """, nativeQuery = true)
    List<CartDetail> findAllCartDetails(int cartId);

    @Modifying
    @Transactional
    @Query(value = """
            INSERT INTO cart_detail(cart_id, book_id, quantity, created_at) VALUES(?1, ?2, ?3, ?4)
            """, nativeQuery = true)
    void addCartDetail(int cartId, int bookId, int quantity, LocalDateTime createdAt);

    @Modifying
    @Transactional
    @Query(value = """
            UPDATE cart_detail SET quantity = quantity + 1 WHERE cart_id = ?1 AND book_id = ?2 
            """, nativeQuery = true)
    void increaseQuatityCartDetail(int cartId, int bookId);

    @Modifying
    @Transactional
    @Query(value = """
            UPDATE cart_detail SET quantity = quantity - 1 WHERE cart_id = ?1 AND book_id = ?2
            """, nativeQuery = true)
    void decreaseQuatityCartDetail(int cartId, int bookId);
    
}
