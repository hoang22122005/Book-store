package com.bookstore.services;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.bookstore.models.Book;
import com.bookstore.repository.BookRepo;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Service
public class BookService {
    private BookRepo bookRepo;
    private Cloudinary cloudinary;

    public BookService(BookRepo bookRepo, Cloudinary cloudinary) {
        this.bookRepo = bookRepo;
        this.cloudinary = cloudinary;
    }

    public List<Book> getAllBooks() {
        return bookRepo.findAll();
    }

    public void deleteBook(int bookId) {
        bookRepo.deleteById(bookId);
    }

    public Book getBookById(int bookId) {
        return bookRepo.findById(bookId).orElse(null);
    }

    public Book updateBook(Book book, MultipartFile imgFile) throws IOException {
        if (imgFile != null && !imgFile.isEmpty()) {
            Book oldBook = bookRepo.findById(book.getBookId()).orElse(null);
            if (oldBook == null) {
                System.out.println("invalid book id");
                return null;
            }

            String oldPublicId = oldBook.getPublicId();
            try {
                cloudinary.uploader().destroy(oldPublicId, null);
                Map<?, ?> uploadResult = cloudinary.uploader().upload(imgFile.getBytes(), ObjectUtils.emptyMap());
                String secureUrl = uploadResult.get("secure_url").toString();
                String publicId = uploadResult.get("public_id").toString();

                book.setUrlImg(secureUrl);
                book.setPublicId(publicId);
            } catch (Exception e) {
                e.printStackTrace();
                return null;
            }
        }

        book.setCreatedAt(LocalDateTime.now());

        return bookRepo.save(book);
    }

    public Book addBook(Book book, MultipartFile imgFile) throws IOException {
        Book existingBook = bookRepo.findById(book.getBookId()).orElse(null);
        if (existingBook == null) {
            System.out.println("invalid book id");
            return null;
        }

        book.setCreatedAt(LocalDateTime.now());

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(imgFile.getBytes(), ObjectUtils.emptyMap());
            String secureUrl = uploadResult.get("secure_url").toString();
            String publicId = uploadResult.get("public_id").toString();

            book.setUrlImg(secureUrl);
            book.setPublicId(publicId);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }

        return bookRepo.save(book);
    }

}
