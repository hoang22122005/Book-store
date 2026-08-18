package com.bookstore.dto.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.bookstore.dto.discount.ActiveBookDiscount;
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
    BigDecimal salePrice;
    BigDecimal discountPercent;
    Long activeCampaignId;
    String activeCampaignName;
    LocalDateTime createdAt;
    String urlImg;
    float avgRating;
    int cntRating;
    int buyCount;
    String isbn;
    Integer pageCount;
    boolean isVip;
    boolean isDeleted;
    List<String> genres;

    public static BookResponse toBookResponse(Book book) {
        return toBookResponse(book, List.of());
    }

    public static BookResponse toBookResponse(Book book, List<String> genres) {
        return toBookResponse(book, genres, null, book.getPrice());
    }

    public static BookResponse toBookResponse(
            Book book,
            List<String> genres,
            ActiveBookDiscount discount,
            BigDecimal salePrice) {
        return toBookResponse(book, genres, discount, salePrice, book.getQuantityInStock());
    }

    public static BookResponse toBookResponse(
            Book book,
            List<String> genres,
            ActiveBookDiscount discount,
            BigDecimal salePrice,
            int availableQuantity) {
        return BookResponse.builder()
                .bookId(book.getBookId())
                .name(book.getName())
                .author(book.getAuthor())
                .description(book.getDescription())
                .quantityInStock(availableQuantity)
                .publisher(book.getPublisher())
                .publishYear(book.getPublishYear())
                .price(book.getPrice())
                .salePrice(salePrice)
                .discountPercent(discount == null ? BigDecimal.ZERO : discount.discountPercent())
                .activeCampaignId(discount == null ? null : discount.campaignId())
                .activeCampaignName(discount == null ? null : discount.campaignName())
                .createdAt(book.getCreatedAt())
                .urlImg(book.getUrlImg())
                .avgRating(book.getAvgRating())
                .cntRating(book.getCntRating())
                .buyCount(book.getBuyCount())
                .isbn(book.getIsbn())
                .pageCount(book.getPageCount())
                .isVip(book.isVip())
                .isDeleted(book.isDeleted())
                .genres(genres)
                .build();
    }
}
