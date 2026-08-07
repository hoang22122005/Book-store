package com.bookstore.dto.discount;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DiscountCampaignResponse {
    private long campaignId;
    private String name;
    private String description;
    private BigDecimal discountPercent;
    private OffsetDateTime startsAt;
    private OffsetDateTime endsAt;
    private boolean enabled;
    private String status;
    private int createdById;
    private String createdByName;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private List<Integer> bookIds;
}
