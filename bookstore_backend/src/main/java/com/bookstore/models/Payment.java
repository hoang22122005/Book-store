package com.bookstore.models;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import com.bookstore.models.enums.PaymentMethod;
import com.bookstore.models.enums.PaymentStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "payment")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long paymentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bill_id", nullable = false)
    private Bill bill;

    @Column(nullable = false, precision = 15, scale = 0)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    /**
     * Ma tham chieu giao dich do he thong sinh ra, duy nhat cho moi Payment.
     * Gui sang VNPAY la vnp_TxnRef va dung de tim lai Payment khi IPN callback.
     */
    @Column(name = "txn_ref", nullable = false, unique = true, length = 100)
    private String txnRef;

    /**
     * Ma giao dich do VNPAY cap va tra ve trong vnp_TransactionNo sau thanh toan.
     */
    @Column(name = "transaction_no", length = 15)
    private String transactionNo;

    /**
     * Ma ngan hang/kenh thanh toan. Co the duoc gui len VNPAY de chon san
     * (vnp_BankCode), sau callback se duoc cap nhat bang ma VNPAY tra ve vi du nhu
     * NCB, VPB.
     */
    @Column(name = "bank_code", length = 20)
    private String bankCode;

    /** Ma giao dich phia ngan hang, VNPAY tra ve trong vnp_BankTranNo. */
    @Column(name = "bank_transaction_no", length = 255)
    private String bankTransactionNo;

    /** Loai the/kenh thanh toan VNPAY tra ve, vi du ATM, VISA, MASTER. */
    @Column(name = "card_type", length = 20)
    private String cardType;

    /** Ma phan hoi VNPAY (vnp_ResponseCode); "00" la thanh cong. */
    @Column(name = "response_code", length = 2)
    private String responseCode;

    /** Trang thai giao dich VNPAY (vnp_TransactionStatus); "00" la thanh cong. */
    @Column(name = "transaction_status", length = 2)
    private String transactionStatus;

    /** Noi dung mo ta don hang gui sang VNPAY trong vnp_OrderInfo. */
    @Column(name = "order_info", nullable = false, length = 255)
    private String orderInfo;

    /** Thoi diem khoi tao giao dich gui sang VNPAY trong vnp_CreateDate. */
    @Column(name = "vnp_create_date", nullable = false)
    private OffsetDateTime vnpCreateDate;

    /**
     * Han thanh toan gui sang VNPAY trong vnp_ExpireDate; chi ap dung cho VNPAY.
     */
    @Column(name = "expires_at")
    private OffsetDateTime expiresAt;

    /** Thoi diem thanh toan do VNPAY tra ve trong vnp_PayDate. */
    @Column(name = "paid_at")
    private OffsetDateTime paidAt;

    /** Thoi diem tao ban ghi Payment trong he thong. */
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    /** Thoi diem cap nhat gan nhat cua Payment trong he thong. */
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
