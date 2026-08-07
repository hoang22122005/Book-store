package com.bookstore.services;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.bookstore.models.BillDetail;
import com.bookstore.models.Book;
import com.bookstore.repository.BookRepo;
import com.bookstore.repository.InventoryRepository;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTests {
    @Mock
    private InventoryRepository inventoryRepository;
    @Mock
    private BookRepo bookRepository;

    @InjectMocks
    private InventoryService inventoryService;

    @Test
    void deductingAReservationIncreasesBuyCount() {
        BillDetail detail = billDetail(7, 3);
        when(inventoryRepository.deductReservation(7, 3)).thenReturn(1);
        when(bookRepository.deductStock(7, 3)).thenReturn(1);
        when(bookRepository.increaseBuyCount(7, 3)).thenReturn(1);

        inventoryService.deductReservations(List.of(detail));

        verify(bookRepository).increaseBuyCount(7, 3);
    }

    @Test
    void restockingAfterCancellationDecreasesBuyCount() {
        BillDetail detail = billDetail(7, 3);
        when(inventoryRepository.restock(7, 3)).thenReturn(1);
        when(bookRepository.increaseStock(7, 3)).thenReturn(1);
        when(bookRepository.decreaseBuyCount(7, 3)).thenReturn(1);

        inventoryService.restock(List.of(detail));

        verify(bookRepository).decreaseBuyCount(7, 3);
    }

    private BillDetail billDetail(int bookId, int quantity) {
        Book book = new Book();
        book.setBookId(bookId);
        BillDetail detail = new BillDetail();
        detail.setBook(book);
        detail.setQuantity(quantity);
        return detail;
    }
}
