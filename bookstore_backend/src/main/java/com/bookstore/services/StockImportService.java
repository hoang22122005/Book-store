package com.bookstore.services;

import java.util.List;

import com.bookstore.dto.stock.AddStockImportDetailRequest;
import com.bookstore.dto.stock.CreateStockImportRequest;
import com.bookstore.dto.stock.StockImportResponse;

public interface StockImportService {
    StockImportResponse createDraft(int userId, CreateStockImportRequest req);

    StockImportResponse addDetail(Long importId, AddStockImportDetailRequest req);

    StockImportResponse postImport(Long importId);

    StockImportResponse cancelImport(Long importId);

    List<StockImportResponse> getAll();

    StockImportResponse getById(Long importId);
}
