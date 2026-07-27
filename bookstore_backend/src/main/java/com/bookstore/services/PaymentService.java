package com.bookstore.services;

import java.util.Map;

import com.bookstore.dto.payment.VnPayIpnResponse;
import com.bookstore.dto.payment.VnPayReturnResponse;

public interface PaymentService {
    VnPayIpnResponse handleVnPayIpn(Map<String, String> parameters);

    VnPayReturnResponse handleVnPayReturn(Map<String, String> parameters);

    void expirePendingVnPayPayments();
}
