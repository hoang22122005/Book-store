package com.bookstore.models;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cart_detail")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartDetail {
    @EmbeddedId
    private CartDetailId cartDetailId;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("cartId")
    @JoinColumn(name="cart_id", nullable=false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("bookId")
    @JoinColumn(name="book_id", nullable=false)
    private Book book;

    @Column(nullable=false)
    private Integer quantity;
}
