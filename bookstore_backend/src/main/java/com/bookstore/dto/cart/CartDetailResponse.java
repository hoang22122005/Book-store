package com.bookstore.dto.cart;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.bookstore.models.CartDetail;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartDetailResponse {
    int cartId;
    int userId;
    LocalDateTime createdAt;
    int bookId;
    String bookName;
    String author;
    BigDecimal price;
    int quantity;

    public static CartDetailResponse toCartDetail(CartDetail cartDetail) {
        return CartDetailResponse.builder()
                .cartId(cartDetail.getCart().getCartId())
                .userId(cartDetail.getCart().getUser().getUserId())
                .createdAt(cartDetail.getCreatedAt())
                .bookId(cartDetail.getBook().getBookId())
                .bookName(cartDetail.getBook().getName())
                .author(cartDetail.getBook().getAuthor())
                .price(cartDetail.getBook().getPrice())
                .quantity(cartDetail.getQuantity())
                .build();
    }
}
