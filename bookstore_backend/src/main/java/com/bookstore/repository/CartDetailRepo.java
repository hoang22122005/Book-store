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
            SELECT cd.* FROM cart_detail cd
            JOIN book b ON cd.book_id = b.book_id
            WHERE cd.cart_id = ?1 AND b.is_deleted = false
            """, nativeQuery = true)
    List<CartDetail> findAllCartDetails(int cartId);

    @Modifying
    @Transactional
    @Query(value = """
            DELETE FROM cart_detail
            WHERE cart_id = :cartId
              AND book_id IN (SELECT book_id FROM book WHERE is_deleted = true)
            """, nativeQuery = true)
    void purgeDeletedBooksByCartId(@org.springframework.data.repository.query.Param("cartId") int cartId);

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

    @Query(value = """
            SELECT DISTINCT cart_id FROM cart_detail WHERE book_id = :bookId
            """, nativeQuery = true)
    List<Integer> findCartIdsByBookId(@org.springframework.data.repository.query.Param("bookId") int bookId);

    @Modifying
    @Transactional
    @Query(value = """
            DELETE FROM cart_detail WHERE book_id = :bookId
            """, nativeQuery = true)
    void deleteByBookId(@org.springframework.data.repository.query.Param("bookId") int bookId);
}
