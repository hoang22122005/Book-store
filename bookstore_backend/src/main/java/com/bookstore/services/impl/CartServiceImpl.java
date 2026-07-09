package com.bookstore.services.impl;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.bookstore.exception.ConflictException;
import com.bookstore.exception.NotFoundException;
import com.bookstore.models.Cart;
import com.bookstore.models.CartDetail;
import com.bookstore.models.CartDetailId;
import com.bookstore.models.User;
import com.bookstore.repository.CartDetailRepo;
import com.bookstore.repository.CartRepo;
import com.bookstore.repository.UserRepository;
import com.bookstore.services.CartService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private CartRepo cartRepo;
    private CartDetailRepo cartDetailRepo;
    private UserRepository userRepository;

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

        return cartRepo.save(cart);
    }

    @Override
    public List<CartDetail> getCartDetails(int cartId) {
        return cartDetailRepo.findAllCartDetails(cartId);
    }

    @Override
    public void deleteCartDetail(CartDetailId cartDetailId) {
        cartDetailRepo.deleteById(cartDetailId);
    }

    @Override
    public void addCartDetail(CartDetailId cartDetailId) {
        cartDetailRepo.addCartDetail(cartDetailId.getCartId(), cartDetailId.getBookId(), 1);
    }

    @Override
    public void increaseQuatityCartDetail(CartDetailId cartDetailId) {
        cartDetailRepo.increaseQuatityCartDetail(cartDetailId.getCartId(), cartDetailId.getBookId());
    }

    @Override
    public void decreaseQuatityCartDetail(CartDetailId cartDetailId) {
        CartDetail cartDetail = cartDetailRepo.findById(cartDetailId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay san pham trong gio hang"));

        if (cartDetail.getQuantity() == 1) {
            throw new ConflictException("Khong the giam tiep so luong san pham");
        }

        cartDetailRepo.decreaseQuatityCartDetail(cartDetailId.getCartId(), cartDetailId.getBookId());
    }
}
