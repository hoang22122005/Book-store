package com.bookstore.dto.payment;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VnPayReturnResponse {
    private boolean validSignature;
    private boolean successful;
    private String txnRef;
    private String responseCode;
    private String transactionStatus;
    private String message;
}
