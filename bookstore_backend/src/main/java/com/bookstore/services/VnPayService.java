package com.bookstore.services;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Service;

import com.bookstore.config.VnPayProperties;
import com.bookstore.exception.BadRequestException;
import com.bookstore.models.Payment;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VnPayService {
    private static final String VERSION = "2.1.0";
    private static final String COMMAND = "pay";
    private static final String CURRENCY = "VND";
    private static final String LOCALE = "vn";
    private static final String BOOK_ORDER_TYPE = "150000";
    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter VNPAY_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final VnPayProperties properties;

    public String createPaymentUrl(Payment payment, String clientIp) {
        requireConfigured();

        Map<String, String> parameters = new TreeMap<>();
        parameters.put("vnp_Version", VERSION);
        parameters.put("vnp_Command", COMMAND);
        parameters.put("vnp_TmnCode", properties.getTmnCode().trim());
        parameters.put("vnp_Amount", toVnPayAmount(payment.getAmount()));
        parameters.put("vnp_CurrCode", CURRENCY);
        parameters.put("vnp_TxnRef", payment.getTxnRef());
        parameters.put("vnp_OrderInfo", payment.getOrderInfo());
        parameters.put("vnp_OrderType", BOOK_ORDER_TYPE);
        parameters.put("vnp_Locale", LOCALE);
        parameters.put("vnp_ReturnUrl", properties.getReturnUrl().trim());
        parameters.put("vnp_IpAddr", clientIp);
        parameters.put("vnp_CreateDate", formatDate(payment.getVnpCreateDate()));
        parameters.put("vnp_ExpireDate", formatDate(payment.getExpiresAt()));

        if (payment.getBankCode() != null && !payment.getBankCode().isBlank()) {
            parameters.put("vnp_BankCode", payment.getBankCode().trim().toUpperCase());
        }
        // encode the parameters to query string
        String query = buildQuery(parameters);
        // hash the query string using hmac-sha512 and secret key
        String secureHash = hmacSha512(query);

        return properties.getPaymentUrl().trim() + "?" + query + "&vnp_SecureHash=" + secureHash;
    }

    // validate the signature by mean of hmacSha512 algorithm f
    public boolean isValidSignature(Map<String, String> callbackParameters) {
        String receivedHash = callbackParameters.get("vnp_SecureHash");
        if (receivedHash == null || receivedHash.isBlank() || isBlank(properties.getHashSecret())) {
            return false;
        }

        Map<String, String> signedParameters = callbackParameters.entrySet().stream()
                .filter(entry -> entry.getKey().startsWith("vnp_"))
                .filter(entry -> !entry.getKey().equals("vnp_SecureHash"))
                .filter(entry -> !entry.getKey().equals("vnp_SecureHashType"))
                .filter(entry -> entry.getValue() != null && !entry.getValue().isEmpty())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (first, ignored) -> first,
                        TreeMap::new));

        String calculatedHash = hmacSha512(buildQuery(signedParameters));
        return MessageDigest.isEqual(
                calculatedHash.getBytes(StandardCharsets.US_ASCII),
                receivedHash.toLowerCase().getBytes(StandardCharsets.US_ASCII));
    }

    public int getExpireMinutes() {
        return properties.getExpireMinutes();
    }

    public String getTmnCode() {
        return properties.getTmnCode();
    }

    public String toVnPayAmount(BigDecimal amount) {
        try {
            return amount.multiply(BigDecimal.valueOf(100)).toBigIntegerExact().toString();
        } catch (ArithmeticException ex) {
            throw new BadRequestException("So tien thanh toan phai la so VND nguyen");
        }
    }

    public OffsetDateTime parseVnPayDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return java.time.LocalDateTime.parse(value, VNPAY_DATE_FORMAT)
                    .atZone(VIETNAM_ZONE)
                    .toOffsetDateTime();
        } catch (java.time.DateTimeException ex) {
            return null;
        }
    }

    private String formatDate(OffsetDateTime value) {
        if (value == null) {
            throw new BadRequestException("Thoi gian giao dich VNPAY khong hop le");
        }
        return value.atZoneSameInstant(VIETNAM_ZONE).format(VNPAY_DATE_FORMAT);
    }

    private String buildQuery(Map<String, String> parameters) {
        return parameters.entrySet().stream()
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.US_ASCII);
    }

    private String hmacSha512(String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            hmac.init(new SecretKeySpec(
                    properties.getHashSecret().trim().getBytes(StandardCharsets.UTF_8),
                    "HmacSHA512"));
            return java.util.HexFormat.of().formatHex(
                    hmac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException | InvalidKeyException ex) {
            throw new IllegalStateException("Khong the tao chu ky VNPAY", ex);
        }
    }

    private void requireConfigured() {
        if (isBlank(properties.getTmnCode())
                || isBlank(properties.getHashSecret())
                || isBlank(properties.getPaymentUrl())
                || isBlank(properties.getReturnUrl())) {
            throw new BadRequestException("Chua cau hinh day du VNPAY Sandbox");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
