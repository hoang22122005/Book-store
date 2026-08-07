import React from 'react';

export const BenefitsSection: React.FC = () => {
  const benefits = [
    {
      icon: 'local_shipping',
      title: 'Giao hàng nhanh',
      subtitle: 'Miễn phí cho đơn từ 200k',
    },
    {
      icon: 'verified_user',
      title: 'Thanh toán an toàn',
      subtitle: 'Bảo mật thông tin tuyệt đối',
    },
    {
      icon: 'currency_exchange',
      title: 'Đổi trả 7 ngày',
      subtitle: 'Nếu có lỗi từ nhà sản xuất',
    },
    {
      icon: 'support_agent',
      title: 'Hỗ trợ 24/7',
      subtitle: 'Luôn sẵn sàng giải đáp',
    },
  ];

  return (
    <section className="w-full max-w-container-max mx-auto px-4 md:px-margin-desktop py-stack-lg border-t border-surface-variant mt-stack-lg">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-stack-lg">
        {benefits.map((b, idx) => (
          <div key={idx} className="flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-[40px] text-secondary mb-stack-sm">
              {b.icon}
            </span>
            <h3 className="font-label-md text-label-md text-on-surface mb-unit font-semibold">
              {b.title}
            </h3>
            <p className="font-caption text-caption text-on-surface-variant">{b.subtitle}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
