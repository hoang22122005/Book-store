package com.bookstore.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.common.response.ApiResponse;
import com.bookstore.dto.cart.CartDetailRequest;
import com.bookstore.models.Cart;
import com.bookstore.models.CartDetail;
import com.bookstore.models.CartDetailId;
import com.bookstore.services.impl.CartServiceImpl;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
public class CartController {
    private final CartServiceImpl cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<Cart>> getCart(Authentication authentication) {
        Cart cart = cartService.getCart((Integer) authentication.getDetails());
        return ResponseEntity.ok(ApiResponse.success("Get cart successfully", cart));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Cart>> createCart(Authentication authentication) {
        Cart cart = cartService.createCart((Integer) authentication.getDetails());
        return ResponseEntity.ok(ApiResponse.success("Create cart successfully", cart));
    }

    @GetMapping("/cartDetails")
    public ResponseEntity<ApiResponse<List<CartDetail>>> getCartDetails(Authentication authentication) {
        Cart cart = cartService.getCart((Integer) authentication.getDetails());
        List<CartDetail> cartDetails = cartService.getCartDetails(cart.getCartId());
        return ResponseEntity.ok(ApiResponse.success("Get cart details successfully", cartDetails));
    }

    @PostMapping("/cartDetails")
    public ResponseEntity<ApiResponse<Void>> addCartDetail(Authentication authentication,
            @RequestBody CartDetailRequest cartDetailRequest) {
        Cart cart = cartService.getCart((Integer) authentication.getDetails());

        if (cart == null)
            cartService.addCartDetail(new CartDetailId(0, cartDetailRequest.getBookId()),
                    (Integer) authentication.getDetails());
        else
            cartService.addCartDetail(new CartDetailId(cart.getCartId(), cartDetailRequest.getBookId()),
                    (Integer) authentication.getDetails());

        return ResponseEntity.ok(ApiResponse.success("Add cart detail successfully", null));
    }

    @PutMapping("/cartDetails/{bookId}/increase")
    public ResponseEntity<ApiResponse<Void>> increaseQuatityCartDetail(Authentication authentication,
            @PathVariable int bookId) {
        Cart cart = cartService.getCart((Integer) authentication.getDetails());
        cartService.increaseQuatityCartDetail(new CartDetailId(cart.getCartId(), bookId));
        return ResponseEntity.ok(ApiResponse.success("Increase quantity in cart detail successfully", null));
    }

    @PutMapping("/cartDetails/{bookId}/decrease")
    public ResponseEntity<ApiResponse<Void>> decreaseQuatityCartDetail(Authentication authentication,
            @PathVariable int bookId) {
        Cart cart = cartService.getCart((Integer) authentication.getDetails());
        cartService.decreaseQuatityCartDetail(new CartDetailId(cart.getCartId(), bookId));
        return ResponseEntity.ok(ApiResponse.success("Decrease quantity in cart detail successfully", null));
    }

    @DeleteMapping("/cartDetails/{bookId}")
    public ResponseEntity<ApiResponse<Void>> deleteCartDetail(Authentication authentication, @PathVariable int bookId) {
        Cart cart = cartService.getCart((Integer) authentication.getDetails());
        cartService.deleteCartDetail(new CartDetailId(cart.getCartId(), bookId));
        return ResponseEntity.ok(ApiResponse.success("Delete cart detail successfully", null));
    }
}
