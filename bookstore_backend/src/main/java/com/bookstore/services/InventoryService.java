package com.bookstore.services;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.bookstore.exception.ConflictException;
import com.bookstore.exception.NotFoundException;
import com.bookstore.models.BillDetail;
import com.bookstore.models.Book;
import com.bookstore.models.CartDetail;
import com.bookstore.repository.BookRepo;
import com.bookstore.repository.InventoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final InventoryRepository inventoryRepository;
    private final BookRepo bookRepository;

    private String getBookDisplayName(int bookId, Book book) {
        if (book != null && book.getName() != null && !book.getName().isBlank()) {
            return book.getName();
        }
        return bookRepository.findById(bookId)
                .map(Book::getName)
                .filter(name -> name != null && !name.isBlank())
                .orElse("ID: " + bookId);
    }

    public void ensureAvailable(int bookId, int requestedQuantity) {
        Integer available = inventoryRepository.findAvailableQuantity(bookId);
        String bookName = getBookDisplayName(bookId, null);
        if (available == null) {
            throw new NotFoundException("Không tìm thấy tồn kho của sách \"" + bookName + "\"");
        }
        if (requestedQuantity > available) {
            throw new ConflictException(
                    "Sách \"" + bookName + "\" chỉ còn " + available + " sản phẩm có thể mua");
        }
    }

    public void reserveCartDetails(List<CartDetail> cartDetails) {
        cartDetails.stream()
                .sorted(Comparator.comparingInt(detail -> detail.getBook().getBookId()))
                .forEach(detail -> {
                    int updated = inventoryRepository.reserve(
                            detail.getBook().getBookId(),
                            detail.getQuantity());
                    if (updated != 1) {
                        String bookName = getBookDisplayName(detail.getBook().getBookId(), detail.getBook());
                        throw new ConflictException(
                                "Sách \"" + bookName + "\" không đủ tồn kho");
                    }
                });
    }

    public void deductReservations(List<BillDetail> billDetails) {
        ordered(billDetails).forEach(detail -> {
            int bookId = detail.getBook().getBookId();
            requireUpdated(
                    inventoryRepository.deductReservation(bookId, detail.getQuantity()),
                    bookId,
                    detail.getBook(),
                    "Không thể trừ tồn kho đã giữ cho sách ");
            requireUpdated(
                    bookRepository.deductStock(bookId, detail.getQuantity()),
                    bookId,
                    detail.getBook(),
                    "Không thể đồng bộ tồn kho sách ");
            requireUpdated(
                    bookRepository.increaseBuyCount(bookId, detail.getQuantity()),
                    bookId,
                    detail.getBook(),
                    "Không thể cập nhật lượt mua cho sách ");
        });
    }

    public void releaseReservations(List<BillDetail> billDetails) {
        ordered(billDetails).forEach(detail -> requireUpdated(
                inventoryRepository.releaseReservation(
                        detail.getBook().getBookId(),
                        detail.getQuantity()),
                detail.getBook().getBookId(),
                detail.getBook(),
                "Không thể giải phóng tồn kho cho sách "));
    }

    public void restock(List<BillDetail> billDetails) {
        ordered(billDetails).forEach(detail -> {
            int bookId = detail.getBook().getBookId();
            requireUpdated(
                    inventoryRepository.restock(bookId, detail.getQuantity()),
                    bookId,
                    detail.getBook(),
                    "Không thể hoàn kho cho sách ");
            requireUpdated(
                    bookRepository.increaseStock(bookId, detail.getQuantity()),
                    bookId,
                    detail.getBook(),
                    "Không thể đồng bộ tồn kho sách ");
            requireUpdated(
                    bookRepository.decreaseBuyCount(bookId, detail.getQuantity()),
                    bookId,
                    detail.getBook(),
                    "Không thể cập nhật lượt mua cho sách ");
        });
    }

    private List<BillDetail> ordered(List<BillDetail> billDetails) {
        return billDetails.stream()
                .sorted(Comparator.comparingInt(detail -> detail.getBook().getBookId()))
                .toList();
    }

    private void requireUpdated(int updated, int bookId, Book book, String message) {
        if (updated != 1) {
            String bookName = getBookDisplayName(bookId, book);
            throw new ConflictException(message + "\"" + bookName + "\"");
        }
    }
}
