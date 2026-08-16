package com.bookstore.services.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url:https://frontend.sachhay.click}")
    private String frontendUrl;

    @Async
    public void sendResetPasswordEmail(String toEmail, String resetLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Đặt lại mật khẩu - BookStore");
            message.setText(
                "Xin chào,\n\n" +
                "Bạn vừa yêu cầu đặt lại mật khẩu. Vui lòng click vào link dưới đây (hết hạn sau 15 phút):\n\n" +
                resetLink + "\n\n" +
                "Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này."
            );
            mailSender.send(message);
            log.info("Reset password email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send reset password email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendVerificationEmail(String toEmail, String token) {
        try {
            String verificationLink = frontendUrl + "/activation?token=" + token;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Xác minh email của bạn - BookStore");
            message.setText(
                "Xin chào,\n\n" +
                "Bạn vừa đăng ký tài khoản tại BookStore. Vui lòng click vào link dưới đây để xác minh email (hết hạn sau 30 phút):\n\n" +
                verificationLink + "\n\n" +
                "Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này."
            );
            mailSender.send(message);
            log.info("Verification email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", toEmail, e.getMessage());
        }
    }
}
