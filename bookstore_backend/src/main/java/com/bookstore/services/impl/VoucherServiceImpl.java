package com.bookstore.services.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.voucher.CreateVoucherRequest;
import com.bookstore.dto.voucher.VoucherResponse;
import com.bookstore.exception.ConflictException;
import com.bookstore.exception.NotFoundException;
import com.bookstore.models.User;
import com.bookstore.models.UserVoucher;
import com.bookstore.models.Voucher;
import com.bookstore.repository.UserRepository;
import com.bookstore.repository.UserVoucherRepository;
import com.bookstore.repository.VoucherRepository;
import com.bookstore.services.VoucherService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {
    private static final String SCOPE_GLOBAL = "GLOBAL";
    private static final String SCOPE_PRIVATE = "PRIVATE";

    private final VoucherRepository voucherRepository;
    private final UserVoucherRepository userVoucherRepository;
    private final UserRepository userRepository;

    @Override
    public PageResponse<VoucherResponse> getAllVouchers(Pageable pageable) {
        return PageResponse.toPageResponse(voucherRepository.findAll(pageable).map(this::toAdminVoucherResponse));
    }

    @Override
    public PageResponse<VoucherResponse> getMyVouchers(int userId, Pageable pageable) {
        List<VoucherResponse> responses = new ArrayList<>();
        
        List<Voucher> unclaimed = voucherRepository.findUnclaimedVouchers(userId, Pageable.unpaged()).getContent();
        unclaimed.forEach(v -> responses.add(VoucherResponse.availableToUser(v)));

        List<UserVoucher> claimed = userVoucherRepository.findByUserUserId(userId, Pageable.unpaged()).getContent();
        claimed.forEach(uv -> responses.add(VoucherResponse.from(uv)));

        responses.sort((v1, v2) -> {
            if (v1.getExpiredAt() == null && v2.getExpiredAt() == null) return 0;
            if (v1.getExpiredAt() == null) return 1;
            if (v2.getExpiredAt() == null) return -1;
            return v1.getExpiredAt().compareTo(v2.getExpiredAt());
        });

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), responses.size());
        List<VoucherResponse> pageContent = start <= end && start < responses.size() ? responses.subList(start, end) : new ArrayList<>();

        return PageResponse.toPageResponse(new PageImpl<>(pageContent, pageable, responses.size()));
    }

    @Override
    @Transactional
    public VoucherResponse createVoucher(CreateVoucherRequest request) {
        String code = normalizeCode(request.getCode());
        List<Integer> targetUserIds = normalizeUserIds(request.getUserIds());
        String scope = targetUserIds.isEmpty() ? SCOPE_GLOBAL : SCOPE_PRIVATE;

        Voucher voucher = voucherRepository.findByCode(code).orElse(null);
        if (voucher == null) {
            voucher = new Voucher();
            voucher.setCode(code);
        } else if (!scope.equalsIgnoreCase(voucher.getScope())) {
            throw new ConflictException("Voucher code already exists with another scope");
        }
        voucher.setScope(scope);
        voucher.setDiscount(request.getDiscount());
        voucher.setExpiredAt(request.getExpiredAt());
        voucher.setMaxDiscountAmount(request.getMaxDiscountAmount());
        if (SCOPE_GLOBAL.equals(scope)) {
            int usageCount = voucher.getUsageCount();
            if (request.getUsageLimit() != null && usageCount > request.getUsageLimit()) {
                throw new ConflictException("Usage limit cannot be lower than the current usage count");
            }
            voucher.setUsageLimit(request.getUsageLimit());
        } else {
            if (request.getUsageLimit() != null) {
                throw new ConflictException("Usage limit is only supported for global vouchers");
            }
            voucher.setUsageLimit(null);
            voucher.setUsageCount(0);
        }
        voucher = voucherRepository.save(voucher);

        if (targetUserIds.isEmpty()) {
            return VoucherResponse.from(voucher, List.of());
        }

        List<User> targetUsers = userRepository.findAllById(targetUserIds);
        if (targetUsers.size() != targetUserIds.size()) {
            throw new NotFoundException("One or more users not found");
        }

        List<UserVoucher> userVouchers = new ArrayList<>();
        for (User user : targetUsers) {
            if (userVoucherRepository.existsByUserUserIdAndVoucherCode(user.getUserId(), code)) {
                continue;
            }
            UserVoucher userVoucher = new UserVoucher();
            userVoucher.setUser(user);
            userVoucher.setVoucher(voucher);
            userVoucher.setUsed(false);
            userVoucher.setUsedAt(null);
            userVouchers.add(userVoucher);
        }

        userVoucherRepository.saveAll(userVouchers);
        return VoucherResponse.from(voucher, targetUserIds);
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase();
    }

    private List<Integer> normalizeUserIds(List<Integer> userIds) {
        if (userIds == null) {
            return List.of();
        }
        return userIds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .toList();
    }

    private VoucherResponse toAdminVoucherResponse(Voucher voucher) {
        List<Integer> assignedUserIds = userVoucherRepository.findByVoucherVoucherId(voucher.getVoucherId()).stream()
                .map(userVoucher -> userVoucher.getUser().getUserId())
                .toList();
        return VoucherResponse.from(voucher, assignedUserIds);
    }
}
