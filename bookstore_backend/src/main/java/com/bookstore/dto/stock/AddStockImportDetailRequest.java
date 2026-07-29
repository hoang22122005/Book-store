package com.bookstore.dto.stock;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class AddStockImportDetailRequest {
    @NotNull
    private int bookId;

    @Min(1)
    private int quantity;
}
