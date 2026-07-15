package com.bookstore.services.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.bill.BillResponse;
import com.bookstore.dto.bill.CreateBillRequest;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ConflictException;
import com.bookstore.exception.ForbiddenException;
import com.bookstore.exception.NotFoundException;
import com.bookstore.models.Bill;
import com.bookstore.models.BillDetail;
import com.bookstore.models.Cart;
import com.bookstore.models.CartDetail;
import com.bookstore.models.User;
import com.bookstore.models.Voucher;
import com.bookstore.models.UserVoucher;
import com.bookstore.models.enums.BillStatus;
import com.bookstore.repository.BillDetailRepository;
import com.bookstore.repository.BillRepository;
import com.bookstore.repository.CartDetailRepo;
import com.bookstore.repository.CartRepo;
import com.bookstore.repository.UserRepository;
import com.bookstore.repository.UserVoucherRepository;
import com.bookstore.repository.VoucherRepository;
import com.bookstore.services.BillService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BillServiceImpl implements BillService {
    private static final String SCOPE_GLOBAL = "GLOBAL";

    private final BillRepository billRepository;
    private final BillDetailRepository billDetailRepository;
    private final CartRepo cartRepo;
    private final CartDetailRepo cartDetailRepo;
    private final UserRepository userRepository;
    private final VoucherRepository voucherRepository;
    private final UserVoucherRepository userVoucherRepository;

    @Override
    public PageResponse<BillResponse> getAllBills(Pageable pageable) {
        return PageResponse.toPageResponse(billRepository.findAll(pageable).map(this::toBillResponse));
    }

    @Override
    public PageResponse<BillResponse> getMyBills(int userId, Pageable pageable) {
        return PageResponse.toPageResponse(billRepository.findByUserUserId(userId, pageable).map(this::toBillResponse));
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
    public BillResponse createBillFromMyCart(int userId, CreateBillRequest request) {
        User user = findUser(userId);
        Cart cart = cartRepo.findByUser_UserId(userId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay gio hang"));
        List<CartDetail> cartDetails = cartDetailRepo.findAllCartDetails(cart.getCartId());

        if (cartDetails.isEmpty()) {
            throw new BadRequestException("Gio hang dang trong");
        }

        List<CartDetail> selectedCartDetails = cartDetails;
        List<Integer> selectedBookIds = request.getSelectedBookIds();
        if (selectedBookIds != null && !selectedBookIds.isEmpty()) {
            selectedCartDetails = cartDetails.stream()
                    .filter(cd -> selectedBookIds.contains(cd.getBook().getBookId()))
                    .toList();
            if (selectedCartDetails.isEmpty()) {
                throw new BadRequestException("Khong co san pham nao duoc chon de thanh toan");
            }
        }

        UserVoucher userVoucher = findUsableVoucher(userId, request.getVoucherCode());
        Voucher voucher = userVoucher == null ? null : userVoucher.getVoucher();
        BigDecimal subTotal = calculateSubTotal(selectedCartDetails);
        BigDecimal totalAmount = applyDiscount(subTotal, voucher == null ? 0 : voucher.getDiscount());

        Bill bill = new Bill();
        bill.setUser(user);
        bill.setVoucher(voucher);
        bill.setTotalAmount(totalAmount);
        bill.setStatus(BillStatus.PENDING);
        bill.setCreatedAt(LocalDateTime.now());
        Bill savedBill = billRepository.save(bill);

        List<BillDetail> billDetails = selectedCartDetails.stream()
                .map(cartDetail -> toBillDetail(savedBill, cartDetail))
                .toList();
        billDetailRepository.saveAll(billDetails);

        if (userVoucher != null) {
            userVoucher.setUsed(true);
            userVoucher.setUsedAt(LocalDateTime.now());
            userVoucherRepository.save(userVoucher);
        }

        cartDetailRepo.deleteAll(selectedCartDetails);
        
        final List<CartDetail> finalSelectedCartDetails = selectedCartDetails;
        BigDecimal remainingTotal = cartDetails.stream()
                .filter(cd -> !finalSelectedCartDetails.contains(cd))
                .map(cd -> cd.getBook().getPrice().multiply(BigDecimal.valueOf(cd.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        cart.setTotalAmount(remainingTotal);
        cartRepo.save(cart);

        return toBillResponse(savedBill);
    }

    @Override
    @Transactional
    public BillResponse updateBillStatusForAdmin(int billId, String status) {
        Bill bill = findBill(billId);
        bill.setStatus(BillStatus.from(status));
        return toBillResponse(billRepository.save(bill));
    }

    private Bill findBill(int billId) {
        return billRepository.findById(billId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay hoa don"));
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
        UserVoucher userVoucher = userVoucherRepository.findByUserUserIdAndVoucherCode(userId, code).orElse(null);

        if (userVoucher == null) {
            Voucher globalVoucher = voucherRepository.findByCodeAndScopeIgnoreCase(code, SCOPE_GLOBAL)
                    .orElseThrow(() -> new NotFoundException("Khong tim thay voucher cua nguoi dung hien tai"));
            userVoucher = new UserVoucher();
            userVoucher.setUser(findUser(userId));
            userVoucher.setVoucher(globalVoucher);
            userVoucher.setUsed(false);
            userVoucher.setUsedAt(null);
        }

        if (userVoucher.isUsed()) {
            throw new ConflictException("Voucher da duoc su dung");
        }

        if (userVoucher.getVoucher().getExpiredAt() != null && userVoucher.getVoucher().getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Voucher da het han");
        }

        return userVoucher;
    }

    private BigDecimal calculateSubTotal(List<CartDetail> cartDetails) {
        return cartDetails.stream()
                .map(cartDetail -> cartDetail.getBook().getPrice().multiply(BigDecimal.valueOf(cartDetail.getQuantity())))
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
        return BillResponse.from(bill, billDetailRepository.findByBillBillId(bill.getBillId()));
    }
}
