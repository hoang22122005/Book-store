package com.bookstore.services.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.bill.BillResponse;
import com.bookstore.dto.bill.CreateBillRequest;
import com.bookstore.dto.payment.CheckoutResponse;
import com.bookstore.dto.payment.PaymentResponse;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ConflictException;
import com.bookstore.exception.ForbiddenException;
import com.bookstore.exception.NotFoundException;
import com.bookstore.models.Bill;
import com.bookstore.models.BillDetail;
import com.bookstore.models.Cart;
import com.bookstore.models.CartDetail;
import com.bookstore.models.Payment;
import com.bookstore.models.User;
import com.bookstore.models.UserVoucher;
import com.bookstore.models.Voucher;
import com.bookstore.models.enums.BillStatus;
import com.bookstore.models.enums.InventoryStatus;
import com.bookstore.models.enums.PaymentMethod;
import com.bookstore.models.enums.PaymentStatus;
import com.bookstore.repository.BillDetailRepository;
import com.bookstore.repository.BillRepository;
import com.bookstore.repository.CartDetailRepo;
import com.bookstore.repository.CartRepo;
import com.bookstore.repository.PaymentRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.repository.UserVoucherRepository;
import com.bookstore.repository.VoucherRepository;
import com.bookstore.services.BillService;
import com.bookstore.services.InventoryService;
import com.bookstore.services.VnPayService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BillServiceImpl implements BillService {
    private static final String SCOPE_GLOBAL = "GLOBAL";
    private static final DateTimeFormatter TXN_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final BillRepository billRepository;
    private final BillDetailRepository billDetailRepository;
    private final CartRepo cartRepo;
    private final CartDetailRepo cartDetailRepo;
    private final UserRepository userRepository;
    private final VoucherRepository voucherRepository;
    private final UserVoucherRepository userVoucherRepository;
    private final PaymentRepository paymentRepository;
    private final InventoryService inventoryService;
    private final VnPayService vnPayService;

    @Override
    public PageResponse<BillResponse> getAllBills(Pageable pageable) {
        return PageResponse.toPageResponse(billRepository.findAll(pageable).map(this::toBillResponse));
    }

    @Override
    public PageResponse<BillResponse> getMyBills(int userId, Pageable pageable) {
        return PageResponse.toPageResponse(
                billRepository.findByUserUserId(userId, pageable).map(this::toBillResponse));
    }

    @Override
    public BillResponse getBillByIdForAdmin(int billId) {
        return toBillResponse(findBill(billId));
    }

    @Override
    public BillResponse getMyBillById(int userId, int billId) {
        Bill bill = findBill(billId);
        if (bill.getUser().getUserId() != userId) {
            throw new ForbiddenException("Ban khong co quyen xem hoa don nay");
        }
        return toBillResponse(bill);
    }

    @Override
    @Transactional
    public CheckoutResponse createBillFromMyCart(
            int userId,
            CreateBillRequest request,
            String clientIp) {
        PaymentMethod paymentMethod = PaymentMethod.from(request.getPaymentMethod());
        User user = findUser(userId);
        Cart cart = cartRepo.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay gio hang"));
        List<CartDetail> cartDetails = cartDetailRepo.findAllCartDetails(cart.getCartId());

        if (cartDetails.isEmpty()) {
            throw new BadRequestException("Gio hang dang trong");
        }

        List<CartDetail> selectedCartDetails = selectCartDetails(cartDetails, request.getSelectedBookIds());

        // Atomic conditional UPDATEs are executed in book_id order. Any failure throws
        // a runtime exception, so Spring rolls back all previous reservations.
        // rồi gọi query update trong db để trừ số lượng sách đặt trước

        inventoryService.reserveCartDetails(selectedCartDetails);
        // find user voucher check luôn voucher đã sử dụng chưa
        UserVoucher userVoucher = findUsableVoucher(userId, request.getVoucherCode());
        Voucher voucher = userVoucher == null ? null : userVoucher.getVoucher();
        BigDecimal subTotal = calculateSubTotal(selectedCartDetails);
        BigDecimal totalAmount = applyDiscount(
                subTotal,
                voucher == null ? 0 : voucher.getDiscount());

        Bill bill = new Bill();
        bill.setUser(user);
        bill.setVoucher(voucher);
        bill.setTotalAmount(totalAmount);
        bill.setStatus(BillStatus.PENDING);
        bill.setInventoryStatus(InventoryStatus.RESERVED);
        bill.setCreatedAt(LocalDateTime.now());
        Bill savedBill = billRepository.save(bill);

        List<BillDetail> billDetails = selectedCartDetails.stream()
                .map(cartDetail -> toBillDetail(savedBill, cartDetail))
                .toList();
        billDetailRepository.saveAll(billDetails);

        Payment payment = createPayment(savedBill, paymentMethod, request.getBankCode());
        Payment savedPayment = paymentRepository.save(payment);

        if (userVoucher != null) {
            userVoucher.setUsed(true);
            userVoucher.setUsedAt(LocalDateTime.now());
            userVoucherRepository.save(userVoucher);
        }

        removeCheckedOutItems(cart, cartDetails, selectedCartDetails);

        // check payment method if payment method is VNPAY, create payment url, else
        // return null
        String paymentUrl = paymentMethod == PaymentMethod.VNPAY
                ? vnPayService.createPaymentUrl(savedPayment, normalizeIp(clientIp))
                : null;
        // create url checkout front end redirect to this url to pay
        return CheckoutResponse.builder()
                .bill(BillResponse.from(savedBill, billDetails))
                .payment(PaymentResponse.from(savedPayment))
                .paymentUrl(paymentUrl)
                .build();
    }

    @Override
    @Transactional
    public BillResponse updateBillStatusForAdmin(int billId, String status) {
        return updateStatusWithWorkflow(billId, BillStatus.from(status));
    }

    @Override
    @Transactional
    public BillResponse updateBillStatusForStaff(int billId, String status) {
        return updateStatusWithWorkflow(billId, BillStatus.from(status));
    }

    @Override
    @Transactional
    public BillResponse confirmDeliveryResult(int billId, boolean successful) {
        Bill bill = findBillForUpdate(billId);
        if (bill.getStatus() != BillStatus.SHIPPING) {
            throw new ConflictException("Chi co the xac nhan ket qua khi don hang dang giao");
        }

        transitionBill(
                bill,
                successful ? BillStatus.COMPLETED : BillStatus.CANCELLED);
        return toBillResponse(billRepository.save(bill));
    }

    private BillResponse updateStatusWithWorkflow(int billId, BillStatus targetStatus) {
        Bill bill = findBillForUpdate(billId);
        transitionBill(bill, targetStatus);
        return toBillResponse(billRepository.save(bill));
    }

    private void transitionBill(Bill bill, BillStatus targetStatus) {
        validateStaffTransition(bill.getStatus(), targetStatus);
        Payment payment = findLatestPaymentForUpdate(bill.getBillId());
        List<BillDetail> details = billDetailRepository.findByBillBillId(bill.getBillId());

        switch (targetStatus) {
            case CONFIRMED -> confirmOrder(bill, payment, details);
            case SHIPPING -> ensureInventoryDeducted(bill);
            case COMPLETED -> completeOrder(payment);
            case CANCELLED -> cancelOrder(bill, payment, details);
            case PENDING -> throw new ConflictException("Khong the chuyen don hang ve PENDING");
        }

        bill.setStatus(targetStatus);
    }

    private void confirmOrder(Bill bill, Payment payment, List<BillDetail> details) {
        if (payment == null) {
            ensureLegacyBill(bill);
            return;
        }

        if (payment.getPaymentMethod() == PaymentMethod.VNPAY) {
            if (payment.getStatus() != PaymentStatus.SUCCEEDED
                    || bill.getInventoryStatus() != InventoryStatus.DEDUCTED) {
                throw new ConflictException("Don VNPAY chua thanh toan thanh cong");
            }
            return;
        }

        if (payment.getStatus() != PaymentStatus.PENDING
                || bill.getInventoryStatus() != InventoryStatus.RESERVED) {
            throw new ConflictException("Don thanh toan truc tiep khong o trang thai co the xac nhan");
        }

        inventoryService.deductReservations(details);
        bill.setInventoryStatus(InventoryStatus.DEDUCTED);
    }

    private void completeOrder(Payment payment) {
        if (payment == null) {
            return;
        }

        if (payment.getPaymentMethod() == PaymentMethod.DIRECT) {
            if (payment.getStatus() != PaymentStatus.PENDING) {
                throw new ConflictException("Thanh toan truc tiep da duoc xu ly");
            }
            payment.setStatus(PaymentStatus.SUCCEEDED);
            payment.setPaidAt(OffsetDateTime.now(ZoneOffset.UTC));
            payment.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));
            paymentRepository.save(payment);
            return;
        }

        if (payment.getStatus() != PaymentStatus.SUCCEEDED) {
            throw new ConflictException("Don VNPAY chua thanh toan thanh cong");
        }
    }

    private void cancelOrder(Bill bill, Payment payment, List<BillDetail> details) {
        if (payment != null
                && payment.getPaymentMethod() == PaymentMethod.VNPAY
                && (payment.getStatus() == PaymentStatus.SUCCEEDED
                        || payment.getStatus() == PaymentStatus.PARTIALLY_REFUNDED)) {
            throw new ConflictException("Can hoan tien VNPAY truoc khi huy don");
        }

        if (bill.getInventoryStatus() == InventoryStatus.RESERVED) {
            inventoryService.releaseReservations(details);
            bill.setInventoryStatus(InventoryStatus.RELEASED);
        } else if (bill.getInventoryStatus() == InventoryStatus.DEDUCTED) {
            inventoryService.restock(details);
            bill.setInventoryStatus(InventoryStatus.RESTOCKED);
        } else if (bill.getInventoryStatus() != InventoryStatus.NONE) {
            throw new ConflictException("Ton kho cua don hang da duoc xu ly");
        }

        if (payment != null && payment.getStatus() == PaymentStatus.PENDING) {
            payment.setStatus(PaymentStatus.CANCELLED);
            payment.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));
            paymentRepository.save(payment);
        }
        releaseVoucher(bill);
    }

    private void ensureInventoryDeducted(Bill bill) {
        if (bill.getInventoryStatus() != InventoryStatus.DEDUCTED
                && bill.getInventoryStatus() != InventoryStatus.NONE) {
            throw new ConflictException("Ton kho cua don hang chua duoc tru");
        }
    }

    private void ensureLegacyBill(Bill bill) {
        if (bill.getInventoryStatus() != InventoryStatus.NONE) {
            throw new ConflictException("Khong tim thay giao dich thanh toan cua don hang");
        }
    }

    private void validateStaffTransition(BillStatus currentStatus, BillStatus targetStatus) {
        boolean valid = switch (currentStatus) {
            case PENDING -> targetStatus == BillStatus.CONFIRMED
                    || targetStatus == BillStatus.CANCELLED;
            case CONFIRMED -> targetStatus == BillStatus.SHIPPING
                    || targetStatus == BillStatus.CANCELLED;
            case SHIPPING -> targetStatus == BillStatus.COMPLETED
                    || targetStatus == BillStatus.CANCELLED;
            case COMPLETED, CANCELLED -> false;
        };
        if (!valid) {
            throw new ConflictException(
                    "Khong the chuyen trang thai tu " + currentStatus + " sang " + targetStatus);
        }
    }

    private Payment createPayment(
            Bill bill,
            PaymentMethod paymentMethod,
            String requestedBankCode) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        Payment payment = new Payment();
        payment.setBill(bill);
        payment.setAmount(bill.getTotalAmount());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setPaymentMethod(paymentMethod);
        payment.setTxnRef(generateTxnRef(paymentMethod, now));
        payment.setBankCode(normalizeBankCode(requestedBankCode, paymentMethod));
        payment.setOrderInfo("Thanh toan don hang " + bill.getBillId());
        payment.setVnpCreateDate(now);
        payment.setExpiresAt(paymentMethod == PaymentMethod.VNPAY
                ? now.plusMinutes(vnPayService.getExpireMinutes())
                : null);
        payment.setCreatedAt(now);
        payment.setUpdatedAt(now);
        return payment;
    }

    private String generateTxnRef(PaymentMethod method, OffsetDateTime now) {
        return method.name()
                + now.format(TXN_TIME_FORMAT)
                + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }

    private String normalizeBankCode(String bankCode, PaymentMethod method) {
        if (method == PaymentMethod.DIRECT || bankCode == null || bankCode.isBlank()) {
            return null;
        }
        return bankCode.trim().toUpperCase();
    }

    private String normalizeIp(String clientIp) {
        if (clientIp == null || clientIp.isBlank()) {
            return "127.0.0.1";
        }
        return clientIp.length() <= 45 ? clientIp : clientIp.substring(0, 45);
    }

    private List<CartDetail> selectCartDetails(
            List<CartDetail> cartDetails,
            List<Integer> selectedBookIds) {
        if (selectedBookIds == null || selectedBookIds.isEmpty()) {
            return cartDetails.stream()
                    .sorted((left, right) -> Integer.compare(
                            left.getBook().getBookId(),
                            right.getBook().getBookId()))
                    .toList();
        }

        Set<Integer> selectedIds = new HashSet<>(selectedBookIds);
        List<CartDetail> selected = cartDetails.stream()
                .filter(detail -> selectedIds.contains(detail.getBook().getBookId()))
                .sorted((left, right) -> Integer.compare(
                        left.getBook().getBookId(),
                        right.getBook().getBookId()))
                .toList();

        if (selected.isEmpty() || selected.size() != selectedIds.size()) {
            throw new BadRequestException("Danh sach san pham checkout khong hop le");
        }
        return selected;
    }

    private void removeCheckedOutItems(
            Cart cart,
            List<CartDetail> allCartDetails,
            List<CartDetail> selectedCartDetails) {
        Set<Integer> selectedBookIds = selectedCartDetails.stream()
                .map(detail -> detail.getBook().getBookId())
                .collect(java.util.stream.Collectors.toSet());

        cartDetailRepo.deleteAll(selectedCartDetails);
        BigDecimal remainingTotal = allCartDetails.stream()
                .filter(detail -> !selectedBookIds.contains(detail.getBook().getBookId()))
                .map(detail -> detail.getBook().getPrice()
                        .multiply(BigDecimal.valueOf(detail.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        cart.setTotalAmount(remainingTotal);
        cartRepo.save(cart);
    }

    private Bill findBill(int billId) {
        return billRepository.findById(billId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay hoa don"));
    }

    private Bill findBillForUpdate(int billId) {
        return billRepository.findByIdForUpdate(billId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay hoa don"));
    }

    private Payment findLatestPaymentForUpdate(int billId) {
        List<Payment> payments = paymentRepository.findByBillIdForUpdate(billId);
        return payments.isEmpty() ? null : payments.get(0);
    }

    private User findUser(int userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay nguoi dung"));
    }

    private UserVoucher findUsableVoucher(int userId, String voucherCode) {
        if (voucherCode == null || voucherCode.isBlank()) {
            return null;
        }

        String code = voucherCode.trim().toUpperCase();
        UserVoucher userVoucher = userVoucherRepository
                .findByUserUserIdAndVoucherCode(userId, code)
                .orElse(null);

        if (userVoucher == null) {
            Voucher globalVoucher = voucherRepository.findByCodeAndScopeIgnoreCase(code, SCOPE_GLOBAL)
                    .orElseThrow(() -> new NotFoundException(
                            "Khong tim thay voucher cua nguoi dung hien tai"));
            userVoucher = new UserVoucher();
            userVoucher.setUser(findUser(userId));
            userVoucher.setVoucher(globalVoucher);
            userVoucher.setUsed(false);
            userVoucher.setUsedAt(null);
        }

        if (userVoucher.isUsed()) {
            throw new ConflictException("Voucher da duoc su dung");
        }

        if (userVoucher.getVoucher().getExpiredAt() != null
                && userVoucher.getVoucher().getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Voucher da het han");
        }

        return userVoucher;
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

    private BigDecimal calculateSubTotal(List<CartDetail> cartDetails) {
        return cartDetails.stream()
                .map(cartDetail -> cartDetail.getBook().getPrice()
                        .multiply(BigDecimal.valueOf(cartDetail.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal applyDiscount(BigDecimal subTotal, float discountPercent) {
        BigDecimal discountRate = BigDecimal.valueOf(discountPercent)
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        return subTotal.subtract(subTotal.multiply(discountRate)).max(BigDecimal.ZERO);
    }

    private BillDetail toBillDetail(Bill bill, CartDetail cartDetail) {
        BillDetail billDetail = new BillDetail();
        billDetail.setBill(bill);
        billDetail.setBook(cartDetail.getBook());
        billDetail.setQuantity(cartDetail.getQuantity());
        billDetail.setPriceAtPurchase(cartDetail.getBook().getPrice());
        return billDetail;
    }

    private BillResponse toBillResponse(Bill bill) {
        return BillResponse.from(
                bill,
                billDetailRepository.findByBillBillId(bill.getBillId()));
    }
}
