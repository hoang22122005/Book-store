package com.bookstore.services;

import org.springframework.data.domain.Pageable;

import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.bill.BillResponse;
import com.bookstore.dto.bill.CreateBillRequest;
import com.bookstore.dto.payment.CheckoutResponse;

public interface BillService {
    PageResponse<BillResponse> getAllBills(Pageable pageable);

    PageResponse<BillResponse> getDirectBillsForStaff(Pageable pageable);

    PageResponse<BillResponse> getMyBills(int userId, Pageable pageable);

    BillResponse getBillByIdForAdmin(int billId);

    BillResponse getMyBillById(int userId, int billId);

    CheckoutResponse createBillFromMyCart(int userId, CreateBillRequest request, String clientIp);

    BillResponse updateBillStatusForAdmin(int billId, String status);

    BillResponse updateBillStatusForStaff(int billId, String status);

    BillResponse confirmDeliveryResult(int billId, boolean successful);
}
