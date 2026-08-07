package com.bookstore.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.bookstore.dto.discount.ActiveBookDiscount;
import com.bookstore.repository.DiscountCampaignRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DiscountPricingService {
    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private final DiscountCampaignRepository campaignRepository;

    public Map<Integer, ActiveBookDiscount> getActiveDiscounts(Collection<Integer> bookIds) {
        if (bookIds == null || bookIds.isEmpty()) {
            return Map.of();
        }

        List<Integer> distinctBookIds = bookIds.stream().distinct().toList();
        return campaignRepository
                .findBestActiveDiscounts(distinctBookIds, OffsetDateTime.now(ZoneOffset.UTC))
                .stream()
                .map(row -> Map.entry(
                        row.getBookId(),
                        new ActiveBookDiscount(
                                row.getCampaignId(),
                                row.getCampaignName(),
                                row.getDiscountPercent())))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    public BigDecimal calculateFinalPrice(BigDecimal originalPrice, ActiveBookDiscount discount) {
        if (discount == null) {
            return originalPrice;
        }

        BigDecimal remainingPercent = ONE_HUNDRED.subtract(discount.discountPercent());
        return originalPrice.multiply(remainingPercent)
                .divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);
    }
}
