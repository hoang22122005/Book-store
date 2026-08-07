package com.bookstore.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.bookstore.common.response.ApiResponse;
import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.bill.BillResponse;
import com.bookstore.dto.dashboard.FinancialOverviewResponse;
import com.bookstore.dto.dashboard.OrderSummaryResponse;
import com.bookstore.dto.dashboard.PaymentMethodStatsResponse;
import com.bookstore.dto.dashboard.RevenuePointResponse;
import com.bookstore.dto.dashboard.TopBookResponse;
import com.bookstore.dto.dashboard.TopCustomerResponse;
import com.bookstore.services.BillService;
import com.bookstore.services.DashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard/accountant")
@PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
@RequiredArgsConstructor
public class AccountantDashboardController {
    private final DashboardService dashboardService;
    private final BillService billService;

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<PageResponse<BillResponse>>> getOrders(
            @PageableDefault(size = 20, sort = "billId", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Orders fetched successfully", billService.getAllBills(pageable)));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<OrderSummaryResponse>> getSummary() {
        return ResponseEntity
                .ok(ApiResponse.success("Dashboard summary fetched successfully", dashboardService.getOrderSummary()));
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<List<RevenuePointResponse>>> getRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity
                .ok(ApiResponse.success("Revenue fetched successfully", dashboardService.getRevenueByDay(from, to)));
    }

    @GetMapping("/top-books")
    public ResponseEntity<ApiResponse<List<TopBookResponse>>> getTopBooks(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity
                .ok(ApiResponse.success("Top books fetched successfully", dashboardService.getTopSellingBooks(limit)));
    }

    @GetMapping("/financial-overview")
    public ResponseEntity<ApiResponse<FinancialOverviewResponse>> getFinancialOverview(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(
                "Financial overview fetched successfully",
                dashboardService.getFinancialOverview(from, to)));
    }

    @GetMapping("/payment-methods")
    public ResponseEntity<ApiResponse<List<PaymentMethodStatsResponse>>> getPaymentMethodStats(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(
                "Payment method statistics fetched successfully",
                dashboardService.getPaymentMethodStats(from, to)));
    }

    @GetMapping("/top-customers")
    public ResponseEntity<ApiResponse<List<TopCustomerResponse>>> getTopCustomers(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(
                "Top customers fetched successfully",
                dashboardService.getTopCustomers(from, to, limit)));
    }
}
