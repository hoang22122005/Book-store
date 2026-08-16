package com.bookstore.models;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "stock_import_detail")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class StockImportDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "import_detail_id")
    private Long importDetailId;

    @ManyToOne
    @JoinColumn(name = "import_id", nullable = false)
    private StockImport stockImport;

    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "import_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal importPrice = BigDecimal.ZERO;

    @Column(name = "selling_price_at_import", precision = 12, scale = 2)
    private BigDecimal sellingPriceAtImport;
}
