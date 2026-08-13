package com.bookstore.dto.bill;

import java.math.BigDecimal;

import com.bookstore.models.BillDetail;
import com.bookstore.models.Book;

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
        BigDecimal price = billDetail.getPriceAtPurchase() == null
                ? BigDecimal.ZERO
                : billDetail.getPriceAtPurchase();
        int quantity = billDetail.getQuantity();
        Book book = billDetail.getBook();

        return BillDetailResponse.builder()
                .billDetailId(billDetail.getBillDetailId())
                .bookId(book == null ? null : book.getBookId())
                .bookName(book == null ? "Sản phẩm không còn liên kết" : book.getName())
                .urlImg(book == null ? null : book.getUrlImg())
                .quantity(quantity)
                .priceAtPurchase(price)
                .subTotal(price.multiply(BigDecimal.valueOf(quantity)))
                .build();
    }
}
