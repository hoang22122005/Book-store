package com.bookstore.services;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.bookstore.exception.ConflictException;
import com.bookstore.exception.NotFoundException;
import com.bookstore.models.BillDetail;
import com.bookstore.models.CartDetail;
import com.bookstore.repository.BookRepo;
import com.bookstore.repository.InventoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InventoryService {
    private final InventoryRepository inventoryRepository;
    private final BookRepo bookRepository;

    public void ensureAvailable(int bookId, int requestedQuantity) {
        Integer available = inventoryRepository.findAvailableQuantity(bookId);
        if (available == null) {
            throw new NotFoundException("Khong tim thay ton kho cua sach " + bookId);
        }
        if (requestedQuantity > available) {
            throw new ConflictException(
                    "Sach " + bookId + " chi con " + available + " san pham co the mua");
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
                        throw new ConflictException(
                                "Sach " + detail.getBook().getBookId() + " khong du ton kho");
                    }
                });
    }

    public void deductReservations(List<BillDetail> billDetails) {
        ordered(billDetails).forEach(detail -> {
            int bookId = detail.getBook().getBookId();
            requireUpdated(
                    inventoryRepository.deductReservation(bookId, detail.getQuantity()),
                    bookId,
                    "Khong the tru ton kho da giu cho sach ");
            requireUpdated(
                    bookRepository.deductStock(bookId, detail.getQuantity()),
                    bookId,
                    "Khong the dong bo ton kho sach ");
        });
    }

    public void releaseReservations(List<BillDetail> billDetails) {
        ordered(billDetails).forEach(detail -> requireUpdated(
                inventoryRepository.releaseReservation(
                        detail.getBook().getBookId(),
                        detail.getQuantity()),
                detail.getBook().getBookId(),
                "Khong the giai phong ton kho cho sach "));
    }

    public void restock(List<BillDetail> billDetails) {
        ordered(billDetails).forEach(detail -> {
            int bookId = detail.getBook().getBookId();
            requireUpdated(
                    inventoryRepository.restock(bookId, detail.getQuantity()),
                    bookId,
                    "Khong the hoan kho cho sach ");
            requireUpdated(
                    bookRepository.increaseStock(bookId, detail.getQuantity()),
                    bookId,
                    "Khong the dong bo ton kho sach ");
        });
    }

    private List<BillDetail> ordered(List<BillDetail> billDetails) {
        return billDetails.stream()
                .sorted(Comparator.comparingInt(detail -> detail.getBook().getBookId()))
                .toList();
    }

    private void requireUpdated(int updated, int bookId, String message) {
        if (updated != 1) {
            throw new ConflictException(message + bookId);
        }
    }
}
