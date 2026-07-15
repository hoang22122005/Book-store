package com.bookstore.services;

import org.springframework.data.domain.Pageable;

import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.voucher.CreateVoucherRequest;
import com.bookstore.dto.voucher.VoucherResponse;

public interface VoucherService {
    PageResponse<VoucherResponse> getAllVouchers(Pageable pageable);

    PageResponse<VoucherResponse> getMyVouchers(int userId, Pageable pageable);

    VoucherResponse createVoucher(CreateVoucherRequest request);
}
