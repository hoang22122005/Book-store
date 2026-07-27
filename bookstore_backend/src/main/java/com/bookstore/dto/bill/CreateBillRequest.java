package com.bookstore.dto.bill;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateBillRequest {
    String voucherCode;
    
    List<Integer> selectedBookIds;

    @NotBlank(message = "Phuong thuc thanh toan khong duoc de trong")
    String paymentMethod;

    String bankCode;
}
