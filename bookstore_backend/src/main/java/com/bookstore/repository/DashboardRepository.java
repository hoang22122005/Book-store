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
}
