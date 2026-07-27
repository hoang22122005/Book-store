package com.bookstore.services.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.dto.product.BookResponse;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.NotFoundException;
import com.bookstore.models.Book;
import com.bookstore.repository.BookRepo;
import com.bookstore.repository.InventoryRepository;
import com.bookstore.services.StockService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StockServiceImpl implements StockService {
    private final BookRepo bookRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional
    public BookResponse importStock(int bookId, int quantity) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sách với id: " + bookId));

        if (book.isDeleted()) {
            throw new BadRequestException("Sách đã bị xóa, không thể nhập kho");
        }

        if (inventoryRepository.increaseStock(bookId, quantity) != 1) {
            throw new NotFoundException("Khong tim thay ton kho cua sach: " + bookId);
        }
        book.setQuantityInStock(book.getQuantityInStock() + quantity);
        Book saved = bookRepository.save(book);

        return BookResponse.toBookResponse(saved);
    }


    

    
}
