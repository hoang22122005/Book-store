package com.bookstore.services.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.bookstore.dto.payment.VnPayIpnResponse;
import com.bookstore.models.Bill;
import com.bookstore.models.Payment;
import com.bookstore.models.enums.BillStatus;
import com.bookstore.models.enums.InventoryStatus;
import com.bookstore.models.enums.PaymentMethod;
import com.bookstore.models.enums.PaymentStatus;
import com.bookstore.repository.BillDetailRepository;
import com.bookstore.repository.BillRepository;
import com.bookstore.repository.PaymentRepository;
import com.bookstore.repository.UserVoucherRepository;
import com.bookstore.services.InventoryService;
import com.bookstore.services.VnPayService;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTests {
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private BillRepository billRepository;
    @Mock
    private BillDetailRepository billDetailRepository;
    @Mock
    private UserVoucherRepository userVoucherRepository;
    @Mock
    private InventoryService inventoryService;
    @Mock
    private VnPayService vnPayService;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    @Test
    void successfulVnPayIpnConfirmsBillWithoutStaffConfirmation() {
        Bill bill = new Bill();
        bill.setBillId(10);
        bill.setStatus(BillStatus.PENDING);
        bill.setInventoryStatus(InventoryStatus.RESERVED);

        Payment payment = new Payment();
        payment.setBill(bill);
        payment.setTxnRef("VNPAY-10");
        payment.setAmount(BigDecimal.valueOf(150_000));
        payment.setPaymentMethod(PaymentMethod.VNPAY);
        payment.setStatus(PaymentStatus.PENDING);

        Map<String, String> parameters = Map.of(
                "vnp_TxnRef", "VNPAY-10",
                "vnp_TmnCode", "TESTCODE",
                "vnp_Amount", "15000000",
                "vnp_ResponseCode", "00",
                "vnp_TransactionStatus", "00");

        when(vnPayService.isValidSignature(parameters)).thenReturn(true);
        when(vnPayService.getTmnCode()).thenReturn("TESTCODE");
        when(paymentRepository.findByTxnRef("VNPAY-10")).thenReturn(Optional.of(payment));
        when(billRepository.findByIdForUpdate(10)).thenReturn(Optional.of(bill));
        when(paymentRepository.findByTxnRefForUpdate("VNPAY-10")).thenReturn(Optional.of(payment));
        when(billDetailRepository.findByBillBillId(10)).thenReturn(List.of());

        VnPayIpnResponse response = paymentService.handleVnPayIpn(parameters);

        assertThat(response.getRspCode()).isEqualTo("00");
        assertThat(payment.getStatus()).isEqualTo(PaymentStatus.SUCCEEDED);
        assertThat(bill.getInventoryStatus()).isEqualTo(InventoryStatus.DEDUCTED);
        assertThat(bill.getStatus()).isEqualTo(BillStatus.CONFIRMED);
        verify(inventoryService).deductReservations(List.of());
    }
}
