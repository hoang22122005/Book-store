package com.bookstore.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.common.response.ApiResponse;
import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.voucher.VoucherResponse;
import com.bookstore.security.CurrentUser;
import com.bookstore.services.VoucherService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/vouchers")
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class VoucherController {
    private final VoucherService voucherService;
    private final CurrentUser currentUser;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<PageResponse<VoucherResponse>>> getMyVouchers(
            @PageableDefault(size = 20, sort = "voucherId", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                "My vouchers fetched successfully",
                voucherService.getMyVouchers(currentUser.getUserId(), pageable)));
    }
}
