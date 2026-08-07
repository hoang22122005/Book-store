package com.bookstore.dto.dashboard;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaymentMethodStatsResponse {
    private String paymentMethod;
    private long orderCount;
    private BigDecimal revenue;
}
