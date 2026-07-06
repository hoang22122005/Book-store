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

import com.bookstore.common.response.BookResponse;
import com.bookstore.common.response.PageResponse;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ConflictException;
import com.bookstore.exception.NotFoundException;
import com.bookstore.models.Book;
import com.bookstore.repository.BookRepo;
import com.bookstore.services.BookService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookServiceImpl implements BookService {
    private static final int MAX_PAGE_SIZE = 50;
    private static final Sort DEFAULT_SORT = Sort.by(Sort.Direction.DESC, "bookId");

    private final BookRepo bookRepo;
    private final Cloudinary cloudinary;

    @Override
    public List<Book> getAllBooks() {
        return bookRepo.findByIsDeletedFalse();
    }

    @Override
    public Book getBookById(int bookId) {
        return bookRepo.findByBookIdAndIsDeletedFalse(bookId).orElse(null);
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
        bookRepo.softDeleteBook(book.getBookId());
    }

    @Override
    public BookResponse updateBook(int bookId, Book book, MultipartFile imgFile) throws IOException {
        if (bookId != book.getBookId())
            throw new ConflictException("ID sach khong dong bo voi api");

        Book oldBook = bookRepo.findById(book.getBookId())
                .orElseThrow(() -> new NotFoundException("Khong tim thay sach co ID: " + book.getBookId()));

        if (imgFile != null && !imgFile.isEmpty()) {
            String oldPublicId = oldBook.getPublicId();

            cloudinary.uploader().destroy(oldPublicId, null);
            Map<?, ?> uploadResult = cloudinary.uploader().upload(imgFile.getBytes(), ObjectUtils.emptyMap());
            String secureUrl = uploadResult.get("secure_url").toString();
            String publicId = uploadResult.get("public_id").toString();

            book.setUrlImg(secureUrl);
            book.setPublicId(publicId);
        } else {
            book.setUrlImg(oldBook.getUrlImg());
            book.setPublicId(oldBook.getPublicId());
        }

        book.setCreatedAt(LocalDateTime.now());

        return BookResponse.toBookResponse(bookRepo.save(book));
    }

    @Override
    public BookResponse addBook(Book book, MultipartFile imgFile) throws IOException {
        if (book.getBookId() != 0 && bookRepo.existsById(book.getBookId()))
            throw new ConflictException("da ton tai sach co ID: " + book.getBookId());

        book.setCreatedAt(LocalDateTime.now());

        Map<?, ?> uploadResult = cloudinary.uploader().upload(imgFile.getBytes(), ObjectUtils.emptyMap());
        String secureUrl = uploadResult.get("secure_url").toString();
        String publicId = uploadResult.get("public_id").toString();

        book.setUrlImg(secureUrl);
        book.setPublicId(publicId);

        return BookResponse.toBookResponse(bookRepo.save(book));
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

}
