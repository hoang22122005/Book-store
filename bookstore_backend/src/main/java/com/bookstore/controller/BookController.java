package com.bookstore.controller;

import java.io.IOException;
import java.math.BigDecimal;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.bookstore.common.response.BookResponse;
import com.bookstore.common.response.PageResponse;
import com.bookstore.models.Book;
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

    @PostMapping("/book")
    public ResponseEntity<?> addBook(@RequestParam Book book, @RequestParam MultipartFile imgFile) throws IOException {
        BookResponse result = bookService.addBook(book, imgFile);
        if (result != null)
            return new ResponseEntity<>(result, HttpStatus.OK);
        return new ResponseEntity<>("Error in add book", HttpStatus.BAD_REQUEST);
    }

    @PutMapping("/book/{bookId}")
    public ResponseEntity<?> updateBook(@RequestParam Book book, @PathVariable int bookId,
            @RequestParam MultipartFile imgFile) throws IOException {
        if (book.getBookId() != bookId)
            return new ResponseEntity<>("invalid book id", HttpStatus.BAD_REQUEST);

        BookResponse result = bookService.updateBook(book, imgFile);
        if (result != null)
            return new ResponseEntity<>(result, HttpStatus.OK);
        return new ResponseEntity<>("Error in update book", HttpStatus.BAD_REQUEST);
    }

    @DeleteMapping("/book/{bookId}")
    public ResponseEntity<String> deleteBook(@PathVariable int bookId) {
        try {
            bookService.deleteBook(bookId);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error in delete book", HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<>("Delete successfull", HttpStatus.OK);
    }
}
