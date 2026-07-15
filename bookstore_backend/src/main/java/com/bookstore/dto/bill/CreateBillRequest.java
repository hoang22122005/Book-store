package com.bookstore.dto.bill;

import java.util.List;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateBillRequest {
    String voucherCode;
    
    List<Integer> selectedBookIds;
}
