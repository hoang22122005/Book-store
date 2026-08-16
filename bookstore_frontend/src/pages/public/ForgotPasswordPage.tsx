import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '../../features/auth/hooks/useForgotPasswordMutation';
import { isValidEmail } from '../../utils';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const forgotPasswordMutation = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setEmailError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    setEmailError(null);
    forgotPasswordMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
        onError: () => {
          setIsSuccess(true);
        },
      }
    );
  };

  const isLoading = forgotPasswordMutation.isPending;

  if (isSuccess) {
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
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-emerald-600 text-4xl">
              mail
            </span>
          </div>

          <h2 className="text-2xl font-bold text-[#002045] mb-3">
            Kiểm tra email của bạn
          </h2>
          <p className="text-base text-[#43474e] mb-8">
            Nếu email <strong className="font-semibold">{email}</strong> tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.
          </p>

          <Link
            to="/login"
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#855300] hover:bg-[#6a4200] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#855300] transform hover:scale-[1.02] transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[18px] mr-2">login</span>
            Quay lại đăng nhập
          </Link>
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
        <p className="text-base text-[#43474e] mt-2">
          Quên mật khẩu? Vui lòng nhập email để nhận link đặt lại.
        </p>
      </div>

      {/* Forgot Password Card */}
      <div className="glass-panel rounded-xl shadow-[0_4px_6px_-1px_rgba(26,54,93,0.05),0_2px_4px_-1px_rgba(26,54,93,0.03)] p-8 w-full">
        <form onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <div className="mb-6 relative text-left">
            <label className="block font-semibold text-sm text-[#191c1e] mb-2" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#43474e]">
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                  mail
                </span>
              </span>
              <input
                className={`block w-full pl-10 pr-3 py-2 bg-white border-1.5 ${
                  emailError ? 'input-error border-[#ba1a1a]' : 'border-[#c4c6cf]'
                } rounded-lg text-base text-[#191c1e] placeholder-[#74777f] focus:outline-none focus:border-[#002045] focus:ring-[3px] focus:ring-[#d6e3ff] transition-all duration-200`}
                id="email"
                name="email"
                type="email"
                placeholder="nhapemail@vi-du.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                required
              />
            </div>
            {emailError && (
              <p className="text-xs text-[#ba1a1a] mt-1 flex items-center">
                <span className="material-symbols-outlined text-[14px] mr-1">error</span>
                {emailError}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#855300] hover:bg-[#6a4200] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#855300] transform hover:scale-[1.02] transition-all duration-200 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <span className="animate-spin material-symbols-outlined text-base mr-2">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[18px] mr-2">send</span>
            )}
            <span>Gửi link đặt lại</span>
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            className="text-sm font-semibold text-[#002045] hover:text-[#855300] inline-flex items-center transition-colors duration-200"
            to="/login"
          >
            <span className="material-symbols-outlined text-[16px] mr-1">arrow_back</span>
            <span>Quay lại đăng nhập</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
