package com.bookstore.dto.bill;

import java.math.BigDecimal;

import com.bookstore.models.BillDetail;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BillDetailResponse {
    Integer billDetailId;
    Integer bookId;
    String bookName;
    String urlImg;
    Integer quantity;
    BigDecimal priceAtPurchase;
    BigDecimal subTotal;

    public static BillDetailResponse from(BillDetail billDetail) {
        BigDecimal price = billDetail.getPriceAtPurchase();
        int quantity = billDetail.getQuantity();

        return BillDetailResponse.builder()
                .billDetailId(billDetail.getBillDetailId())
                .bookId(billDetail.getBook().getBookId())
                .bookName(billDetail.getBook().getName())
                .urlImg(billDetail.getBook() != null ? billDetail.getBook().getUrlImg() : null)
                .quantity(quantity)
                .priceAtPurchase(price)
                .subTotal(price.multiply(BigDecimal.valueOf(quantity)))
                .build();
    }
}
