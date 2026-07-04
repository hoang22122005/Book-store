package com.bookstore.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Book {
    @Id
    @Column(name = "book_id", nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int bookId;

    private String name;
    private String author;
    private String description;
    
    @Column(name = "quantity_in_stock")
    private int quantityInStock;

    private String publisher;
    
    @Column(name = "publish_year")
    private String publishYear;

    private BigDecimal price;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "is_delete")
    private boolean isDelete;

    @Column(name = "url_image")
    private String urlImg;

    @Column(name = "avg_rating")
    private float avgRating;

    @Column(name = "cnt_rating")
    private int cntRating;

    @Column(name = "buy_count")
    private int buyCount;
}
