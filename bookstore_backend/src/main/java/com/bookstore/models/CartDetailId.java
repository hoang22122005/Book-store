package com.bookstore.models;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartDetailId implements Serializable {
    @Column(name="cart_id", nullable=false)
    private int cartId;

    @Column(name="book_id", nullable=false)
    private int bookId;
}
