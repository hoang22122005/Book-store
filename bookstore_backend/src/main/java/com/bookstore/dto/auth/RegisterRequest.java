package com.bookstore.dto.auth;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank
    private String name;

    @NotBlank (message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank (message="Password must be not blank")
    @Size(min=6, message = "Password must be at least 6 characters")
    private String password;

    @NotNull(message = "Date of birth must not be null")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dob;

    @NotBlank(message = "Address must not be blank")
    private String address;

    private String phone;

    private String gender;

    private String career;
    
}
