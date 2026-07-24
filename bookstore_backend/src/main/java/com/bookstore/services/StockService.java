package com.bookstore.services;

import com.bookstore.dto.product.BookResponse;

public interface StockService {
    BookResponse importStock(int bookId, int quantity);
}
