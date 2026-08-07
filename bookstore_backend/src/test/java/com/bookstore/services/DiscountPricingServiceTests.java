package com.bookstore.services;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

import com.bookstore.dto.discount.ActiveBookDiscount;

class DiscountPricingServiceTests {
    private final DiscountPricingService pricingService = new DiscountPricingService(null);

    @Test
    void returnsOriginalPriceWithoutCampaign() {
        BigDecimal originalPrice = new BigDecimal("125000.00");

        assertEquals(originalPrice, pricingService.calculateFinalPrice(originalPrice, null));
    }

    @Test
    void calculatesAndRoundsCampaignPrice() {
        ActiveBookDiscount discount = new ActiveBookDiscount(
                10L,
                "Summer sale",
                new BigDecimal("12.50"));

        BigDecimal result = pricingService.calculateFinalPrice(new BigDecimal("99999.00"), discount);

        assertEquals(new BigDecimal("87499.13"), result);
    }
}
