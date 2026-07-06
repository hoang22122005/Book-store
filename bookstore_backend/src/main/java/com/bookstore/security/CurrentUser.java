package com.bookstore.security;

import com.bookstore.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUser {
    public int getUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getDetails() instanceof Integer userId)) {
            throw new UnauthorizedException("Ban can dang nhap de thuc hien chuc nang nay");
        }

        return userId;
    }
}
