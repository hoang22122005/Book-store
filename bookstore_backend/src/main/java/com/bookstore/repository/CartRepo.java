package com.bookstore.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bookstore.models.Cart;

public interface CartRepo extends JpaRepository<Cart, Integer> {
    Optional<Cart> findByUser_UserId(int userId);
}
