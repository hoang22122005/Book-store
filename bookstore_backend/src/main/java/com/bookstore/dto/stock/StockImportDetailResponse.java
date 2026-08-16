package com.bookstore.dto.stock;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class StockImportDetailResponse {
    private Long importDetailId;
    private int bookId;
    private String bookName;
    private int quantity;
    private BigDecimal importPrice;
    private BigDecimal sellingPriceAtImport;
}
