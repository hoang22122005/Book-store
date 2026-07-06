package com.bookstore.dto.auth;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
// trả về khi  login thành công
public class AuthResponse {
    private String accessToken;
    private String refreshToken;

}