import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-on-primary-container border-t border-primary-container mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3">
            <Link to="/" className="font-extrabold text-2xl text-on-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-3xl text-secondary-container">menu_book</span>
              <span>BookStore</span>
            </Link>
            <p className="text-xs text-on-primary-container leading-relaxed">
              Nền tảng mua sắm sách trực tuyến hàng đầu Việt Nam. Nơi lan tỏa tri thức và nguồn cảm hứng sáng tạo.
            </p>
          </div>

          {/* Nav links */}
          <div>
            <h4 className="text-xs font-bold text-on-primary uppercase tracking-wider mb-3">
              Khám Phá
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#" className="hover:text-secondary-container transition-colors">Sách Bán Chạy</a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary-container transition-colors">Sách Mới Phát Hành</a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary-container transition-colors">Mã Giảm Giá & Voucher</a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold text-on-primary uppercase tracking-wider mb-3">
              Hỗ Trợ
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#" className="hover:text-secondary-container transition-colors">Chính Sách Đổi Trả</a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary-container transition-colors">Chính Sách Giao Hàng</a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary-container transition-colors">Thanh Toán VNPay</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold text-on-primary uppercase tracking-wider mb-3">
              Liên Hệ
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-secondary-container">location_on</span>
                <span>Hà Nội, Việt Nam</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-secondary-container">call</span>
                <span>1900 6789</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-secondary-container">mail</span>
                <span>support@bookstore.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-container mt-10 pt-6 text-center text-xs text-on-primary-container flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Vietnamese Online Bookstore Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Thiết kế dựa trên Stitch UI System</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
