package com.bookstore.dto.dashboard;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TopCustomerResponse {
    private int userId;
    private String name;
    private String email;
    private long completedOrders;
    private BigDecimal totalSpent;
    private BigDecimal averageOrderValue;
}
