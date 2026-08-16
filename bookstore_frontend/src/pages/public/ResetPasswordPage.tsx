import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useResetPassword } from '../../features/auth/hooks/useResetPasswordMutation';
import { isNonEmpty } from '../../utils';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetPasswordMutation = useResetPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let isValid = true;

    if (!isNonEmpty(newPassword)) {
      setNewPasswordError('Mật khẩu không được để trống.');
      isValid = false;
    } else if (newPassword.length < 6) {
      setNewPasswordError('Mật khẩu tối thiểu 6 ký tự.');
      isValid = false;
    } else {
      setNewPasswordError(null);
    }

    if (!isNonEmpty(confirmPassword)) {
      setConfirmPasswordError('Vui lòng xác nhận mật khẩu.');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Mật khẩu xác nhận không khớp.');
      isValid = false;
    } else {
      setConfirmPasswordError(null);
    }

    if (!isValid) return;
    if (!token) return;

    resetPasswordMutation.mutate(
      { token, newPassword },
      {
        onSuccess: () => {
          navigate('/login', { state: { resetSuccess: true } });
        },
        onError: (error: Error) => {
          setNewPasswordError(error.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
        },
      }
    );
  };

  const isLoading = resetPasswordMutation.isPending;

  if (!token) {
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
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-red-600 text-4xl">
              error
            </span>
          </div>

          <h2 className="text-2xl font-bold text-[#002045] mb-3">
            Link không hợp lệ
          </h2>
          <p className="text-base text-[#43474e] mb-8">
            Không tìm thấy token đặt lại mật khẩu. Vui lòng yêu cầu link mới.
          </p>

          <Link
            to="/forgot-password"
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#855300] hover:bg-[#6a4200] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#855300] transform hover:scale-[1.02] transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[18px] mr-2">mail</span>
            Gửi link mới
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
          Nhập mật khẩu mới cho tài khoản của bạn.
        </p>
      </div>

      {/* Reset Password Card */}
      <div className="glass-panel rounded-xl shadow-[0_4px_6px_-1px_rgba(26,54,93,0.05),0_2px_4px_-1px_rgba(26,54,93,0.03)] p-8 w-full">
        <form onSubmit={handleSubmit} noValidate>
          {/* New Password Field */}
          <div className="mb-4 relative text-left">
            <label className="block font-semibold text-sm text-[#191c1e] mb-2" htmlFor="newPassword">
              Mật khẩu mới
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#43474e]">
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                  lock
                </span>
              </span>
              <input
                className={`block w-full pl-10 pr-10 py-2 bg-white border-1.5 ${
                  newPasswordError ? 'input-error border-[#ba1a1a]' : 'border-[#c4c6cf]'
                } rounded-lg text-base text-[#191c1e] placeholder-[#74777f] focus:outline-none focus:border-[#002045] focus:ring-[3px] focus:ring-[#d6e3ff] transition-all duration-200`}
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (newPasswordError) setNewPasswordError(null);
                }}
                required
              />
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#43474e] hover:text-[#002045] transition-colors focus:outline-none cursor-pointer"
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showNewPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
            {newPasswordError && (
              <p className="text-xs text-[#ba1a1a] mt-1 flex items-center">
                <span className="material-symbols-outlined text-[14px] mr-1">error</span>
                {newPasswordError}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="mb-6 relative text-left">
            <label className="block font-semibold text-sm text-[#191c1e] mb-2" htmlFor="confirmPassword">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#43474e]">
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                  lock
                </span>
              </span>
              <input
                className={`block w-full pl-10 pr-10 py-2 bg-white border-1.5 ${
                  confirmPasswordError ? 'input-error border-[#ba1a1a]' : 'border-[#c4c6cf]'
                } rounded-lg text-base text-[#191c1e] placeholder-[#74777f] focus:outline-none focus:border-[#002045] focus:ring-[3px] focus:ring-[#d6e3ff] transition-all duration-200`}
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmPasswordError) setConfirmPasswordError(null);
                }}
                required
              />
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#43474e] hover:text-[#002045] transition-colors focus:outline-none cursor-pointer"
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showConfirmPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
            {confirmPasswordError && (
              <p className="text-xs text-[#ba1a1a] mt-1 flex items-center">
                <span className="material-symbols-outlined text-[14px] mr-1">error</span>
                {confirmPasswordError}
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
              <span className="material-symbols-outlined text-[18px] mr-2">lock_reset</span>
            )}
            <span>Đặt lại mật khẩu</span>
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
