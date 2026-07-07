package com.bookstore.dto.book;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookAddRequest {
    private String name;
    private String author;
    private String description;
    private int quantityInStock;
    private String publisher;
    private Integer publishYear;
    private BigDecimal price;
    private boolean createdAt;
    private boolean isVip;
    private int pageCount;
}
