import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils';

export const HomePage: React.FC = () => {
  const { user } = useAuth();

  const featuredBooks = [
    {
      id: 1,
      name: 'Đắc Nhân Tâm (Dale Carnegie)',
      author: 'Dale Carnegie',
      price: 98000,
      originalPrice: 120000,
      rating: 4.9,
      reviews: 1240,
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
      tag: 'Bán Chạy',
    },
    {
      id: 2,
      name: 'Nhà Giả Kim (Paulo Coelho)',
      author: 'Paulo Coelho',
      price: 79000,
      originalPrice: 99000,
      rating: 4.8,
      reviews: 980,
      coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
      tag: 'Khuyên Đọc',
    },
    {
      id: 3,
      name: 'Tư Duy Nhanh Và Chậm',
      author: 'Daniel Kahneman',
      price: 185000,
      originalPrice: 220000,
      rating: 4.7,
      reviews: 650,
      coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
      tag: 'Sách Mới',
    },
    {
      id: 4,
      name: 'Lược Sử Loài Người (Sapiens)',
      author: 'Yuval Noah Harari',
      price: 195000,
      originalPrice: 230000,
      rating: 5.0,
      reviews: 2100,
      coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
      tag: 'Nổi Bật',
    },
  ];

  return (
    <div className="space-y-10 py-2">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-2xl bg-primary text-on-primary p-8 sm:p-12 shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/20 border border-secondary-container/30 text-secondary-container text-xs font-bold">
            <span className="material-symbols-outlined text-sm">star</span>
            <span>BookStore.vn Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Nền tảng mua sắm sách trực tuyến hàng đầu Việt Nam
          </h1>

          <p className="text-on-primary-container text-sm sm:text-base leading-relaxed">
            Khám phá hàng ngàn đầu sách chính hãng phong phú, ưu đãi voucher hấp dẫn và trải nghiệm thanh toán VNPay tiện lợi.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/books"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary-container text-on-secondary-container font-bold text-sm hover:bg-secondary-fixed-dim transition-colors shadow-xs"
            >
              <span>Khám Phá Danh Mục Sách</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>

            {!user && (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-primary font-bold text-sm hover:bg-surface-container-low transition-colors"
              >
                <span>Đăng Nhập Ngay</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-surface-container-high pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-secondary">trending_up</span>
            <h2 className="text-xl font-bold text-primary">
              Sách Nổi Bật & Bán Chạy
            </h2>
          </div>
          <Link
            to="/books"
            className="text-xs font-bold text-secondary hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-surface-container-lowest rounded-xl border border-surface-container-high overflow-hidden book-card-shadow hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
            >
              <div className="relative aspect-3/4 overflow-hidden bg-surface-container-low">
                <img
                  src={book.coverUrl}
                  alt={book.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-secondary-container text-on-secondary-container font-bold text-[10px] uppercase rounded">
                  {book.tag}
                </span>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-on-surface-variant font-medium">{book.author}</p>
                  <h3 className="font-bold text-sm text-primary line-clamp-2 mt-0.5 hover:text-secondary transition-colors">
                    {book.name}
                  </h3>
                </div>

                <div className="space-y-2 pt-2 border-t border-surface-container-high">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-secondary text-sm">
                      {formatCurrency(book.price)}
                    </span>
                    <span className="text-[11px] text-outline line-through">
                      {formatCurrency(book.originalPrice)}
                    </span>
                  </div>

                  <button className="w-full py-2.5 px-3 bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed-dim text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                    <span className="material-symbols-outlined text-base">shopping_cart</span>
                    <span>Thêm Giỏ Hàng</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
