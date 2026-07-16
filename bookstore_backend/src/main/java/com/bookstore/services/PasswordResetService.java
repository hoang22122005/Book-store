package com.bookstore.services;

public interface PasswordResetService {
    void forgotPassword(String email);
    void resetPassword(String rawToken, String newPassword);
}
