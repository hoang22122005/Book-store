package com.bookstore.dto.voucher;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.bookstore.models.UserVoucher;
import com.bookstore.models.Voucher;
import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VoucherResponse {
    Integer voucherId;
    String code;
    String scope;
    Float discountPercent;
    Integer usageLimit;
    Integer usageCount;
    BigDecimal maxDiscountAmount;
    LocalDateTime expiredAt;

    List<Integer> assignedUserIds;
    Integer assignedCount;

    Integer userId;
    String userEmail;
    Boolean claimed;
    Boolean used;
    LocalDateTime usedAt;

    public static VoucherResponse from(Voucher voucher) {
        return from(voucher, null);
    }

    public static VoucherResponse from(Voucher voucher, List<Integer> assignedUserIds) {
        return VoucherResponse.builder()
                .voucherId(voucher.getVoucherId())
                .code(voucher.getCode())
                .scope(voucher.getScope())
                .discountPercent(voucher.getDiscount())
                .usageLimit(voucher.getUsageLimit())
                .usageCount(voucher.getUsageCount())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .expiredAt(voucher.getExpiredAt())
                .assignedUserIds(assignedUserIds)
                .assignedCount(assignedUserIds == null ? null : assignedUserIds.size())
                .build();
    }

    public static VoucherResponse availableToUser(Voucher voucher) {
        return VoucherResponse.builder()
                .voucherId(voucher.getVoucherId())
                .code(voucher.getCode())
                .scope(voucher.getScope())
                .discountPercent(voucher.getDiscount())
                .usageLimit(voucher.getUsageLimit())
                .usageCount(voucher.getUsageCount())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .expiredAt(voucher.getExpiredAt())
                .claimed(false)
                .used(false)
                .build();
    }

    public static VoucherResponse from(UserVoucher userVoucher) {
        Voucher voucher = userVoucher.getVoucher();
        return VoucherResponse.builder()
                .voucherId(voucher.getVoucherId())
                .code(voucher.getCode())
                .scope(voucher.getScope())
                .discountPercent(voucher.getDiscount())
                .usageLimit(voucher.getUsageLimit())
                .usageCount(voucher.getUsageCount())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .expiredAt(voucher.getExpiredAt())
                .userId(userVoucher.getUser().getUserId())
                .userEmail(userVoucher.getUser().getEmail())
                .claimed(true)
                .used(userVoucher.isUsed())
                .usedAt(userVoucher.getUsedAt())
                .build();
    }
}
