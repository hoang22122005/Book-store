package com.bookstore.models.enums;

import com.bookstore.exception.BadRequestException;

public enum PaymentMethod {
    VNPAY,
    DIRECT;

    public static PaymentMethod from(String value) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("Phuong thuc thanh toan khong duoc de trong");
        }

        try {
            return PaymentMethod.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Phuong thuc thanh toan khong hop le");
        }
    }
}
