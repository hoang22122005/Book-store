package com.bookstore.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.dto.payment.VnPayIpnResponse;
import com.bookstore.dto.payment.VnPayReturnResponse;
import com.bookstore.services.PaymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments/vnpay")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    // after user payment success on vnpay website, vnpay will send a request to
    // this url to notify the result
    // this is called ipn update and confirm payment with backend
    @GetMapping("/ipn")
    public ResponseEntity<VnPayIpnResponse> ipn(@RequestParam Map<String, String> parameters) {
        try {
            return ResponseEntity.ok(paymentService.handleVnPayIpn(parameters));
        } catch (RuntimeException exception) {
            return ResponseEntity.ok(new VnPayIpnResponse("99", "Unknown error"));
        }
    }

    // after user payment success on vnpay website, vnpay will send a request to
    // this url to notify the result
    // this is called return url redirect browser về website
    // website hiện trang “Thanh toán thành công”
    @GetMapping("/return")
    public ResponseEntity<VnPayReturnResponse> paymentReturn(
            @RequestParam Map<String, String> parameters) {
        return ResponseEntity.ok(paymentService.handleVnPayReturn(parameters));
    }
}
