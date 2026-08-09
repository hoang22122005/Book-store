package com.bookstore.services;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.bookstore.dto.product.GenreResponse;
import com.bookstore.dto.product.BookResponse;
import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.book.BookAddRequest;
import com.bookstore.dto.book.BookUpdateRequest;
import com.bookstore.models.Book;

public interface BookService {
    List<Book> getAllBooks();
    Book getBookById(int bookId);
    PageResponse<BookResponse> getBooks(String keyword, String author, Integer categoryId,
                                        BigDecimal minPrice, BigDecimal maxPrice, Boolean inStock, Pageable pageable);
    BookResponse getBookDetail(int bookId);
    List<GenreResponse> getAllGenres();
    void deleteBook(int bookId);
    Book updateBook(int bookId, BookUpdateRequest book, MultipartFile imgFile) throws IOException;
    Book addBook(BookAddRequest book, MultipartFile imgFile) throws IOException;
}

