package com.bookstore.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
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
import com.bookstore.dto.cart.CartRequest;
import com.bookstore.models.Cart;
import com.bookstore.models.CartDetail;
import com.bookstore.models.CartDetailId;
import com.bookstore.services.impl.CartServiceImpl;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CartController {
    private final CartServiceImpl cartService;

    @GetMapping("/carts/{userId}")
    public ResponseEntity<ApiResponse<Cart>> getCart(@PathVariable int userId) {
        Cart cart = cartService.getCart(userId);
        return ResponseEntity.ok(ApiResponse.success("Get cart successfull", cart));
    }

    @PostMapping("/carts")
    public ResponseEntity<ApiResponse<Cart>> createCart(@RequestBody CartRequest cartRequest) {
        Cart cart = cartService.createCart(cartRequest.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Create cart successfull", cart));
    }

    @GetMapping("/cartDetails/{cartId}")
    public ResponseEntity<ApiResponse<List<CartDetail>>> getCartDetails(@PathVariable int cartId) {
        List<CartDetail> cartDetails = cartService.getCartDetails(cartId);
        return ResponseEntity.ok(ApiResponse.success("Get cart details successfull", cartDetails));
    }

    @PostMapping("/cartDetails")
    public ResponseEntity<ApiResponse<Void>> addCartDetail(@RequestBody CartDetailRequest cartDetailRequest) {
        cartService.addCartDetail(new CartDetailId(cartDetailRequest.getBookId(), cartDetailRequest.getCartId()));
        return ResponseEntity.ok(ApiResponse.success("Add cart detail successfully", null));
    }

    @PutMapping("/cartDetails/{cartId}/{bookId}/increase")
    public ResponseEntity<ApiResponse<Void>> increaseQuatityCartDetail(@PathVariable int cartId, @PathVariable int bookId) {
        cartService.increaseQuatityCartDetail(new CartDetailId(cartId, bookId));
        return ResponseEntity.ok(ApiResponse.success("Increase quantity in cart detail successfully", null));
    }

    @PutMapping("/cartDetails/{cartId}/{bookId}/decrease")
    public ResponseEntity<ApiResponse<Void>> decreaseQuatityCartDetail(@PathVariable int cartId, @PathVariable int bookId) {
        cartService.decreaseQuatityCartDetail(new CartDetailId(cartId, bookId));
        return ResponseEntity.ok(ApiResponse.success("Decrease quantity in cart detail successfully", null));
    }

    @DeleteMapping("/cartDetails/{cartId}/{bookId}")
    public ResponseEntity<ApiResponse<Void>> deleteCartDetail(@PathVariable int cartId, @PathVariable int bookId) {
        cartService.deleteCartDetail(new CartDetailId(cartId, bookId));
        return ResponseEntity.ok(ApiResponse.success("Delete cart detail successfully", null));
    }
}
