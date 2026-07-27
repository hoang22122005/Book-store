package com.bookstore.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.bookstore.services.PaymentService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PaymentExpiryJob {
    private final PaymentService paymentService;

    @Scheduled(fixedDelayString = "${payment.expiry-check-delay-ms:120000}")
    public void releaseExpiredVnPayReservations() {
        paymentService.expirePendingVnPayPayments();
    }
}
