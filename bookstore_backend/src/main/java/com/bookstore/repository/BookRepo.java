package com.bookstore.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bookstore.models.Book;

public interface BookRepo extends JpaRepository<Book, Integer> {
    List<Book> findByIsDeletedFalse();

    Optional<Book> findByBookIdAndIsDeletedFalse(int bookId);

    @Query("SELECT b FROM Book b WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:author IS NULL OR :author = '' OR LOWER(b.author) LIKE LOWER(CONCAT('%', :author, '%'))) AND " +
           "(:categoryId IS NULL OR b.bookId IN (SELECT bg.book.bookId FROM BookGenre bg WHERE bg.genre.genreId = :categoryId)) AND " +
           "(:minPrice IS NULL OR b.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR b.price <= :maxPrice) AND " +
           "b.isDeleted = false")
    Page<Book> searchBooks(@Param("keyword") String keyword,
                           @Param("author") String author,
                           @Param("categoryId") Integer categoryId,
                           @Param("minPrice") BigDecimal minPrice,
                           @Param("maxPrice") BigDecimal maxPrice,
                           Pageable pageable);
}

