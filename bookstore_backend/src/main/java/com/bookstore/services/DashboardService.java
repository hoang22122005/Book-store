package com.bookstore.services;

import java.time.LocalDate;
import java.util.List;

import com.bookstore.dto.dashboard.OrderSummaryResponse;
import com.bookstore.dto.dashboard.RevenuePointResponse;
import com.bookstore.dto.dashboard.TopBookResponse;

public interface DashboardService {
    OrderSummaryResponse getOrderSummary();
    List<RevenuePointResponse> getRevenueByDay(LocalDate from, LocalDate to);
    List<TopBookResponse> getTopSellingBooks(int limit);
}
