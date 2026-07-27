package com.bookstore.services.impl;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.dto.payment.VnPayIpnResponse;
import com.bookstore.dto.payment.VnPayReturnResponse;
import com.bookstore.models.Bill;
import com.bookstore.models.BillDetail;
import com.bookstore.models.Payment;
import com.bookstore.models.UserVoucher;
import com.bookstore.models.enums.BillStatus;
import com.bookstore.models.enums.InventoryStatus;
import com.bookstore.models.enums.PaymentMethod;
import com.bookstore.models.enums.PaymentStatus;
import com.bookstore.repository.BillDetailRepository;
import com.bookstore.repository.BillRepository;
import com.bookstore.repository.PaymentRepository;
import com.bookstore.repository.UserVoucherRepository;
import com.bookstore.services.InventoryService;
import com.bookstore.services.PaymentService;
import com.bookstore.services.VnPayService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;
    private final BillDetailRepository billDetailRepository;
    private final UserVoucherRepository userVoucherRepository;
    private final InventoryService inventoryService;
    private final VnPayService vnPayService;

    @Override
    @Transactional
    public VnPayIpnResponse handleVnPayIpn(Map<String, String> parameters) {
        if (!vnPayService.isValidSignature(parameters)) {
            return new VnPayIpnResponse("97", "Invalid signature");
        }

        String txnRef = parameters.get("vnp_TxnRef");
        Optional<Payment> paymentSnapshot = paymentRepository.findByTxnRef(txnRef);
        if (paymentSnapshot.isEmpty()) {
            return new VnPayIpnResponse("01", "Order not found");
        }
        // lock the bill row for update (optimistic locking) this mean
        Bill bill = billRepository.findByIdForUpdate(paymentSnapshot.get().getBill().getBillId())
                .orElse(null);
        if (bill == null) {
            return new VnPayIpnResponse("01", "Order not found");
        }
        // findByTxnRef(...) → chỉ đọc Payment
        // findByTxnRefForUpdate(...) → đọc và khóa Payment để chuẩn bị cập nhật
        Payment payment = paymentRepository.findByTxnRefForUpdate(txnRef).orElse(null);
        if (payment == null || payment.getPaymentMethod() != PaymentMethod.VNPAY) {
            return new VnPayIpnResponse("01", "Order not found");
        }

        // check tmn code , amount when payment in ipn return and check amout gửi về với
        // amount trong db
        if (!isValidTmnCode(parameters.get("vnp_TmnCode"))
                || !isValidAmount(payment, parameters.get("vnp_Amount"))) {
            return new VnPayIpnResponse("04", "Invalid amount or merchant");
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            return new VnPayIpnResponse("02", "Order already confirmed");
        }

        // store response from VNPAY to Payment db
        applyVnPayResult(payment, parameters);

        boolean successful = "00".equals(payment.getResponseCode())
                && "00".equals(payment.getTransactionStatus());

        if (successful) {
            completeOnlinePayment(bill, payment);
        } else {
            failOnlinePayment(bill, payment);
        }

        paymentRepository.save(payment);
        billRepository.save(bill);
        return new VnPayIpnResponse("00", "Confirm Success");
    }

    @Override
    @Transactional(readOnly = true)
    public VnPayReturnResponse handleVnPayReturn(Map<String, String> parameters) {
        boolean validSignature = vnPayService.isValidSignature(parameters);
        String txnRef = parameters.get("vnp_TxnRef");
        String responseCode = parameters.get("vnp_ResponseCode");
        String transactionStatus = parameters.get("vnp_TransactionStatus");
        boolean successful = validSignature
                && "00".equals(responseCode)
                && "00".equals(transactionStatus);

        return VnPayReturnResponse.builder()
                .validSignature(validSignature)
                .successful(successful)
                .txnRef(txnRef)
                .responseCode(responseCode)
                .transactionStatus(transactionStatus)
                .message(validSignature
                        ? (successful ? "Thanh toan thanh cong" : "Thanh toan khong thanh cong")
                        : "Chu ky VNPAY khong hop le")
                .build();
    }

    @Override
    @Transactional
    public void expirePendingVnPayPayments() {
        List<Payment> expired = paymentRepository.findExpiredPayments(
                PaymentStatus.PENDING,
                PaymentMethod.VNPAY,
                OffsetDateTime.now(ZoneOffset.UTC));

        for (Payment snapshot : expired) {
            Bill bill = billRepository.findByIdForUpdate(snapshot.getBill().getBillId()).orElse(null);
            if (bill == null) {
                continue;
            }

            Payment payment = paymentRepository.findByTxnRefForUpdate(snapshot.getTxnRef()).orElse(null);
            if (payment == null
                    || payment.getStatus() != PaymentStatus.PENDING
                    || payment.getExpiresAt() == null
                    || payment.getExpiresAt().isAfter(OffsetDateTime.now(ZoneOffset.UTC))) {
                continue;
            }

            if (bill.getInventoryStatus() == InventoryStatus.RESERVED) {
                inventoryService.releaseReservations(findBillDetails(bill));
                bill.setInventoryStatus(InventoryStatus.RELEASED);
            }
            bill.setStatus(BillStatus.CANCELLED);
            releaseVoucher(bill);

            payment.setStatus(PaymentStatus.CANCELLED);
            payment.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));
            paymentRepository.save(payment);
            billRepository.save(bill);
        }
    }

    private void completeOnlinePayment(Bill bill, Payment payment) {
        if (bill.getInventoryStatus() != InventoryStatus.RESERVED) {
            throw new IllegalStateException("Don hang khong con ton kho da giu");
        }
        // call inventory service to deduct reservations and reduce quantity of book
        inventoryService.deductReservations(findBillDetails(bill));
        bill.setInventoryStatus(InventoryStatus.DEDUCTED);
        bill.setStatus(BillStatus.CONFIRMED);

        payment.setStatus(PaymentStatus.SUCCEEDED);
        if (payment.getPaidAt() == null) {
            payment.setPaidAt(OffsetDateTime.now(ZoneOffset.UTC));
        }
    }

    private void failOnlinePayment(Bill bill, Payment payment) {
        if (bill.getInventoryStatus() == InventoryStatus.RESERVED) {
            inventoryService.releaseReservations(findBillDetails(bill));
            bill.setInventoryStatus(InventoryStatus.RELEASED);
        }
        bill.setStatus(BillStatus.CANCELLED);
        releaseVoucher(bill);
        payment.setStatus(PaymentStatus.FAILED);
        payment.setPaidAt(null);
    }

    private void applyVnPayResult(Payment payment, Map<String, String> parameters) {
        payment.setTransactionNo(parameters.get("vnp_TransactionNo"));
        payment.setBankCode(parameters.get("vnp_BankCode"));
        payment.setBankTransactionNo(parameters.get("vnp_BankTranNo"));
        payment.setCardType(parameters.get("vnp_CardType"));
        payment.setResponseCode(parameters.get("vnp_ResponseCode"));
        payment.setTransactionStatus(parameters.get("vnp_TransactionStatus"));
        payment.setPaidAt(vnPayService.parseVnPayDate(parameters.get("vnp_PayDate")));
        payment.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));
    }

    private boolean isValidAmount(Payment payment, String callbackAmount) {
        if (callbackAmount == null) {
            return false;
        }
        try {
            return new BigDecimal(callbackAmount)
                    .compareTo(payment.getAmount().multiply(BigDecimal.valueOf(100))) == 0;
        } catch (NumberFormatException ex) {
            return false;
        }
    }

    private boolean isValidTmnCode(String tmnCode) {
        return tmnCode != null && tmnCode.equals(vnPayService.getTmnCode());
    }

    private List<BillDetail> findBillDetails(Bill bill) {
        return billDetailRepository.findByBillBillId(bill.getBillId());
    }

    private void releaseVoucher(Bill bill) {
        if (bill.getVoucher() == null) {
            return;
        }
        Optional<UserVoucher> userVoucher = userVoucherRepository
                .findByUserUserIdAndVoucherVoucherId(
                        bill.getUser().getUserId(),
                        bill.getVoucher().getVoucherId());
        userVoucher.ifPresent(value -> {
            value.setUsed(false);
            value.setUsedAt(null);
            userVoucherRepository.save(value);
        });
    }
}
