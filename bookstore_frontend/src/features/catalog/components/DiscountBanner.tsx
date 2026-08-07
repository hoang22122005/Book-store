import React from 'react';
import { useNavigate } from 'react-router-dom';

export const DiscountBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full max-w-container-max mx-auto px-4 md:px-margin-desktop py-stack-lg">
      <div className="bg-primary rounded-xl overflow-hidden flex flex-col md:flex-row shadow-sm">
        <div className="p-8 md:p-12 flex-1 flex flex-col justify-center">
          <span className="font-label-md text-label-md text-secondary-container mb-unit uppercase tracking-widest font-semibold">
            Ưu đãi đặc biệt
          </span>
          <h2 className="font-headline-xl text-3xl md:text-headline-xl font-bold text-white mb-stack-sm leading-tight">
            Giảm giá lên đến 50%
          </h2>
          <p className="font-body-lg text-body-lg text-inverse-on-surface mb-stack-lg opacity-90 leading-relaxed">
            Đọc nhiều hơn, trả ít hơn. Khám phá hàng ngàn tựa sách đang được giảm giá cực sốc trong tuần lễ văn hóa đọc.
          </p>
          <div>
            <button
              onClick={() => navigate('/vouchers')}
              className="bg-secondary-container text-on-secondary-container font-label-md text-label-md px-6 py-3 rounded-DEFAULT hover:bg-[#ffb95f] transition-colors font-bold shadow-sm cursor-pointer"
            >
              Xem khuyến mãi
            </button>
          </div>
        </div>
        <div
          className="w-full md:w-5/12 h-64 md:h-auto bg-cover bg-center"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD8-szua7HV2HWhIXijnG3mSu61sR4nOvz3vJyvK4FX9C1n-LN6qNcmke27S44dQCQywfIsCEe0V8NBbA14YP2XCLzI9QFF0s2z7ex3TgOJUBOLLXod_SrDSI5THwlN_TSJAb1HVJ4VEeLWDie7Ar40W50Ht9UPIvLGJ-7O1btkRPru9ae6M1c_WYa_3agA3qmcR6LqF-BeY608TUT1fHd9-ZZm7qIHHivVfC76yebFMofvy9SXZu4')`,
          }}
        ></div>
      </div>
    </section>
  );
};
