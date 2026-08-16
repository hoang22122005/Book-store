package com.bookstore.services.impl;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.dto.dashboard.OrderSummaryResponse;
import com.bookstore.dto.dashboard.FinancialOverviewResponse;
import com.bookstore.dto.dashboard.PaymentMethodStatsResponse;
import com.bookstore.dto.dashboard.RevenuePointResponse;
import com.bookstore.dto.dashboard.TopBookResponse;
import com.bookstore.dto.dashboard.TopCustomerResponse;
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
    private static final long MAX_REPORT_DAYS = 366;

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

    @Override
    public FinancialOverviewResponse getFinancialOverview(LocalDate from, LocalDate to) {
        validateReportRange(from, to);
        List<Object[]> rows = dashboardRepository.getFinancialOverview(
                from.atStartOfDay(),
                to.plusDays(1).atStartOfDay());
        Object[] row = rows.isEmpty() ? new Object[7] : rows.get(0);

        BigDecimal revenue = toBigDecimal(row[0]);
        long totalOrders = toLong(row[1]);
        long completedOrders = toLong(row[2]);
        long cancelledOrders = toLong(row[3]);
        BigDecimal averageOrderValue = toBigDecimal(row[4]);
        long itemsSold = toLong(row[5]);
        BigDecimal subtotalBeforeVoucher = toBigDecimal(row[6]);
        BigDecimal voucherDiscount = subtotalBeforeVoucher.subtract(revenue).max(BigDecimal.ZERO);
        BigDecimal completionRate = totalOrders == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(completedOrders)
                        .multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(totalOrders), 2, java.math.RoundingMode.HALF_UP);

        return FinancialOverviewResponse.builder()
                .from(from)
                .to(to)
                .revenue(revenue)
                .totalOrders(totalOrders)
                .completedOrders(completedOrders)
                .cancelledOrders(cancelledOrders)
                .completionRatePercent(completionRate)
                .itemsSold(itemsSold)
                .averageOrderValue(averageOrderValue)
                .subtotalBeforeVoucher(subtotalBeforeVoucher)
                .voucherDiscount(voucherDiscount)
                .build();
    }

    @Override
    public List<PaymentMethodStatsResponse> getPaymentMethodStats(LocalDate from, LocalDate to) {
        validateReportRange(from, to);
        return dashboardRepository.getPaymentMethodStats(
                        from.atStartOfDay(),
                        to.plusDays(1).atStartOfDay())
                .stream()
                .map(row -> new PaymentMethodStatsResponse(
                        row[0].toString(),
                        toLong(row[1]),
                        toBigDecimal(row[2])))
                .toList();
    }

    @Override
    public List<TopCustomerResponse> getTopCustomers(LocalDate from, LocalDate to, int limit) {
        validateReportRange(from, to);
        if (limit < 1 || limit > 50) {
            throw new BadRequestException("Gioi han khach hang phai tu 1 den 50");
        }
        return dashboardRepository.getTopCustomers(
                        from.atStartOfDay(),
                        to.plusDays(1).atStartOfDay(),
                        limit)
                .stream()
                .map(row -> new TopCustomerResponse(
                        ((Number) row[0]).intValue(),
                        (String) row[1],
                        (String) row[2],
                        toLong(row[3]),
                        toBigDecimal(row[4]),
                        toBigDecimal(row[5])))
                .toList();
    }

    private void validateReportRange(LocalDate from, LocalDate to) {
        if (from == null || to == null || from.isAfter(to)) {
            throw new BadRequestException("Khoang thoi gian bao cao khong hop le");
        }
        if (ChronoUnit.DAYS.between(from, to) > MAX_REPORT_DAYS) {
            throw new BadRequestException("Khoang thoi gian bao cao khong duoc vuot qua 366 ngay");
        }
    }

    private long toLong(Object value) {
        return value == null ? 0L : ((Number) value).longValue();
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
