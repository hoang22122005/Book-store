package com.bookstore.dto.discount;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DiscountCampaignStatusRequest {
    @NotNull(message = "Enabled status is required")
    private Boolean enabled;
}
