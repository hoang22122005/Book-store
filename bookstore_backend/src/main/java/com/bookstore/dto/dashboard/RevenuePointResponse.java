package com.bookstore.dto.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RevenuePointResponse {
    private LocalDate date;
    private BigDecimal revenue;
}
