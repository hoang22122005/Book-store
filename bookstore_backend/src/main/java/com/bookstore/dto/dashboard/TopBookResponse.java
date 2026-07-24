package com.bookstore.dto.dashboard;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TopBookResponse {
    private int bookId;
    private String bookName;
    private long quantitySold;
    private BigDecimal revenue;
}
