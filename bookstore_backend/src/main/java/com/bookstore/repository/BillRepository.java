package com.bookstore.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bookstore.models.Bill;

@Repository
public interface BillRepository extends JpaRepository<Bill, Integer> {
    Page<Bill> findByUserUserId(int userId, Pageable pageable);
}
