package com.bookstore.models;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.bookstore.models.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Builder
@Entity
@Table(name = "\"user\"")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    @Column(name = "user_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int userId;

    private String name;
    private String email;

    //@Enumerated(EnumType.STRING)
    private String role;

    private String address;
    private LocalDate dob;
    private String phone;
    private String gender;
    private String career;

    @Column(name = "created_at")
    @CreationTimestamp
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
