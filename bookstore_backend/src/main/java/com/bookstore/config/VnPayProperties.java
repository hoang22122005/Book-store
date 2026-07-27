package com.bookstore.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@Data
@Component
@ConfigurationProperties(prefix = "vnpay")
public class VnPayProperties {

    // do vnpay cap cho website để định danh website đã đăng kí
    private String tmnCode;

    private String hashSecret;

    private String paymentUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

    private String returnUrl;

    private int expireMinutes = 15;
}
