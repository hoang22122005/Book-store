package com.bookstore.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bookstore.models.StockImportDetail;

public interface StockImportDetailRepository extends JpaRepository<StockImportDetail, Long> {
}
