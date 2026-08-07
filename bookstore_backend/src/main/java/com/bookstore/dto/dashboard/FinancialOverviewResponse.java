package com.bookstore.dto.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FinancialOverviewResponse {
    private LocalDate from;
    private LocalDate to;
    private BigDecimal revenue;
    private long totalOrders;
    private long completedOrders;
    private long cancelledOrders;
    private BigDecimal completionRatePercent;
    private long itemsSold;
    private BigDecimal averageOrderValue;
    private BigDecimal subtotalBeforeVoucher;
    private BigDecimal voucherDiscount;
}
