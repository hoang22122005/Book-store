package com.bookstore.dto.cart;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.bookstore.models.Cart;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartResponse {
    int cartId;
    int userId;
    BigDecimal totalAmount;
    LocalDateTime createdAt;

    public static CartResponse toCart(Cart cart) {
        return CartResponse.builder()
                .cartId(cart.getCartId())
                .userId(cart.getUser().getUserId())
                .totalAmount(cart.getTotalAmount())
                .createdAt(cart.getCreatedAt())
                .build();
    }
}
