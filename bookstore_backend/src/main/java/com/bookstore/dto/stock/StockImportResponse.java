package com.bookstore.dto.stock;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class StockImportResponse {
    private Long importId;
    private String status;
    private String note;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime postedAt;
    List<StockImportDetailResponse> details;
}
