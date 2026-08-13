package com.bookstore.dto.bill;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

import com.bookstore.models.BillDetail;

class BillDetailResponseTests {

    @Test
    void mapsLegacyDetailWithoutBookWithoutThrowing() {
        BillDetail detail = new BillDetail();
        detail.setBillDetailId(419);
        detail.setBook(null);
        detail.setQuantity(1);
        detail.setPriceAtPurchase(new BigDecimal("498000"));

        BillDetailResponse response = BillDetailResponse.from(detail);

        assertThat(response.getBookId()).isNull();
        assertThat(response.getBookName()).isEqualTo("Sản phẩm không còn liên kết");
        assertThat(response.getSubTotal()).isEqualByComparingTo("498000");
    }
}
