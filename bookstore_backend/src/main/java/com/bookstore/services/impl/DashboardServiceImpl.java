package com.bookstore.services.impl;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.dto.dashboard.OrderSummaryResponse;
import com.bookstore.dto.dashboard.RevenuePointResponse;
import com.bookstore.dto.dashboard.TopBookResponse;
import com.bookstore.exception.BadRequestException;
import com.bookstore.models.enums.BillStatus;
import com.bookstore.repository.BillRepository;
import com.bookstore.repository.DashboardRepository;
import com.bookstore.services.DashboardService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {
    private final DashboardRepository dashboardRepository;
    private final BillRepository billRepository;

    @Override
    public OrderSummaryResponse getOrderSummary() {
        Map<BillStatus, Long> counts = new EnumMap<>(BillStatus.class);
        for (BillStatus status : BillStatus.values()) {
            counts.put(status, 0L);
        }
        dashboardRepository.countOrdersByStatus()
                .forEach(row -> counts.put((BillStatus) row[0], ((Number) row[1]).longValue()));

        Map<String, Long> responseCounts = new LinkedHashMap<>();
        counts.forEach((status, count) -> responseCounts.put(status.name(), count));
        return OrderSummaryResponse.builder()
                .totalRevenue(toBigDecimal(dashboardRepository.getTotalRevenue()))
                .totalOrders(billRepository.count())
                .ordersByStatus(responseCounts)
                .build();
    }

    @Override
    public List<RevenuePointResponse> getRevenueByDay(LocalDate from, LocalDate to) {
        if (from == null || to == null || from.isAfter(to)) {
            throw new BadRequestException("Khoang thoi gian doanh thu khong hop le");
        }
        return dashboardRepository.getDailyRevenue(from.atStartOfDay(), to.plusDays(1).atStartOfDay()).stream()
                .map(row -> new RevenuePointResponse(toLocalDate(row[0]), toBigDecimal(row[1])))
                .toList();
    }

    @Override
    public List<TopBookResponse> getTopSellingBooks(int limit) {
        if (limit < 5 || limit > 10) {
            throw new BadRequestException("Gioi han top sach phai tu 5 den 10");
        }
        return dashboardRepository.getTopSellingBooks(limit).stream()
                .map(row -> new TopBookResponse(
                        ((Number) row[0]).intValue(),
                        (String) row[1],
                        ((Number) row[2]).longValue(),
                        toBigDecimal(row[3])))
                .toList();
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        return value instanceof BigDecimal decimal ? decimal : new BigDecimal(value.toString());
    }

    private LocalDate toLocalDate(Object value) {
        if (value instanceof Date date) {
            return date.toLocalDate();
        }
        return LocalDate.parse(value.toString());
    }
}
