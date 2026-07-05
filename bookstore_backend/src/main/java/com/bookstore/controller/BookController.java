package com.bookstore.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.services.BookService;

@RestController
@RequestMapping("/api")
public class BookController {
    private BookService bookService;
    
    public BookController(BookService bookService) {
        this.bookService = bookService;
    }
}
