package com.bookstore.common.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.bookstore.models.Book;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookResponse {
    int bookId;
    String name;
    String author;
    String description;
    int quantityInStock;
    String publisher;
    Integer publishYear;
    BigDecimal price;
    LocalDateTime createdAt;
    String urlImg;
    float avgRating;
    int cntRating;
    int buyCount;

    public static BookResponse toBookResponse(Book book) {
        return BookResponse.builder()
                .bookId(book.getBookId())
                .name(book.getName())
                .author(book.getAuthor())
                .description(book.getDescription())
                .quantityInStock(book.getQuantityInStock())
                .publisher(book.getPublisher())
                .publishYear(book.getPublishYear())
                .price(book.getPrice())
                .createdAt(book.getCreatedAt())
                .urlImg(book.getUrlImg())
                .avgRating(book.getAvgRating())
                .cntRating(book.getCntRating())
                .buyCount(book.getBuyCount())
                .build();
    }
}
