package com.bookstore.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.common.response.ApiResponse;
import com.bookstore.dto.stock.AddStockImportDetailRequest;
import com.bookstore.dto.stock.CreateStockImportRequest;
import com.bookstore.dto.stock.StockImportResponse;
import com.bookstore.security.CurrentUser;
import com.bookstore.services.StockImportService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/stock-imports")
@RequiredArgsConstructor
public class StockImportController {

    private final StockImportService stockImportService;
    private final CurrentUser currentUser;

    @PostMapping
    @PreAuthorize("hasRole('WAREHOUSE_KEEPER')")
    public ApiResponse<StockImportResponse> createDraft(
            @Valid @RequestBody CreateStockImportRequest req) {
        return ApiResponse.success(stockImportService.createDraft(currentUser.getUserId(), req));
    }

    @PostMapping("/{id}/details")
    @PreAuthorize("hasRole('WAREHOUSE_KEEPER')")
    public ApiResponse<StockImportResponse> addDetail(
            @PathVariable Long id,
            @Valid @RequestBody AddStockImportDetailRequest req) {
        return ApiResponse.success(stockImportService.addDetail(id, req));
    }

    @PostMapping("/{id}/post")
    @PreAuthorize("hasRole('WAREHOUSE_KEEPER')")
    public ApiResponse<StockImportResponse> post(@PathVariable Long id) {
        return ApiResponse.success(stockImportService.postImport(id));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('WAREHOUSE_KEEPER')")
    public ApiResponse<StockImportResponse> cancel(@PathVariable Long id) {
        return ApiResponse.success(stockImportService.cancelImport(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_KEEPER')")
    public ApiResponse<List<StockImportResponse>> list() {
        return ApiResponse.success(stockImportService.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_KEEPER')")
    public ApiResponse<StockImportResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(stockImportService.getById(id));
    }
}
