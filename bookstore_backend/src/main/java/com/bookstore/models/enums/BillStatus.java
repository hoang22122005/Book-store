package com.bookstore.models.enums;

import com.bookstore.exception.BadRequestException;

public enum BillStatus {
    PENDING,
    CONFIRMED,
    SHIPPING,
    COMPLETED,
    CANCELLED;

    public static BillStatus from(String value) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("Trang thai hoa don khong duoc de trong");
        }

        try {
            return BillStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Trang thai hoa don khong hop le");
        }
    }
}
