package com.bookstore.dto.payment;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import com.bookstore.models.Payment;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResponse {
    private Long paymentId;
    private Integer billId;
    private BigDecimal amount;
    private String method;
    private String status;
    private String txnRef;
    private String transactionNo;
    private String bankCode;
    private String responseCode;
    private String transactionStatus;
    private OffsetDateTime expiresAt;
    private OffsetDateTime paidAt;
    private OffsetDateTime createdAt;

    public static PaymentResponse from(Payment payment) {
        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .billId(payment.getBill().getBillId())
                .amount(payment.getAmount())
                .method(payment.getPaymentMethod().name())
                .status(payment.getStatus().name())
                .txnRef(payment.getTxnRef())
                .transactionNo(payment.getTransactionNo())
                .bankCode(payment.getBankCode())
                .responseCode(payment.getResponseCode())
                .transactionStatus(payment.getTransactionStatus())
                .expiresAt(payment.getExpiresAt())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
