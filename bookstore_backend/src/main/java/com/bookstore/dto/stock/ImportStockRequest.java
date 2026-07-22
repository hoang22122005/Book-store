package com.bookstore.dto.stock;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ImportStockRequest {
    @NotNull
    @Positive(message = "Số lượng nhập phải lớn hơn 0")
    private Integer quantity;
    
}
