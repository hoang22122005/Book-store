package com.bookstore.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bookstore.models.Book;

import jakarta.transaction.Transactional;

public interface BookRepo extends JpaRepository<Book, Integer> {
       List<Book> findByIsDeletedFalse();


       Optional<Book> findByBookIdAndIsDeletedFalse(int bookId);

       @Query("SELECT b FROM Book b WHERE " +
                     "(:keyword IS NULL OR :keyword = '' OR LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND "
                     +
                     "(:author IS NULL OR :author = '' OR LOWER(b.author) LIKE LOWER(CONCAT('%', :author, '%'))) AND " +
                     "(:categoryId IS NULL OR b.bookId IN (SELECT bg.book.bookId FROM BookGenre bg WHERE bg.genre.genreId = :categoryId)) AND "
                     +
                     "(:minPrice IS NULL OR b.price >= :minPrice) AND " +
                     "(:maxPrice IS NULL OR b.price <= :maxPrice) AND " +
                     "b.isDeleted = false")
       Page<Book> searchBooks(@Param("keyword") String keyword,
                     @Param("author") String author,
                     @Param("categoryId") Integer categoryId,
                     @Param("minPrice") BigDecimal minPrice,
                     @Param("maxPrice") BigDecimal maxPrice,
                     Pageable pageable);

       @Modifying
       @Transactional
       @Query(value = """
                     UPDATE book SET is_deleted = true, deleted_at = ?1 WHERE book_id = ?2
                     """, nativeQuery = true)
       int softDeleteBook(LocalDateTime deletedAt, int bookId);

       @Transactional
       @Query(value = """
                     UPDATE book SET name = ?1, author = ?2, description = ?3, price = ?4,
                     quantity_in_stock = ?5, is_vip = ?6, is_deleted = ?7,
                     deleted_at = ?8, page_count = ?9 WHERE book_id = ?10
                     RETURNING *
                     """, nativeQuery = true)
       Book updateBook(String name, String author, String description, BigDecimal price, int quantityInStock,
                     boolean isVip, boolean isDeleted, LocalDateTime deletedAt, int pageCount, int bookId);
}
