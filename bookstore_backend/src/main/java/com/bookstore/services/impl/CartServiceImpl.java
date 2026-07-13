package com.bookstore.services.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private final CartRepo cartRepo;
    private final CartDetailRepo cartDetailRepo;
    private final UserRepository userRepository;
    private final BookRepo bookRepo;

    @Override
    public Cart getCart(int userId) {
        return cartRepo.findByUser_UserId(userId).orElseGet(() -> createCart(userId));
    }

    @Override
    public Cart createCart(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay nguoi dung"));

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
        Book book = bookRepo.findById(cartDetailId.getBookId())
            .orElseThrow(() -> new NotFoundException("Khong tim thay san pham"));
        CartDetail cartDetail = cartDetailRepo.findById(cartDetailId)
            .orElseThrow(() -> new NotFoundException("Khong tim thay san pham trong gio hang"));

        BigDecimal updateTotal = book.getPrice().multiply(BigDecimal.valueOf(cartDetail.getQuantity()));
        cartRepo.updateTotalAmount(updateTotal.negate(), cartDetailId.getCartId());
        cartDetailRepo.deleteById(cartDetailId);
    }

    @Override
    @Transactional
    public void addCartDetail(CartDetailId cartDetailId, int userId) {
        Book book = bookRepo.findById(cartDetailId.getBookId())
            .orElseThrow(() -> new NotFoundException("Khong tim thay san pham"));

        if (cartDetailId.getCartId() == 0) createCart(userId);

        cartDetailRepo.addCartDetail(cartDetailId.getCartId(), cartDetailId.getBookId(), 1, LocalDateTime.now());

        cartRepo.updateTotalAmount(book.getPrice(), cartDetailId.getCartId());
    }

    @Override
    @Transactional
    public void increaseQuatityCartDetail(CartDetailId cartDetailId) {
        Book book = bookRepo.findById(cartDetailId.getBookId())
            .orElseThrow(() -> new NotFoundException("Khong tim thay san pham"));

        cartDetailRepo.increaseQuatityCartDetail(cartDetailId.getCartId(), cartDetailId.getBookId());

        cartRepo.updateTotalAmount(book.getPrice(), cartDetailId.getCartId());
    }

    @Override
    @Transactional
    public void decreaseQuatityCartDetail(CartDetailId cartDetailId) {
        Book book = bookRepo.findById(cartDetailId.getBookId())
            .orElseThrow(() -> new NotFoundException("Khong tim thay san pham"));

        CartDetail cartDetail = cartDetailRepo.findById(cartDetailId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay san pham trong gio hang"));

        if (cartDetail.getQuantity() == 1) {
            throw new ConflictException("Khong the giam tiep so luong san pham");
        }

        cartDetailRepo.decreaseQuatityCartDetail(cartDetailId.getCartId(), cartDetailId.getBookId());

        cartRepo.updateTotalAmount(book.getPrice().negate(), cartDetailId.getCartId());
    }

}
