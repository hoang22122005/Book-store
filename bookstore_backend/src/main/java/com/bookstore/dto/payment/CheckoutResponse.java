package com.bookstore.dto.payment;

import com.bookstore.dto.bill.BillResponse;
import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CheckoutResponse {
    private BillResponse bill;
    private PaymentResponse payment;
    private String paymentUrl;
}
