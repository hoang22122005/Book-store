package com.bookstore.services.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;


    public void sendResetPasswordEmail(String toEmail, String resetLink) {

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
    }
}