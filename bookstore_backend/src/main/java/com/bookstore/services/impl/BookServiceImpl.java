package com.bookstore.services.impl;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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
import com.bookstore.exception.ConflictException;
import com.bookstore.exception.NotFoundException;
import com.bookstore.models.Book;
import com.bookstore.models.BookGenre;
import com.bookstore.models.Book_;
import com.bookstore.models.Genre;
import com.bookstore.repository.BookGenreRepo;
import com.bookstore.repository.BookRepo;
import com.bookstore.repository.GenreRepo;
import com.bookstore.services.BookService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookServiceImpl implements BookService {
    private static final int MAX_PAGE_SIZE = 50;
    private static final Sort DEFAULT_SORT = Sort.by(Sort.Direction.ASC, Book_.BOOK_ID);

    private final BookRepo bookRepo;
    private final BookGenreRepo bookGenreRepo;
    private final GenreRepo genreRepo;
    private final Cloudinary cloudinary;

    @Override
    public List<Book> getAllBooks() {
        return bookRepo.findByIsDeletedFalse();
    }

    @Override
    public Book getBookById(int bookId) {
        return bookRepo.findByBookIdAndIsDeletedFalse(bookId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sách"));
    }

    @Override
    public PageResponse<BookResponse> getBooks(String keyword, String author, Integer categoryId,
            BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        validatePriceRange(minPrice, maxPrice);

        String normalizedKeyword = normalize(keyword);
        String normalizedAuthor = normalize(author);
        Pageable safePageable = limitPageSize(pageable);

        Page<Book> bookPage = bookRepo.searchBooks(
                normalizedKeyword,
                normalizedAuthor,
                categoryId,
                minPrice,
                maxPrice,
                safePageable);
        Map<Integer, List<String>> genresByBookId = getGenresByBookId(bookPage.getContent());
        Page<BookResponse> responsePage = bookPage.map(book -> BookResponse.toBookResponse(
                book,
                genresByBookId.getOrDefault(book.getBookId(), List.of())));

        return PageResponse.toPageResponse(responsePage);
    }

    @Override
    public BookResponse getBookDetail(int bookId) {
        Book book = bookRepo.findByBookIdAndIsDeletedFalse(bookId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sách"));

        return BookResponse.toBookResponse(book, getGenreNames(book.getBookId()));
    }

    @Override
    @Transactional
    public void deleteBook(int bookId) {
        Book book = bookRepo.findByBookIdAndIsDeletedFalse(bookId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sách có ID: " + bookId));
        bookRepo.softDeleteBook(LocalDateTime.now(), book.getBookId());
    }

    @Override
    @Transactional
    public Book updateBook(int bookId, BookUpdateRequest bookUpdateRequest, MultipartFile imgFile) throws IOException {
        Book oldBook = bookRepo.findById(bookId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sách có ID: " + bookId));

        prepareUpdateBook(bookUpdateRequest, oldBook);

        if (imgFile != null && !imgFile.isEmpty()) {
            String oldPublicId = oldBook.getPublicId();
            cloudinary.uploader().destroy(oldPublicId, null);

            Map<?, ?> uploadResult = cloudinary.uploader().upload(imgFile.getBytes(), ObjectUtils.emptyMap());
            String secureUrl = uploadResult.get("secure_url").toString();
            String publicId = uploadResult.get("public_id").toString();

            oldBook.setUrlImg(secureUrl);
            oldBook.setPublicId(publicId);
        } else
            throw new BadRequestException("Vui lòng tải lên ảnh của sách");

        return bookRepo.updateBook(oldBook.getName(), oldBook.getAuthor(), oldBook.getDescription(), oldBook.getPrice(),
                oldBook.getQuantityInStock(), oldBook.isVip(), oldBook.isDeleted(), oldBook.getDeletedAt(),
                oldBook.getPageCount(), oldBook.getBookId());
    }

    @Override
    @Transactional
    public Book addBook(BookAddRequest bookAddRequest, MultipartFile imgFile) throws IOException {
        if (imgFile == null || imgFile.isEmpty())
            throw new BadRequestException("Vui lòng tải lên ảnh của sách");

        Book book = prepareAddBook(bookAddRequest);

        Map<?, ?> uploadResult = cloudinary.uploader().upload(imgFile.getBytes(), ObjectUtils.emptyMap());
        String secureUrl = uploadResult.get("secure_url").toString();
        String publicId = uploadResult.get("public_id").toString();

        book.setUrlImg(secureUrl);
        book.setPublicId(publicId);

        bookRepo.save(book);

        checkGenre(bookAddRequest, book);

        return book;
    }

    private void validatePriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        if (minPrice == null || maxPrice == null) {
            return;
        }

        if (minPrice.compareTo(maxPrice) > 0) {
            throw new BadRequestException("Giá nhỏ nhất phải nhỏ hơn hoặc bằng giá lớn nhất");
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

    private void prepareUpdateBook(BookUpdateRequest bookUpdateRequest, Book oldBook) {
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

    private Book prepareAddBook(BookAddRequest bookAddRequest) {
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

    private void checkGenre(BookAddRequest bookAddRequest, Book book) {
        Genre genre = genreRepo.findByName(bookAddRequest.getGenreName())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy thể loại tương ứng"));
        BookGenre bookGenre = new BookGenre();
        bookGenre.setBook(book);
        bookGenre.setGenre(genre);
        bookGenreRepo.save(bookGenre);
    }

    private Map<Integer, List<String>> getGenresByBookId(List<Book> books) {
        if (books.isEmpty()) {
            return Map.of();
        }

        List<Integer> bookIds = books.stream()
                .map(book -> Optional.ofNullable(book.getBookId())
                        .orElseThrow(() -> new ConflictException("Sách không tồn tại")))
                .toList();

        return bookGenreRepo.findWithGenreByBookIds(bookIds).stream()
                .collect(Collectors.groupingBy(
                        bookGenre -> bookGenre.getBook().getBookId(),
                        Collectors.mapping(bookGenre -> bookGenre.getGenre().getName(), Collectors.toList())));
    }

    private List<String> getGenreNames(int bookId) {
        return bookGenreRepo.findWithGenreByBookId(bookId).stream()
                .map(bookGenre -> bookGenre.getGenre().getName())
                .toList();
    }
}
