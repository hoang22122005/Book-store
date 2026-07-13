package com.bookstore.services;

import com.bookstore.models.RefreshToken;
import com.bookstore.models.User;


public interface RefreshTokenService {

    String createRefreshToken(User user);

    RefreshToken validateAndGet(String rawToken);

    void revoke(RefreshToken entity);

    String rotate(RefreshToken oldToken);
}
    

