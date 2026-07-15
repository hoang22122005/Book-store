package com.bookstore.dto.bill;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateBillStatusRequest {
    @NotBlank(message = "Trang thai hoa don khong duoc de trong")
    String status;
}
