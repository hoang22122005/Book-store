package com.bookstore.dto.stock;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor

public class CreateStockImportRequest {
    private String note;
    private String supplierName;
    private List<AddStockImportDetailRequest> details;
}
