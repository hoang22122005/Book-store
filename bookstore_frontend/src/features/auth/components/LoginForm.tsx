import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useLogin } from '../hooks/useLoginMutation';
import { isValidEmail, isNonEmpty, getErrorMessage } from '../../../utils';
import { getDefaultAdminPath } from '../../../utils/adminAccess';

export const LoginForm: React.FC = () => {
  const loginMutation = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const registeredState = location.state as { email?: string; password?: string; registered?: boolean } | undefined;
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState(() => registeredState?.email || '');
  const [password, setPassword] = useState(() => registeredState?.password || '');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const isLoading = loginMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let isValid = true;

    if (!isValidEmail(email)) {
      setEmailError('Vui lòng nhập địa chỉ email hợp lệ.');
      isValid = false;
    } else {
      setEmailError(null);
    }

    if (!isNonEmpty(password)) {
      setPasswordError('Mật khẩu không được để trống.');
      isValid = false;
    } else {
      setPasswordError(null);
    }

    if (!isValid) return;

    loginMutation.mutate(
      { email, password, rememberMe },
      {
        onSuccess: (loggedUser) => {
          const adminPath = getDefaultAdminPath(loggedUser.role);
          if (adminPath) {
            navigate(adminPath);
          } else {
            navigate(redirect);
          }
        },
        onError: (err: unknown) => {
          setEmailError(
            getErrorMessage(err, 'Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.')
          );
        },
      }
    );
  };

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
          Chào mừng bạn quay lại. Vui lòng đăng nhập.
        </p>
      </div>

      {/* Login Card */}
      <div className="glass-panel rounded-xl shadow-[0_4px_6px_-1px_rgba(26,54,93,0.05),0_2px_4px_-1px_rgba(26,54,93,0.03)] p-8 w-full">
        {registeredState?.registered && (
          <div className="mb-6 bg-emerald-50 border border-emerald-300 rounded-lg p-3.5 flex items-start gap-3 text-left" role="alert">
            <span aria-hidden="true" className="material-symbols-outlined text-emerald-600 text-xl mt-0.5 shrink-0">
              check_circle
            </span>
            <div className="flex-1">
              <h3 className="font-bold text-sm text-emerald-900">Đăng ký tài khoản thành công!</h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                Thông tin tài khoản và mật khẩu của bạn đã được nhập sẵn. Bấm <strong className="font-bold">Đăng nhập</strong> bên dưới để bắt đầu sử dụng.
              </p>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <div className="mb-4 relative text-left">
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

          {/* Password Field */}
          <div className="mb-4 relative text-left">
            <div className="flex justify-between items-center mb-2">
              <label className="block font-semibold text-sm text-[#191c1e]" htmlFor="password">
                Mật khẩu
              </label>
              <Link
                className="font-semibold text-sm text-[#002045] hover:text-[#855300] transition-colors duration-200"
                to="/forgot-password"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#43474e]">
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                  lock
                </span>
              </span>
              <input
                className={`block w-full pl-10 pr-10 py-2 bg-white border-1.5 ${
                  passwordError ? 'input-error border-[#ba1a1a]' : 'border-[#c4c6cf]'
                } rounded-lg text-base text-[#191c1e] placeholder-[#74777f] focus:outline-none focus:border-[#002045] focus:ring-[3px] focus:ring-[#d6e3ff] transition-all duration-200`}
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                required
              />
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#43474e] hover:text-[#002045] transition-colors focus:outline-none cursor-pointer"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-[#ba1a1a] mt-1 flex items-center">
                <span className="material-symbols-outlined text-[14px] mr-1">error</span>
                {passwordError}
              </p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center mb-6">
            <input
              className="h-4 w-4 text-[#855300] focus:ring-[#fea619] border-[#c4c6cf] rounded bg-white cursor-pointer"
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label className="ml-2 block text-base text-[#43474e] cursor-pointer" htmlFor="remember-me">
              Ghi nhớ đăng nhập
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#855300] hover:bg-[#6a4200] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#855300] transform hover:scale-[1.02] transition-all duration-200 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <span className="animate-spin material-symbols-outlined text-base mr-2">progress_activity</span>
            ) : null}
            <span>Đăng nhập</span>
          </button>
        </form>

        {/* Divider */}
        <div className="mt-8 relative">
          <div aria-hidden="true" className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#c4c6cf]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-xs text-[#43474e]">
              Chưa có tài khoản?
            </span>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="mt-4 text-center">
          <Link
            className="text-sm font-semibold text-[#002045] hover:text-[#855300] inline-flex items-center transition-colors duration-200"
            to="/register"
          >
            <span>Đăng ký ngay</span>
            <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
