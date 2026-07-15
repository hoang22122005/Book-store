package com.bookstore.dto.bill;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.bookstore.models.Bill;
import com.bookstore.models.BillDetail;
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
public class BillResponse {
    Integer billId;
    Integer userId;
    String userEmail;

    Integer voucherId;
    String voucherCode;
    String voucherScope;
    Float discountPercent;

    BigDecimal subTotal;
    BigDecimal discountAmount;
    BigDecimal totalAmount;
    String status;
    LocalDateTime createdAt;
    List<BillDetailResponse> details;

    public static BillResponse from(Bill bill, List<BillDetail> billDetails) {
        List<BillDetailResponse> detailResponses = billDetails.stream()
                .map(BillDetailResponse::from)
                .toList();
        BigDecimal subTotal = detailResponses.stream()
                .map(BillDetailResponse::getSubTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalAmount = bill.getTotalAmount() == null ? BigDecimal.ZERO : bill.getTotalAmount();
        BigDecimal discountAmount = subTotal.subtract(totalAmount).max(BigDecimal.ZERO);
        Voucher voucher = bill.getVoucher();

        BillResponseBuilder builder = BillResponse.builder()
                .billId(bill.getBillId())
                .userId(bill.getUser().getUserId())
                .userEmail(bill.getUser().getEmail())
                .subTotal(subTotal)
                .discountAmount(discountAmount)
                .totalAmount(totalAmount)
                .status(bill.getStatus() == null ? null : bill.getStatus().name())
                .createdAt(bill.getCreatedAt())
                .details(detailResponses);

        if (voucher != null) {
            builder.voucherId(voucher.getVoucherId())
                    .voucherCode(voucher.getCode())
                    .voucherScope(voucher.getScope())
                    .discountPercent(voucher.getDiscount());
        }

        return builder.build();
    }
}
