package com.bookstore.services;

import java.util.List;

import com.bookstore.models.Cart;
import com.bookstore.models.CartDetail;
import com.bookstore.models.CartDetailId;

public interface CartService {
    Cart getCart(int userId);
    Cart createCart(int userId);
    List<CartDetail> getCartDetails(int cartId);
    void deleteCartDetail(CartDetailId cartDetailId);
    void addCartDetail(CartDetailId cartDetailId, int userId);
    void increaseQuatityCartDetail(CartDetailId cartDetailId);
    void decreaseQuatityCartDetail(CartDetailId cartDetailId);
    void removeBookFromAllCarts(int bookId);
}
