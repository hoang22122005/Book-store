package com.bookstore.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bookstore.models.BookGenre;

public interface BookGenreRepo extends JpaRepository<BookGenre, Integer> {
    @Query("""
            SELECT bg FROM BookGenre bg
            JOIN FETCH bg.genre
            WHERE bg.book.bookId IN :bookIds
            """)
    List<BookGenre> findWithGenreByBookIds(@Param("bookIds") List<Integer> bookIds);

    @Query("""
            SELECT bg FROM BookGenre bg
            JOIN FETCH bg.genre
            WHERE bg.book.bookId = :bookId
            """)
    List<BookGenre> findWithGenreByBookId(@Param("bookId") int bookId);
}
