package com.bookstore.dto.discount;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DiscountCampaignRequest {
    @NotBlank(message = "Campaign name is required")
    @Size(max = 200, message = "Campaign name must not exceed 200 characters")
    private String name;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @NotNull(message = "Discount percent is required")
    @DecimalMin(value = "0.01", message = "Discount percent must be greater than 0")
    @DecimalMax(value = "100.00", message = "Discount percent must not exceed 100")
    private BigDecimal discountPercent;

    @NotNull(message = "Start time is required")
    private OffsetDateTime startsAt;

    @NotNull(message = "End time is required")
    private OffsetDateTime endsAt;

    @NotEmpty(message = "At least one book is required")
    private List<@NotNull @Positive Integer> bookIds;
}
