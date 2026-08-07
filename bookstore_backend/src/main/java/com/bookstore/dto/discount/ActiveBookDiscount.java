package com.bookstore.dto.discount;

import java.math.BigDecimal;

public record ActiveBookDiscount(
        long campaignId,
        String campaignName,
        BigDecimal discountPercent) {
}
