package com.bookstore.services.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.dto.discount.ActiveBookDiscount;
import com.bookstore.exception.ConflictException;
import com.bookstore.exception.NotFoundException;
import com.bookstore.models.Book;
import com.bookstore.models.Cart;
import com.bookstore.models.CartDetail;
import com.bookstore.models.CartDetailId;
import com.bookstore.models.User;
import com.bookstore.repository.CartDetailRepo;
import com.bookstore.repository.CartRepo;
import com.bookstore.repository.BookRepo;
import com.bookstore.repository.UserRepository;
import com.bookstore.services.CartService;
import com.bookstore.services.DiscountPricingService;
import com.bookstore.services.InventoryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private final CartRepo cartRepo;
    private final CartDetailRepo cartDetailRepo;
    private final UserRepository userRepository;
    private final BookRepo bookRepo;
    private final InventoryService inventoryService;
    private final DiscountPricingService discountPricingService;

    @Override
    @Transactional
    public Cart getCart(int userId) {
        Cart cart = cartRepo.findByUser_UserId(userId).orElseGet(() -> createCart(userId));
        recalculateCartTotal(cart);
        return cart;
    }

    @Override
    public Cart createCart(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));

        Cart cart = new Cart();
        cart.setUser(user);
        cart.setTotalAmount(new BigDecimal("0"));
        cart.setCreatedAt(LocalDateTime.now());

        return cartRepo.saveAndFlush(cart);
    }

    @Override
    public List<CartDetail> getCartDetails(int cartId) {
        return cartDetailRepo.findAllCartDetails(cartId);
    }

    @Override
    @Transactional
    public void deleteCartDetail(CartDetailId cartDetailId) {
        Book book = bookRepo.findByBookIdAndIsDeletedFalse(cartDetailId.getBookId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm"));
        CartDetail cartDetail = cartDetailRepo.findById(cartDetailId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm trong giỏ hàng"));

        cartDetailRepo.deleteById(cartDetailId);
        cartDetailRepo.flush();
        recalculateCartTotal(cartDetailId.getCartId());
    }

    @Override
    @Transactional
    public void addCartDetail(CartDetailId cartDetailId, int userId) {
        Book book = bookRepo.findByBookIdAndIsDeletedFalse(cartDetailId.getBookId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm"));

        if (cartDetailId.getCartId() == 0)
            createCart(userId);

        CartDetail currentDetail = cartDetailRepo.findById(cartDetailId).orElse(null);
        int requestedQuantity = currentDetail == null ? 1 : currentDetail.getQuantity() + 1;
        inventoryService.ensureAvailable(cartDetailId.getBookId(), requestedQuantity);

        if (currentDetail == null)
            cartDetailRepo.addCartDetail(cartDetailId.getCartId(), cartDetailId.getBookId(), 1, LocalDateTime.now());
        else
            cartDetailRepo.increaseQuatityCartDetail(cartDetailId.getCartId(), cartDetailId.getBookId());

        recalculateCartTotal(cartDetailId.getCartId());
    }

    @Override
    @Transactional
    public void increaseQuatityCartDetail(CartDetailId cartDetailId) {
        Book book = bookRepo.findByBookIdAndIsDeletedFalse(cartDetailId.getBookId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm"));

        CartDetail cartDetail = cartDetailRepo.findById(cartDetailId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay san pham trong gio hang"));
        inventoryService.ensureAvailable(
                cartDetailId.getBookId(),
                cartDetail.getQuantity() + 1);

        cartDetailRepo.increaseQuatityCartDetail(cartDetailId.getCartId(), cartDetailId.getBookId());

        recalculateCartTotal(cartDetailId.getCartId());
    }

    @Override
    @Transactional
    public void decreaseQuatityCartDetail(CartDetailId cartDetailId) {
        Book book = bookRepo.findById(cartDetailId.getBookId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm"));

        CartDetail cartDetail = cartDetailRepo.findById(cartDetailId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm trong giỏ hàng"));

        if (cartDetail.getQuantity() == 1) {
            throw new ConflictException("Khong the giam tiep so luong san pham");
        }

        cartDetailRepo.decreaseQuatityCartDetail(cartDetailId.getCartId(), cartDetailId.getBookId());

        recalculateCartTotal(cartDetailId.getCartId());
    }

    private void recalculateCartTotal(int cartId) {
        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay gio hang"));
        recalculateCartTotal(cart);
    }

    private void recalculateCartTotal(Cart cart) {
        List<CartDetail> details = cartDetailRepo.findAllCartDetails(cart.getCartId());
        Map<Integer, ActiveBookDiscount> discounts = discountPricingService.getActiveDiscounts(
                details.stream().map(detail -> detail.getBook().getBookId()).toList());
        BigDecimal total = details.stream()
                .map(detail -> discountPricingService.calculateFinalPrice(
                                detail.getBook().getPrice(),
                                discounts.get(detail.getBook().getBookId()))
                        .multiply(BigDecimal.valueOf(detail.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        cart.setTotalAmount(total);
        cartRepo.save(cart);
    }
}
