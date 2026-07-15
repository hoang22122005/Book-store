package com.bookstore.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bookstore.models.BillDetail;

@Repository
public interface BillDetailRepository extends JpaRepository<BillDetail, Integer> {
    List<BillDetail> findByBillBillId(int billId);
}
