package com.bookstore.services;

import org.springframework.data.domain.Pageable;

import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.bill.BillResponse;
import com.bookstore.dto.bill.CreateBillRequest;

public interface BillService {
    PageResponse<BillResponse> getAllBills(Pageable pageable);

    PageResponse<BillResponse> getMyBills(int userId, Pageable pageable);

    BillResponse getBillByIdForAdmin(int billId);

    BillResponse getMyBillById(int userId, int billId);

    BillResponse createBillFromMyCart(int userId, CreateBillRequest request);

    BillResponse updateBillStatusForAdmin(int billId, String status);
}
