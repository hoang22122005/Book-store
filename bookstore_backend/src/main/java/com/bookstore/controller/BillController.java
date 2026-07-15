package com.bookstore.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.common.response.ApiResponse;
import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.bill.BillResponse;
import com.bookstore.dto.bill.CreateBillRequest;
import com.bookstore.security.CurrentUser;
import com.bookstore.services.BillService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bills")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class BillController {
    private final BillService billService;
    private final CurrentUser currentUser;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<PageResponse<BillResponse>>> getMyBills(
            @PageableDefault(size = 20, sort = "billId", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                "My bills fetched successfully",
                billService.getMyBills(currentUser.getUserId(), pageable)));
    }

    @GetMapping("/me/{billId}")
    public ResponseEntity<ApiResponse<BillResponse>> getMyBillById(@PathVariable int billId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Bill fetched successfully",
                billService.getMyBillById(currentUser.getUserId(), billId)));
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<BillResponse>> createBillFromMyCart(
            @Valid @RequestBody CreateBillRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Bill created successfully",
                billService.createBillFromMyCart(currentUser.getUserId(), request)));
    }
}
