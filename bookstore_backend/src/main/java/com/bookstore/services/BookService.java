package com.bookstore.services;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.bookstore.models.Book;
import com.bookstore.repository.BookRepo;
import com.cloudinary.Cloudinary;

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

    public Book updateBook(Book book) throws IOException {
        Optional<Book> oldBook = bookRepo.findById(book.getBookId());

        if (oldBook.isPresent()) {
            if (!oldBook.get().getPublicId().equals(book.getPublicId())) {
                cloudinary.uploader().destroy(oldBook.get().getPublicId(), null);
            }
        }

        book.setCreatedAt(LocalDateTime.now());

        return bookRepo.save(book);
    }

    public Book addBook(Book book) {
        book.setCreatedAt(LocalDateTime.now());
        return bookRepo.save(book);
    }

}
