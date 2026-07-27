package com.bookstore.services;

import com.bookstore.dto.auth.AuthResponse;
import com.bookstore.dto.auth.LoginRequest;
import com.bookstore.dto.auth.RegisterRequest;

public interface AuthService {
    public void register(RegisterRequest req);
    public AuthResponse login(LoginRequest req);
    public AuthResponse refreshToken(String refreshToken);
    public void logout(String refreshToken);
    public void verifyEmail(String token);
}
