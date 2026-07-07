package com.bookstore.services;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.bookstore.dto.product.BookResponse;
import com.bookstore.common.response.PageResponse;
import com.bookstore.models.Book;

public interface BookService {
    List<Book> getAllBooks();
    Book getBookById(int bookId);
    PageResponse<BookResponse> getBooks(String keyword, String author, Integer categoryId,
                                        BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
    BookResponse getBookDetail(int bookId);
    void deleteBook(int bookId);
    BookResponse updateBook(int bookId, Book book, MultipartFile imgFile) throws IOException;
    BookResponse addBook(Book book, MultipartFile imgFile) throws IOException;
}
