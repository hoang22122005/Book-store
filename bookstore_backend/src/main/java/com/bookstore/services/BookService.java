package com.bookstore.services;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Pageable;

import com.bookstore.common.response.BookResponse;
import com.bookstore.common.response.PageResponse;
import com.bookstore.models.Book;

public interface BookService {
    List<Book> getAllBooks();
    Book getBookById(int bookId);
    PageResponse<BookResponse> getBooks(String keyword, String author, Integer categoryId,
                                        BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
    BookResponse getBookDetail(int bookId);
}
