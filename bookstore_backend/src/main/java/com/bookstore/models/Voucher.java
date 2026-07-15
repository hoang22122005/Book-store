package com.bookstore.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Voucher {
    @Id
    @Column(name = "voucher_id", nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int voucherId;

    @Column(name = "discount_percent")
    private float discount;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    private String code;

    @Column(name = "scope")
    private String scope;
}
