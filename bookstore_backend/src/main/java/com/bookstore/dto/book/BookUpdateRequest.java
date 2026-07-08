package com.bookstore.dto.book;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookUpdateRequest {
    private String name;
    private String author;
    private String description;
    private int quantityInStock;
    private String publisher;
    private Integer publishYear;
    private BigDecimal price;
    private boolean isVip;
    private boolean isDeleted;
    private int pageCount;
    private LocalDateTime deletedAt;
}
