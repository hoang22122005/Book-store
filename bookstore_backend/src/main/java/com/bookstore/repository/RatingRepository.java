package com.bookstore.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookstore.models.Rating;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Integer> {
    Page<Rating> findByBookBookId(int bookId, Pageable pageable);

    Optional<Rating> findByBookBookIdAndUserUserId(int bookId, int userId);

    boolean existsByBookBookIdAndUserUserId(int bookId, int userId);

    @Query("SELECT COALESCE(AVG(r.ratingValue), 0) FROM Rating r WHERE r.book.bookId = :bookId")
    Double findAverageRatingByBookId(@Param("bookId") int bookId);

    long countByBookBookId(int bookId);
}
