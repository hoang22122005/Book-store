package com.bookstore.services.impl;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.bookstore.dto.product.BookResponse;
import com.bookstore.common.response.PageResponse;
import com.bookstore.dto.book.BookAddRequest;
import com.bookstore.dto.book.BookUpdateRequest;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.NotFoundException;
import com.bookstore.models.Book;
import com.bookstore.models.Book_;
import com.bookstore.repository.BookRepo;
import com.bookstore.services.BookService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookServiceImpl implements BookService {
    private static final int MAX_PAGE_SIZE = 50;
    private static final Sort DEFAULT_SORT = Sort.by(Sort.Direction.ASC, Book_.BOOK_ID);

    private final BookRepo bookRepo;
    private final Cloudinary cloudinary;

    @Override
    public List<Book> getAllBooks() {
        return bookRepo.findByIsDeletedFalse();
    }

    @Override
    public Book getBookById(int bookId) {
        return bookRepo.findByBookIdAndIsDeletedFalse(bookId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay sach"));
    }

    @Override
    public PageResponse<BookResponse> getBooks(String keyword, String author, Integer categoryId,
            BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        validatePriceRange(minPrice, maxPrice);

        String normalizedKeyword = normalize(keyword);
        String normalizedAuthor = normalize(author);
        Pageable safePageable = limitPageSize(pageable);

        Page<BookResponse> bookPage = bookRepo.searchBooks(
                normalizedKeyword,
                normalizedAuthor,
                categoryId,
                minPrice,
                maxPrice,
                safePageable).map(BookResponse::toBookResponse);

        return PageResponse.toPageResponse(bookPage);
    }

    @Override
    public BookResponse getBookDetail(int bookId) {
        Book book = bookRepo.findByBookIdAndIsDeletedFalse(bookId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay sach"));

        return BookResponse.toBookResponse(book);
    }

    @Override
    public void deleteBook(int bookId) {
        Book book = bookRepo.findByBookIdAndIsDeletedFalse(bookId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay sach co ID: " + bookId));
        bookRepo.softDeleteBook(LocalDateTime.now(), book.getBookId());
    }

    @Override
    public Book updateBook(int bookId, BookUpdateRequest bookUpdateRequest, MultipartFile imgFile) throws IOException {
        Book oldBook = bookRepo.findById(bookId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay sach co ID: " + bookId));

        checkUpdateBook(bookUpdateRequest, oldBook);

        if (imgFile != null && !imgFile.isEmpty()) {
            String oldPublicId = oldBook.getPublicId();
            cloudinary.uploader().destroy(oldPublicId, null);

            Map<?, ?> uploadResult = cloudinary.uploader().upload(imgFile.getBytes(), ObjectUtils.emptyMap());
            String secureUrl = uploadResult.get("secure_url").toString();
            String publicId = uploadResult.get("public_id").toString();

            oldBook.setUrlImg(secureUrl);
            oldBook.setPublicId(publicId);
        }

        return bookRepo.updateBook(oldBook.getName(), oldBook.getAuthor(), oldBook.getDescription(), oldBook.getPrice(),
                oldBook.getQuantityInStock(), oldBook.isVip(), oldBook.isDeleted(), oldBook.getDeletedAt(),
                oldBook.getPageCount(), oldBook.getBookId());
    }

    @Override
    public Book addBook(BookAddRequest bookAddRequest, MultipartFile imgFile) throws IOException {
        Book book = checkAddBook(bookAddRequest);

        Map<?, ?> uploadResult = cloudinary.uploader().upload(imgFile.getBytes(), ObjectUtils.emptyMap());
        String secureUrl = uploadResult.get("secure_url").toString();
        String publicId = uploadResult.get("public_id").toString();

        book.setUrlImg(secureUrl);
        book.setPublicId(publicId);

        return bookRepo.save(book);
    }

    private void validatePriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        if (minPrice == null || maxPrice == null) {
            return;
        }

        if (minPrice.compareTo(maxPrice) > 0) {
            throw new BadRequestException("Gia min phai nho hon hoac bang gia max");
        }
    }

    private String normalize(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        return value.trim();
    }

    private Pageable limitPageSize(Pageable pageable) {
        int page = Math.max(pageable.getPageNumber(), 0);
        int size = Math.min(Math.max(pageable.getPageSize(), 1), MAX_PAGE_SIZE);
        Sort sort = pageable.getSort().isSorted() ? pageable.getSort() : DEFAULT_SORT;

        return PageRequest.of(page, size, sort);
    }

    private void checkUpdateBook(BookUpdateRequest bookUpdateRequest, Book oldBook) {
        oldBook.setAuthor(bookUpdateRequest.getAuthor());
        oldBook.setDescription(bookUpdateRequest.getDescription());
        oldBook.setName(bookUpdateRequest.getName());
        oldBook.setPrice(bookUpdateRequest.getPrice());
        oldBook.setQuantityInStock(bookUpdateRequest.getQuantityInStock());
        oldBook.setVip(bookUpdateRequest.isVip());
        oldBook.setDeleted(bookUpdateRequest.isDeleted());
        if (!bookUpdateRequest.isDeleted())
            oldBook.setDeletedAt(null);
        else
            oldBook.setDeletedAt(bookUpdateRequest.getDeletedAt());
        oldBook.setPageCount(bookUpdateRequest.getPageCount());
    }

    private Book checkAddBook(BookAddRequest bookAddRequest) {
        Book book = new Book();

        book.setAuthor(bookAddRequest.getAuthor());
        book.setDescription(bookAddRequest.getDescription());
        book.setName(bookAddRequest.getName()); 
        book.setPrice(bookAddRequest.getPrice());
        book.setQuantityInStock(bookAddRequest.getQuantityInStock());
        book.setVip(bookAddRequest.isVip());
        book.setDeleted(false);
        book.setDeletedAt(null);
        book.setPageCount(bookAddRequest.getPageCount());
        book.setCreatedAt(LocalDateTime.now());
        book.setCntRating(0);
        book.setAvgRating(0.0f);
        book.setBuyCount(0);

        return book;
    }
}
