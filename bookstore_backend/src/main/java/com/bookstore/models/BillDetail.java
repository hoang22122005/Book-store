package com.bookstore.models;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bill_detail")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BillDetail {
    @Id
    @Column(name = "bill_detail_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int billDetailId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bill_id", nullable = false)
    private Bill bill;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    private int quantity;

    @Column(name = "price_at_purchase")
    private BigDecimal priceAtPurchase;
}
