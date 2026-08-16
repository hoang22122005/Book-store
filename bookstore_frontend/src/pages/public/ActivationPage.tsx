import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useVerifyEmail } from '../../features/auth/hooks/useVerifyEmailMutation';

export const ActivationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const verifyEmailMutation = useVerifyEmail();

  useEffect(() => {
    if (token) {
      verifyEmailMutation.mutate(token, {
        onSuccess: () => {
          setIsSuccess(true);
        },
        onError: (error: Error) => {
          setIsSuccess(false);
          setErrorMessage(error.message || 'Xác minh email thất bại');
        },
      });
    } else {
      setIsSuccess(false);
      setErrorMessage('Không tìm thấy token xác minh');
    }
  }, [token]);

  if (isSuccess === null) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link className="inline-block" to="/">
            <h1 className="font-bold text-3xl md:text-4xl text-[#002045] tracking-tight">
              BookStore
            </h1>
          </Link>
        </div>

        <div className="glass-panel rounded-xl shadow-[0_4px_6px_-1px_rgba(26,54,93,0.05),0_2px_4px_-1px_rgba(26,54,93,0.03)] p-8 w-full text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <span className="animate-spin material-symbols-outlined text-blue-600 text-4xl">
              progress_activity
            </span>
          </div>

          <h2 className="text-2xl font-bold text-[#002045] mb-3">
            Đang xác minh email...
          </h2>
          <p className="text-base text-[#43474e] mb-8">
            Vui lòng chờ trong giây lát.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Identity */}
      <div className="text-center mb-8">
        <Link className="inline-block" to="/">
          <h1 className="font-bold text-3xl md:text-4xl text-[#002045] tracking-tight">
            BookStore
          </h1>
        </Link>
      </div>

      {/* Activation Card */}
      <div className="glass-panel rounded-xl shadow-[0_4px_6px_-1px_rgba(26,54,93,0.05),0_2px_4px_-1px_rgba(26,54,93,0.03)] p-8 w-full text-center">
        {isSuccess ? (
          <>
            {/* Success Icon */}
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-emerald-600 text-4xl">
                check_circle
              </span>
            </div>

            {/* Success Content */}
            <h2 className="text-2xl font-bold text-[#002045] mb-3">
              Xác minh email thành công!
            </h2>
            <p className="text-base text-[#43474e] mb-8">
              Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ.
            </p>

            {/* Login Button */}
            <Link
              to="/login"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#855300] hover:bg-[#6a4200] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#855300] transform hover:scale-[1.02] transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[18px] mr-2">login</span>
              Đăng nhập ngay
            </Link>
          </>
        ) : (
          <>
            {/* Failure Icon */}
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-red-600 text-4xl">
                error
              </span>
            </div>

            {/* Failure Content */}
            <h2 className="text-2xl font-bold text-[#002045] mb-3">
              Xác minh email thất bại!
            </h2>
            <p className="text-base text-[#43474e] mb-2">
              {errorMessage}
            </p>
            <p className="text-sm text-[#74777f] mb-8">
              Vui lòng đăng ký lại để nhận email xác minh mới.
            </p>

            {/* Register Button */}
            <Link
              to="/register"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#855300] hover:bg-[#6a4200] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#855300] transform hover:scale-[1.02] transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[18px] mr-2">person_add</span>
              Đăng ký lại
            </Link>
          </>
        )}

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            className="text-sm font-semibold text-[#002045] hover:text-[#855300] inline-flex items-center transition-colors duration-200"
            to="/"
          >
            <span className="material-symbols-outlined text-[16px] mr-1">arrow_back</span>
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
