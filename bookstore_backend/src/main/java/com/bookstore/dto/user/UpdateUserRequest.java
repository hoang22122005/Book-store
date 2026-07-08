package com.bookstore.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserRequest {
    
    private String name;
    private String phone;
    private String address;
    private String gender;
    private String career;
    private String urlAvt;
}
