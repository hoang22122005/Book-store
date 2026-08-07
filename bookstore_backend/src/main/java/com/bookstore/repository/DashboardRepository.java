package com.bookstore.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import com.bookstore.models.Bill;

public interface DashboardRepository extends Repository<Bill, Integer> {
    @Query("select b.status, count(b) from Bill b group by b.status")
    List<Object[]> countOrdersByStatus();

    @Query("select coalesce(sum(b.totalAmount), 0) from Bill b where b.status = com.bookstore.models.enums.BillStatus.COMPLETED")
    Object getTotalRevenue();

    @Query(value = """
            select cast(b.created_at as date) as revenue_date, coalesce(sum(b.total_amount), 0) as revenue
            from bill b
            where b.status = 'COMPLETED' and b.created_at >= :fromDate and b.created_at < :toDate
            group by cast(b.created_at as date)
            order by revenue_date
            """, nativeQuery = true)
    List<Object[]> getDailyRevenue(@Param("fromDate") LocalDateTime fromDate,
                                   @Param("toDate") LocalDateTime toDate);

    @Query(value = """
            select bk.book_id, bk.name, sum(bd.quantity) as quantity_sold,
                   coalesce(sum(bd.quantity * bd.price_at_purchase), 0) as revenue
            from bill_detail bd
            join bill b on b.bill_id = bd.bill_id
            join book bk on bk.book_id = bd.book_id
            where b.status = 'COMPLETED'
            group by bk.book_id, bk.name
            order by quantity_sold desc, revenue desc
            limit :limit
            """, nativeQuery = true)
    List<Object[]> getTopSellingBooks(@Param("limit") int limit);

    @Query(value = """
            with order_stats as (
                select coalesce(sum(b.total_amount) filter (where b.status = 'COMPLETED'), 0) as revenue,
                       count(*) as total_orders,
                       count(*) filter (where b.status = 'COMPLETED') as completed_orders,
                       count(*) filter (where b.status = 'CANCELLED') as cancelled_orders,
                       coalesce(avg(b.total_amount) filter (where b.status = 'COMPLETED'), 0) as average_order_value
                from bill b
                where b.created_at >= :fromDate and b.created_at < :toDate
            ),
            detail_stats as (
                select coalesce(sum(bd.quantity), 0) as items_sold,
                       coalesce(sum(bd.quantity * bd.price_at_purchase), 0) as subtotal_before_voucher
                from bill b
                join bill_detail bd on bd.bill_id = b.bill_id
                where b.status = 'COMPLETED'
                  and b.created_at >= :fromDate and b.created_at < :toDate
            )
            select os.revenue, os.total_orders, os.completed_orders, os.cancelled_orders,
                   os.average_order_value, ds.items_sold, ds.subtotal_before_voucher
            from order_stats os cross join detail_stats ds
            """, nativeQuery = true)
    Object[] getFinancialOverview(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    @Query(value = """
            select paid.payment_method,
                   count(*) as order_count,
                   coalesce(sum(paid.total_amount), 0) as revenue
            from (
                select distinct on (b.bill_id)
                       b.bill_id, b.total_amount, p.payment_method
                from bill b
                join payment p on p.bill_id = b.bill_id
                where b.status = 'COMPLETED'
                  and p.status = 'SUCCEEDED'
                  and b.created_at >= :fromDate and b.created_at < :toDate
                order by b.bill_id, p.payment_id desc
            ) paid
            group by paid.payment_method
            order by revenue desc, paid.payment_method
            """, nativeQuery = true)
    List<Object[]> getPaymentMethodStats(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    @Query(value = """
            select u.user_id, u.name, u.email,
                   count(b.bill_id) as completed_orders,
                   coalesce(sum(b.total_amount), 0) as total_spent,
                   coalesce(avg(b.total_amount), 0) as average_order_value
            from bill b
            join "user" u on u.user_id = b.user_id
            where b.status = 'COMPLETED'
              and b.created_at >= :fromDate and b.created_at < :toDate
            group by u.user_id, u.name, u.email
            order by total_spent desc, completed_orders desc, u.user_id
            limit :limit
            """, nativeQuery = true)
    List<Object[]> getTopCustomers(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("limit") int limit);
}
