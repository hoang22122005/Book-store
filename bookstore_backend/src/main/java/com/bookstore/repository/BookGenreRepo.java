package com.bookstore.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bookstore.models.BookGenre;

public interface BookGenreRepo extends JpaRepository<BookGenre, Integer> {
    
}
