package com.bookstore.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    @Column(name = "user_id")
    private int userId;

    private String name;
    private String email;
    private String role;
    private String address;
    private LocalDateTime dob;
    private String phone;
    private String gender;
    private String career;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "is_deleted")
    private boolean isDeleted;

    @Column(name = "password_hash")
    private String password;

    @Column(name = "url_avt")
    private String urlAvt;

    @Column(name = "is_vip")
    private boolean isVip;

    @Column(name = "vip_expiration")
    private LocalDateTime vipExpiration;
}
