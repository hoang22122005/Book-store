import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const HeroBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full max-w-container-max mx-auto px-4 md:px-margin-desktop py-stack-lg">
      <div className="relative w-full h-[450px] md:h-[550px] rounded-xl overflow-hidden shadow-[0_4px_6px_-1px_rgba(26,54,93,0.05),0_2px_4px_-1px_rgba(26,54,93,0.03)] flex items-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDz4yP0axuZtPYImEvqKTOrR3EBSizGF4-wsuIj1o6cFOgpTs9_gmdX2HZXIvY2vLmd5fv4ESkXhA09vhMDsL4C0CEjwJiedZhnDzj0KTvMj98cTA8iWeVrNgZgEll_SeXbcrNiQDdzhxthZC8_WqNghu701xzxjguo1wSK37775Wuj_bnnKHJCKQvMIhrU5mwSq9Ii1H0BDerEXdHVslA5eZ4jWC9iqeN3n7-hy2nrV5BjwnkYO6M')`,
          }}
        ></div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 p-8 md:p-12 max-w-2xl text-white space-y-4">
          <h1 className="font-headline-xl text-3xl md:text-headline-xl font-bold leading-tight text-white drop-shadow-sm">
            Khám phá thế giới sách dành cho bạn
          </h1>
          <p className="font-body-lg text-body-lg text-inverse-on-surface leading-relaxed opacity-90">
            Hàng ngàn tựa sách hấp dẫn từ các nhà xuất bản hàng đầu đang chờ bạn khám phá. Bắt đầu hành trình tri thức ngay hôm nay.
          </p>
          <div className="flex flex-wrap gap-stack-md pt-2">
            <Link
              to="/books"
              className="bg-secondary-container text-on-secondary-container font-label-md text-label-md px-6 py-3 rounded-DEFAULT hover:scale-[1.02] hover:shadow-md transition-all font-bold flex items-center justify-center"
            >
              Mua sách ngay
            </Link>
            <button
              onClick={() => navigate('/books?filter=new')}
              className="border-[1.5px] border-white text-white bg-transparent font-label-md text-label-md px-6 py-3 rounded-DEFAULT hover:bg-white/10 transition-colors cursor-pointer"
            >
              Xem sách mới
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
