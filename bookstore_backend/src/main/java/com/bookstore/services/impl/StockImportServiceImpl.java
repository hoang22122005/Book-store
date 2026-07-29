package com.bookstore.services.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.dto.stock.AddStockImportDetailRequest;
import com.bookstore.dto.stock.CreateStockImportRequest;
import com.bookstore.dto.stock.StockImportDetailResponse;
import com.bookstore.dto.stock.StockImportResponse;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.NotFoundException;
import com.bookstore.models.Book;
import com.bookstore.models.StockImport;
import com.bookstore.models.StockImportDetail;
import com.bookstore.models.User;
import com.bookstore.models.enums.StockImportStatus;
import com.bookstore.repository.BookRepo;
import com.bookstore.repository.InventoryRepository;
import com.bookstore.repository.StockImportRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.services.StockImportService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StockImportServiceImpl implements StockImportService {

    private final StockImportRepository stockImportRepo;
    private final InventoryRepository inventoryRepo;
    private final BookRepo bookRepo;
    private final UserRepository userRepo;

    @Override
    public StockImportResponse createDraft(int userId, CreateStockImportRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay nguoi dung"));

        StockImport stockImport = new StockImport();
        stockImport.setCreatedBy(user);
        stockImport.setStatus(StockImportStatus.DRAFT);
        stockImport.setNote(req.getNote());
        stockImport.setCreatedAt(LocalDateTime.now());

        if (req.getDetails() != null) {
            for (AddStockImportDetailRequest detailReq : req.getDetails()) {
                Book book = bookRepo.findById(detailReq.getBookId())
                        .orElseThrow(() -> new NotFoundException("Khong tim thay sach " + detailReq.getBookId()));

                StockImportDetail detail = new StockImportDetail();
                detail.setStockImport(stockImport);
                detail.setBook(book);
                detail.setQuantity(detailReq.getQuantity());
                stockImport.getDetails().add(detail);
            }
        }

        stockImportRepo.save(stockImport);
        return toResponse(stockImport);
    }

    @Override
    public StockImportResponse addDetail(Long importId, AddStockImportDetailRequest req) {
        StockImport stockImport = stockImportRepo.findById(importId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay phieu nhap"));

        if (stockImport.getStatus() != StockImportStatus.DRAFT) {
            throw new BadRequestException("Phieu da duoc xac nhan hoac da huy, khong the sua");
        }

        Book book = bookRepo.findById(req.getBookId())
                .orElseThrow(() -> new NotFoundException("Khong tim thay sach"));

        StockImportDetail detail = new StockImportDetail();
        detail.setStockImport(stockImport);
        detail.setBook(book);
        detail.setQuantity(req.getQuantity());
        stockImport.getDetails().add(detail);
        stockImportRepo.save(stockImport);

        return toResponse(stockImport);
    }

    // post xong xác nhận số lượng trong kho mới đc cộng 
    @Override
    @Transactional
    public StockImportResponse postImport(Long importId) {
        StockImport stockImport = stockImportRepo.findById(importId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay phieu nhap"));

        if (stockImport.getStatus() != StockImportStatus.DRAFT) {
            throw new BadRequestException("Phieu da duoc xac nhan hoac da huy");
        }
        if (stockImport.getDetails().isEmpty()) {
            throw new BadRequestException("Phieu chua co sach nao, khong the xac nhan");
        }

        for (StockImportDetail detail : stockImport.getDetails()) {
            int bookId = detail.getBook().getBookId();
            int quantity = detail.getQuantity();

            inventoryRepo.increaseStock(bookId, quantity);
            bookRepo.increaseStock(bookId, quantity);
        }

        stockImport.setStatus(StockImportStatus.POSTED);
        stockImport.setPostedAt(LocalDateTime.now());
        stockImportRepo.save(stockImport);

        return toResponse(stockImport);
    }

    @Override
    public StockImportResponse cancelImport(Long importId) {
        StockImport stockImport = stockImportRepo.findById(importId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay phieu nhap"));

        if (stockImport.getStatus() != StockImportStatus.DRAFT) {
            throw new BadRequestException("Chi co the huy phieu o trang thai DRAFT");
        }

        stockImport.setStatus(StockImportStatus.CANCELLED);
        stockImportRepo.save(stockImport);

        return toResponse(stockImport);
    }

    @Override
    public List<StockImportResponse> getAll() {
        return stockImportRepo.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public StockImportResponse getById(Long importId) {
        StockImport stockImport = stockImportRepo.findById(importId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay phieu nhap"));
        return toResponse(stockImport);
    }

    private StockImportResponse toResponse(StockImport stockImport) {
        List<StockImportDetailResponse> detailResponses = stockImport.getDetails().stream()
                .map(d -> StockImportDetailResponse.builder()
                        .importDetailId(d.getImportDetailId())
                        .bookId(d.getBook().getBookId())
                        .bookName(d.getBook().getName())
                        .quantity(d.getQuantity())
                        .build())
                .toList();

        return StockImportResponse.builder()
                .importId(stockImport.getImportId())
                .status(stockImport.getStatus().name())
                .note(stockImport.getNote())
                .createdByName(stockImport.getCreatedBy().getName())
                .createdAt(stockImport.getCreatedAt())
                .postedAt(stockImport.getPostedAt())
                .details(detailResponses)
                .build();
    }
}
