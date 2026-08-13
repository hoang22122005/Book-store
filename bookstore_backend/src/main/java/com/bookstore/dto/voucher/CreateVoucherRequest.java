package com.bookstore.dto.voucher;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateVoucherRequest {
    List<@Positive(message = "User id must be greater than 0") Integer> userIds;

    @NotBlank(message = "Voucher code is required")
    String code;

    @NotNull(message = "Discount percent is required")
    @DecimalMin(value = "0.01", message = "Discount percent must be greater than 0")
    @DecimalMax(value = "100.0", message = "Discount percent must not be greater than 100")
    Float discount;

    @Positive(message = "Usage limit must be greater than 0")
    Integer usageLimit;

    @DecimalMin(value = "0.01", message = "Maximum discount amount must be greater than 0")
    BigDecimal maxDiscountAmount;

    @NotNull(message = "Expired time is required")
    @Future(message = "Expired time must be in the future")
    LocalDateTime expiredAt;
}
