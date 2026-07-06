package com.bookstore.controller;

import java.math.BigDecimal;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.common.response.BookResponse;
import com.bookstore.common.response.PageResponse;
import com.bookstore.common.response.ApiResponse;
import com.bookstore.services.impl.BookServiceImpl;

@RestController
@RequestMapping("/api/public")
public class BookController {
    private final BookServiceImpl bookService;

    public BookController(BookServiceImpl bookService) {
        this.bookService = bookService;
    }

    @GetMapping("/books")
    public ResponseEntity<ApiResponse<PageResponse<BookResponse>>> getBooks(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @PageableDefault(size = 12, sort = "bookId", direction = Sort.Direction.DESC) Pageable pageable) {

        PageResponse<BookResponse> books = bookService.getBooks(keyword, author, categoryId, minPrice, maxPrice, pageable);
        return ResponseEntity.ok(ApiResponse.success("Books fetched successfully", books));
    }

    @GetMapping("/books/{bookId}")
    public ResponseEntity<ApiResponse<BookResponse>> getBookById(@PathVariable int bookId) {
        BookResponse book = bookService.getBookDetail(bookId);
        return ResponseEntity.ok(ApiResponse.success("Book fetched successfully", book));
    }
}
