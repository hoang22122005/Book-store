package com.bookstore.services.impl;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.bookstore.exception.BadRequestException;
import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * Upload ảnh avatar lên Cloudinary.
     * Tự động resize về 300x300, crop theo khuôn mặt.
     *
     * @param file ảnh được gửi từ client (multipart/form-data)
     * @return secure_url của ảnh sau khi upload
     */
    @SuppressWarnings("unchecked")
    public String uploadAvatar(MultipartFile file) {
        validateImageFile(file);

        try {
            Map<String, Object> result = (Map<String, Object>) cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "bookstore/avatars",
                            "resource_type", "image",
                            "transformation", new Transformation<>()
                                    .width(300).height(300)
                                    .crop("fill")
                                    .gravity("face")
                    )
            );
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Không thể upload ảnh lên Cloudinary", e);
        }
    }

    /**
     * Xóa ảnh cũ trên Cloudinary theo URL.
     * Không throw exception nếu xóa thất bại (tránh block luồng chính).
     *
     * @param imageUrl URL ảnh cần xóa
     */
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return;
        try {
            String publicId = extractPublicId(imageUrl);
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            log.warn("Không thể xóa ảnh cũ trên Cloudinary: {}", imageUrl, e);
        }
    }

    // ---- private helpers ----

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File không được để trống");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Chỉ chấp nhận file ảnh (image/*)");
        }

        // Giới hạn 5 MB
        long maxSize = 5L * 1024 * 1024;
        if (file.getSize() > maxSize) {
            throw new BadRequestException("Kích thước file không được vượt quá 5MB");
        }
    }

    /**
     * Trích xuất publicId từ Cloudinary URL.
     * Ví dụ URL: https://res.cloudinary.com/demo/image/upload/v123456/bookstore/avatars/abc.jpg
     * → publicId: bookstore/avatars/abc
     */
    private String extractPublicId(String url) {
        String[] parts = url.split("/upload/");
        if (parts.length < 2) return url;

        String afterUpload = parts[1];
        // Bỏ version prefix (vXXXXXX/)
        String withoutVersion = afterUpload.replaceFirst("v\\d+/", "");
        // Bỏ phần extension (.jpg, .png, ...)
        return withoutVersion.replaceAll("\\.[^./]+$", "");
    }
}
