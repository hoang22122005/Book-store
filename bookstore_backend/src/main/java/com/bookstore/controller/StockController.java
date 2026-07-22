package com.bookstore.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.common.response.ApiResponse;
import com.bookstore.dto.product.BookResponse;
import com.bookstore.dto.stock.ImportStockRequest;
import com.bookstore.services.StockService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
public class StockController {
     private final StockService stockService;
    
    @PatchMapping("/books/{bookId}")
    @PreAuthorize("hasRole('WAREHOUSE_KEEPER')")
    public ApiResponse<BookResponse> importStock(
            @PathVariable int bookId,
            @Valid @RequestBody ImportStockRequest request) {

        BookResponse response = stockService.importStock(bookId, request.getQuantity());
        return ApiResponse.success( "Nhập kho thành công", response);
    }
    
}
