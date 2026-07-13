package com.bookstore.dto.cart;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CartDetailRequest {
    private int bookId;
}
