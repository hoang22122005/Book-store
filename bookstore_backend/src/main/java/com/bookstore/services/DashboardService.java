package com.bookstore.services;

import java.time.LocalDate;
import java.util.List;

import com.bookstore.dto.dashboard.OrderSummaryResponse;
import com.bookstore.dto.dashboard.FinancialOverviewResponse;
import com.bookstore.dto.dashboard.PaymentMethodStatsResponse;
import com.bookstore.dto.dashboard.RevenuePointResponse;
import com.bookstore.dto.dashboard.TopBookResponse;
import com.bookstore.dto.dashboard.TopCustomerResponse;

public interface DashboardService {
    OrderSummaryResponse getOrderSummary();
    List<RevenuePointResponse> getRevenueByDay(LocalDate from, LocalDate to);
    List<TopBookResponse> getTopSellingBooks(int limit);
    FinancialOverviewResponse getFinancialOverview(LocalDate from, LocalDate to);
    List<PaymentMethodStatsResponse> getPaymentMethodStats(LocalDate from, LocalDate to);
    List<TopCustomerResponse> getTopCustomers(LocalDate from, LocalDate to, int limit);
}
