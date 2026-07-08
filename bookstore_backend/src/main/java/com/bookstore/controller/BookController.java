package com.bookstore.controller;

import java.io.IOException;
import java.math.BigDecimal;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.bookstore.common.response.BookResponse;
import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.book.BookAddRequest;
import com.bookstore.dto.book.BookUpdateRequest;
import com.bookstore.models.Book;
import com.bookstore.common.response.ApiResponse;
import com.bookstore.services.impl.BookServiceImpl;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BookController {
    private final BookServiceImpl bookService;

    @GetMapping("/public/books")
    public ResponseEntity<ApiResponse<PageResponse<BookResponse>>> getBooks(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @PageableDefault(size = 12, sort = "bookId", direction = Sort.Direction.ASC) Pageable pageable) {

        PageResponse<BookResponse> books = bookService.getBooks(keyword, author, categoryId, minPrice, maxPrice,
                pageable);
        return ResponseEntity.ok(ApiResponse.success("Books fetched successfully", books));
    }

    @GetMapping("/public/books/{bookId}")
    public ResponseEntity<ApiResponse<BookResponse>> getBookDetail(@PathVariable int bookId) {
        BookResponse book = bookService.getBookDetail(bookId);
        return ResponseEntity.ok(ApiResponse.success("Book fetched successfully", book));
    }

    @PostMapping("/admin/books")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Book>> addBook(@RequestPart BookAddRequest bookAddRequest, @RequestPart MultipartFile imgFile)
            throws IOException {
        Book result = bookService.addBook(bookAddRequest, imgFile);
        return ResponseEntity.ok(ApiResponse.success("Add book successfully", result));
    }

    @PutMapping("/admin/books/{bookId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Book>> updateBook(@RequestPart BookUpdateRequest bookUpdateRequest, @PathVariable int bookId,
            @RequestPart MultipartFile imgFile) throws IOException {
        Book result = bookService.updateBook(bookId, bookUpdateRequest, imgFile);
        return ResponseEntity.ok(ApiResponse.success("Update book successfully", result));
    }

    @DeleteMapping("/admin/books/{bookId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteBook(@PathVariable int bookId) {
        bookService.deleteBook(bookId);
        return ResponseEntity.ok(ApiResponse.success("Delete successfully", null));
    }
}
