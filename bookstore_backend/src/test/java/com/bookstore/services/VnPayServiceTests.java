package com.bookstore.services;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;

import com.bookstore.config.VnPayProperties;
import com.bookstore.models.Payment;

class VnPayServiceTests {

    @Test
    void generatedPaymentUrlHasAValidSignatureAndRejectsTampering() {
        VnPayProperties properties = new VnPayProperties();
        properties.setTmnCode("TESTCODE");
        properties.setHashSecret("test-secret");
        properties.setPaymentUrl("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
        properties.setReturnUrl("https://merchant.example/api/payments/vnpay/return");

        VnPayService service = new VnPayService(properties);
        Payment payment = new Payment();
        payment.setAmount(new BigDecimal("10000"));
        payment.setTxnRef("VNPAY202607260001");
        payment.setOrderInfo("Thanh toan don hang 1");
        payment.setVnpCreateDate(OffsetDateTime.of(
                2026, 7, 26, 12, 0, 0, 0, ZoneOffset.UTC));
        payment.setExpiresAt(payment.getVnpCreateDate().plusMinutes(15));

        String paymentUrl = service.createPaymentUrl(payment, "127.0.0.1");
        Map<String, String> callbackParameters = parseQuery(paymentUrl);

        assertTrue(service.isValidSignature(callbackParameters));

        callbackParameters.put("vnp_Amount", "999999");
        assertFalse(service.isValidSignature(callbackParameters));
    }

    private Map<String, String> parseQuery(String url) {
        return Arrays.stream(URI.create(url).getRawQuery().split("&"))
                .map(parameter -> parameter.split("=", 2))
                .collect(Collectors.toMap(
                        pair -> decode(pair[0]),
                        pair -> pair.length == 2 ? decode(pair[1]) : ""));
    }

    private String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }
}
