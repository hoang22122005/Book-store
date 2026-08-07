import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant w-full py-stack-lg px-4 md:px-margin-desktop mt-stack-lg">
      <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-4 gap-gutter mb-stack-lg">
        <div className="col-span-1">
          <h2 className="font-headline-md text-headline-md text-primary mb-stack-sm font-bold">
            BookStore
          </h2>
          <p className="font-caption text-caption text-on-surface-variant mt-unit leading-relaxed">
            Khám phá tri thức, mở mang tâm hồn cùng hệ thống nhà sách hàng đầu Việt Nam.
          </p>
        </div>
        <div className="col-span-1">
          <h3 className="font-label-md text-label-md text-on-surface mb-stack-sm font-semibold">
            Về BookStore
          </h3>
          <ul className="space-y-stack-sm">
            <li>
              <Link
                to="/about"
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
              >
                Về chúng tôi
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
              >
                Liên hệ
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-span-1">
          <h3 className="font-label-md text-label-md text-on-surface mb-stack-sm font-semibold">
            Hỗ trợ khách hàng
          </h3>
          <ul className="space-y-stack-sm">
            <li>
              <Link
                to="/guide"
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
              >
                Hướng dẫn mua hàng
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
              >
                Điều khoản sử dụng
              </Link>
            </li>
            <li>
              <Link
                to="/privacy"
                className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
              >
                Chính sách bảo mật
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-span-1">
          <h3 className="font-label-md text-label-md text-on-surface mb-stack-sm font-semibold">
            Kết nối với chúng tôi
          </h3>
          <div className="flex gap-stack-sm">
            <a
              href="https://bookstore.vn"
              target="_blank"
              rel="noreferrer"
              aria-label="Website"
              className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">language</span>
            </a>
            <a
              href="mailto:support@bookstore.vn"
              aria-label="Email"
              className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">mail</span>
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-container-max mx-auto border-t border-surface-variant pt-stack-md text-center md:text-left">
        <p className="font-caption text-caption text-on-surface-variant">
          © 2026 BookStore. Bản quyền thuộc về Công ty Sách Việt Nam.
        </p>
      </div>
    </footer>
  );
};
