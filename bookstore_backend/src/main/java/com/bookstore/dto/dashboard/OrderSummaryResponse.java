package com.bookstore.dto.dashboard;

import java.math.BigDecimal;
import java.util.Map;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderSummaryResponse {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private Map<String, Long> ordersByStatus;
}
