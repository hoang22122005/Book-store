package com.bookstore.dto.cart;

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
    int quantity;

    public static CartDetailResponse toCartDetail(CartDetail cartDetail) {
        return CartDetailResponse.builder()
                .cartId(cartDetail.getCart().getCartId())
                .userId(cartDetail.getCart().getUser().getUserId())
                .createdAt(cartDetail.getCreatedAt())
                .bookId(cartDetail.getBook().getBookId())
                .quantity(cartDetail.getQuantity())
                .build();
    }
}
