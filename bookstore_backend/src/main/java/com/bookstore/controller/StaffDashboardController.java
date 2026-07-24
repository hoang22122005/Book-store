package com.bookstore.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.bookstore.common.response.ApiResponse;
import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.bill.BillResponse;
import com.bookstore.dto.bill.UpdateBillStatusRequest;
import com.bookstore.dto.dashboard.DeliveryResultRequest;
import com.bookstore.services.BillService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard/staff")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@RequiredArgsConstructor
public class StaffDashboardController {
    private final BillService billService;

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<PageResponse<BillResponse>>> getOrders(
            @PageableDefault(size = 20, sort = "billId", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Orders fetched successfully", billService.getAllBills(pageable)));
    }

    @GetMapping("/orders/{billId}")
    public ResponseEntity<ApiResponse<BillResponse>> getOrder(@PathVariable int billId) {
        return ResponseEntity.ok(ApiResponse.success("Order fetched successfully", billService.getBillByIdForAdmin(billId)));
    }

    @PatchMapping("/orders/{billId}/status")
    public ResponseEntity<ApiResponse<BillResponse>> updateStatus(
            @PathVariable int billId, @Valid @RequestBody UpdateBillStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Order status updated successfully",
                billService.updateBillStatusForStaff(billId, request.getStatus())));
    }

    @PatchMapping("/orders/{billId}/delivery-result")
    public ResponseEntity<ApiResponse<BillResponse>> confirmDeliveryResult(
            @PathVariable int billId, @Valid @RequestBody DeliveryResultRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Delivery result updated successfully",
                billService.confirmDeliveryResult(billId, request.getSuccessful())));
    }
}
