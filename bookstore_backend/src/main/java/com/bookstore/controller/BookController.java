package com.bookstore.controller;

import java.io.IOException;
import java.util.List;

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

import com.bookstore.models.Book;
import com.bookstore.services.BookService;

@RestController
@RequestMapping("/api")
public class BookController {
    private BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping("/public/books")
    public ResponseEntity<List<Book>> getAllBooks() {
        return new ResponseEntity<>(bookService.getAllBooks(), HttpStatus.OK);
    }

    @PostMapping("/book")
    public ResponseEntity<?> addBook(@RequestParam Book book, @RequestParam MultipartFile imgFile) throws IOException {
        Book result = bookService.addBook(book, imgFile);
        if (result != null)
            return new ResponseEntity<>(result, HttpStatus.OK);
        return new ResponseEntity<>("Error in add book", HttpStatus.BAD_REQUEST);
    }

    @PutMapping("/book/{bookId}")
    public ResponseEntity<?> updateBook(@RequestParam Book book, @PathVariable int bookId,
            @RequestParam MultipartFile imgFile) throws IOException {
        if (book.getBookId() != bookId)
            return new ResponseEntity<>("invalid book id", HttpStatus.BAD_REQUEST);

        Book result = bookService.updateBook(book, imgFile);
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
