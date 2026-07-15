package com.bookstore.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bookstore.models.Genre;

public interface GenreRepo extends JpaRepository<Genre, Integer> {
    Optional<Genre> findByName(String name);
}
