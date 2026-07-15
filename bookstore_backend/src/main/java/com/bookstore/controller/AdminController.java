package com.bookstore.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.common.response.ApiResponse;
import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.bill.BillResponse;
import com.bookstore.dto.bill.UpdateBillStatusRequest;
import com.bookstore.dto.voucher.CreateVoucherRequest;
import com.bookstore.dto.voucher.VoucherResponse;
import com.bookstore.services.BillService;
import com.bookstore.services.VoucherService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {
    private final VoucherService voucherService;
    private final BillService billService;

    @GetMapping("/vouchers")
    public ResponseEntity<ApiResponse<PageResponse<VoucherResponse>>> getAllVouchers(
            @PageableDefault(size = 20, sort = "voucherId", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                "Vouchers fetched successfully",
                voucherService.getAllVouchers(pageable)));
    }

    @PostMapping("/vouchers")
    public ResponseEntity<ApiResponse<VoucherResponse>> createVoucher(
            @Valid @RequestBody CreateVoucherRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Voucher created successfully",
                voucherService.createVoucher(request)));
    }

    @GetMapping("/bills")
    public ResponseEntity<ApiResponse<PageResponse<BillResponse>>> getAllBills(
            @PageableDefault(size = 20, sort = "billId", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                "Bills fetched successfully",
                billService.getAllBills(pageable)));
    }

    @GetMapping("/bills/{billId}")
    public ResponseEntity<ApiResponse<BillResponse>> getBillById(@PathVariable int billId) {
        return ResponseEntity.ok(ApiResponse.success(
                "Bill fetched successfully",
                billService.getBillByIdForAdmin(billId)));
    }

    @PatchMapping("/bills/{billId}/status")
    public ResponseEntity<ApiResponse<BillResponse>> updateBillStatus(
            @PathVariable int billId,
            @Valid @RequestBody UpdateBillStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Bill status updated successfully",
                billService.updateBillStatusForAdmin(billId, request.getStatus())));
    }
}
