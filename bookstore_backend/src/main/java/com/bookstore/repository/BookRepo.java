package com.bookstore.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bookstore.models.Book;

public interface BookRepo extends JpaRepository<Book, Integer> {
    
}
