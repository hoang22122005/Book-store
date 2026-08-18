package com.bookstore.services.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Async
    public void sendResetPasswordEmail(String toEmail, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Đặt lại mật khẩu - BookStore");

            String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                    <h2 style="color: #1e3a8a; text-align: center; margin-bottom: 20px;">BookStore - Đặt lại mật khẩu</h2>
                    <p style="color: #334155; font-size: 15px; line-height: 1.6;">Xin chào,</p>
                    <p style="color: #334155; font-size: 15px; line-height: 1.6;">Bạn vừa gửi yêu cầu đặt lại mật khẩu cho tài khoản BookStore. Vui lòng bấm vào nút bên dưới để tiến hành thiết lập mật khẩu mới (liên kết có hiệu lực trong vòng <strong>15 phút</strong>):</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s" target="_blank" style="background-color: #1e3a8a; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block; font-size: 15px;">Đặt lại mật khẩu ngay</a>
                    </div>
                    <p style="color: #64748b; font-size: 13px; line-height: 1.5;">Nếu nút trên không hoạt động, bạn hãy bấm trực tiếp hoặc dán liên kết sau vào trình duyệt:</p>
                    <p style="word-break: break-all;"><a href="%s" target="_blank" style="color: #2563eb; text-decoration: underline;">%s</a></p>
                    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
                    <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email để đảm bảo an toàn cho tài khoản của bạn.</p>
                </div>
                """.formatted(resetLink, resetLink, resetLink);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Reset password email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send reset password email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendVerificationEmail(String toEmail, String token) {
        try {
            String baseUrl = (frontendUrl != null ? frontendUrl : "http://localhost:5173").replaceAll("/+$", "");
            String verificationLink = baseUrl + "/activation?token=" + token;

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Xác minh email tài khoản - BookStore");

            String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                    <h2 style="color: #047857; text-align: center; margin-bottom: 20px;">Chào mừng bạn đến với BookStore!</h2>
                    <p style="color: #334155; font-size: 15px; line-height: 1.6;">Xin chào,</p>
                    <p style="color: #334155; font-size: 15px; line-height: 1.6;">Cảm ơn bạn đã đăng ký tài khoản tại BookStore. Vui lòng bấm vào nút bên dưới để xác minh địa chỉ email và kích hoạt tài khoản của bạn (liên kết có hiệu lực trong vòng <strong>30 phút</strong>):</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s" target="_blank" style="background-color: #047857; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block; font-size: 15px;">Kích hoạt tài khoản ngay</a>
                    </div>
                    <p style="color: #64748b; font-size: 13px; line-height: 1.5;">Nếu nút trên không hoạt động, bạn hãy bấm trực tiếp hoặc dán liên kết sau vào trình duyệt:</p>
                    <p style="word-break: break-all;"><a href="%s" target="_blank" style="color: #059669; text-decoration: underline;">%s</a></p>
                    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
                    <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email.</p>
                </div>
                """.formatted(verificationLink, verificationLink, verificationLink);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Verification email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", toEmail, e.getMessage());
        }
    }
}

