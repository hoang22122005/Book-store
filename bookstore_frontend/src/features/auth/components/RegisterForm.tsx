import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../hooks/useRegisterMutation';
import { isValidEmail, isValidPassword, isNonEmpty, doPasswordsMatch, getErrorMessage } from '../../../utils';

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isLoading = registerMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNonEmpty(fullname) || !isNonEmpty(email) || !isNonEmpty(password)) {
      setErrorMsg('Vui lòng điền đầy đủ Họ và tên, Email và Mật khẩu.');
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMsg('Địa chỉ email không hợp lệ.');
      return;
    }

    if (!isValidPassword(password, 6)) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (!doPasswordsMatch(password, confirmPassword)) {
      setErrorMsg('Mật khẩu nhập lại không khớp.');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('Bạn cần đồng ý với các Điều khoản dịch vụ và Chính sách bảo mật.');
      return;
    }

    setErrorMsg(null);
    registerMutation.mutate(
      { name: fullname, email, password, phone, address: '' },
      {
        onSuccess: () => {
          setSuccessMsg('Đăng ký tài khoản thành công! Đang chuyển hướng sang Đăng nhập...');
          setTimeout(() => {
            navigate('/login', { state: { email, password, registered: true } });
          }, 1200);
        },
        onError: (err: unknown) => {
          setErrorMsg(
            getErrorMessage(err, 'Đăng ký không thành công. Email có thể đã được sử dụng.')
          );
        },
      }
    );
  };


  return (
    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-0 glass-panel rounded-xl overflow-hidden shadow-[0_4px_6px_-1px_rgba(26,54,93,0.05),0_2px_4px_-1px_rgba(26,54,93,0.03)] border border-[#e0e3e5]">
      {/* Left Side: Image / Branding */}
      <div
        className="hidden md:block relative bg-[#f2f4f6] bg-cover bg-center min-h-[580px]"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#002045]/90 via-[#002045]/40 to-transparent flex flex-col justify-end p-8 text-white">
          <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-white leading-tight">
            Khám phá thế giới tri thức.
          </h1>
          <p className="text-base text-slate-200 leading-relaxed">
            Tham gia cộng đồng người đọc lớn nhất Việt Nam và tận hưởng hàng ngàn tựa sách chất lượng.
          </p>
        </div>
        {/* Brand Logo for Desktop */}
        <Link
          className="absolute top-8 left-8 text-2xl font-bold text-white z-10 drop-shadow-md tracking-tight hover:opacity-90 transition-opacity"
          to="/"
        >
          BookStore
        </Link>
      </div>

      {/* Right Side: Registration Form */}
      <div className="p-6 md:p-10 flex flex-col justify-center bg-white/90 backdrop-blur-md">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#002045] mb-2 tracking-tight">
            Đăng ký tài khoản
          </h2>
          <p className="text-sm text-[#43474e]">
            Điền thông tin bên dưới để tạo tài khoản mới.
          </p>
        </div>

        {/* Error Message Banner */}
        {errorMsg && (
          <div className="mb-4 bg-[#ffdad6] border border-[#ba1a1a]/20 rounded-lg p-3 flex items-start gap-3" role="alert">
            <span aria-hidden="true" className="material-symbols-outlined text-[#ba1a1a] text-xl mt-0.5">
              error
            </span>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-[#93000a]">Đăng ký không thành công</h3>
              <p className="text-xs text-[#93000a]/90 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Success Message Banner */}
        {successMsg && (
          <div className="mb-4 bg-emerald-100 border border-emerald-300 rounded-lg p-3 flex items-start gap-3" role="alert">
            <span aria-hidden="true" className="material-symbols-outlined text-emerald-600 text-xl mt-0.5">
              check_circle
            </span>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-emerald-900">Thành công!</h3>
              <p className="text-xs text-emerald-800 mt-0.5">{successMsg}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Họ tên */}
          <div className="space-y-1.5 text-left">
            <label className="font-semibold text-xs text-[#191c1e] block" htmlFor="fullname">
              Họ và tên
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#74777f]">
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                  person
                </span>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border border-[#c4c6cf] rounded-lg bg-white text-[#191c1e] placeholder-[#74777f] focus:outline-none focus:border-[#002045] focus:ring-[3px] focus:ring-[#d6e3ff] transition-all text-sm"
                id="fullname"
                name="fullname"
                type="text"
                placeholder="Nguyễn Văn A"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5 text-left">
            <label className="font-semibold text-xs text-[#191c1e] block" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#74777f]">
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                  mail
                </span>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border border-[#c4c6cf] rounded-lg bg-white text-[#191c1e] placeholder-[#74777f] focus:outline-none focus:border-[#002045] focus:ring-[3px] focus:ring-[#d6e3ff] transition-all text-sm"
                id="email"
                name="email"
                type="email"
                placeholder="nguyenvana@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Số điện thoại */}
          <div className="space-y-1.5 text-left">
            <label className="font-semibold text-xs text-[#191c1e] block" htmlFor="phone">
              Số điện thoại
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#74777f]">
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                  call
                </span>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border border-[#c4c6cf] rounded-lg bg-white text-[#191c1e] placeholder-[#74777f] focus:outline-none focus:border-[#002045] focus:ring-[3px] focus:ring-[#d6e3ff] transition-all text-sm"
                id="phone"
                name="phone"
                type="tel"
                placeholder="0987654321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Mật khẩu */}
          <div className="space-y-1.5 text-left">
            <label className="font-semibold text-xs text-[#191c1e] block" htmlFor="password">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#74777f]">
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                  lock
                </span>
              </div>
              <input
                className="block w-full pl-10 pr-10 py-2 border border-[#c4c6cf] rounded-lg bg-white text-[#191c1e] placeholder-[#74777f] focus:outline-none focus:border-[#002045] focus:ring-[3px] focus:ring-[#d6e3ff] transition-all text-sm"
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                aria-label="Hiện mật khẩu"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#74777f] hover:text-[#002045] focus:outline-none cursor-pointer"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
          </div>

          {/* Nhập lại mật khẩu */}
          <div className="space-y-1.5 text-left">
            <label className="font-semibold text-xs text-[#191c1e] block" htmlFor="confirm_password">
              Nhập lại mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#74777f]">
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                  lock_reset
                </span>
              </div>
              <input
                className="block w-full pl-10 pr-10 py-2 border border-[#c4c6cf] rounded-lg bg-white text-[#191c1e] placeholder-[#74777f] focus:outline-none focus:border-[#002045] focus:ring-[3px] focus:ring-[#d6e3ff] transition-all text-sm"
                id="confirm_password"
                name="confirm_password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                aria-label="Hiện mật khẩu"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#74777f] hover:text-[#002045] focus:outline-none cursor-pointer"
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                  {showConfirmPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
          </div>

          {/* Điều khoản */}
          <div className="flex items-start pt-1 text-left">
            <div className="flex items-center h-5">
              <input
                className="h-4 w-4 text-[#855300] focus:ring-[#fea619] border-[#c4c6cf] rounded bg-white cursor-pointer"
                id="terms"
                name="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                required
              />
            </div>
            <div className="ml-2.5 text-xs">
              <label className="text-[#43474e] cursor-pointer" htmlFor="terms">
                Tôi đồng ý với các{' '}
                <a className="text-[#002045] hover:underline font-semibold" href="#">
                  điều khoản dịch vụ
                </a>{' '}
                và{' '}
                <a className="text-[#002045] hover:underline font-semibold" href="#">
                  chính sách bảo mật
                </a>{' '}
                của BookStore.
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-semibold text-sm text-white bg-[#855300] hover:bg-[#6a4200] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#855300] transform hover:scale-[1.01] transition-all duration-200 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <span className="animate-spin material-symbols-outlined text-base mr-2">
                  progress_activity
                </span>
              ) : null}
              <span>Đăng ký</span>
            </button>
          </div>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[#43474e]">
            Đã có tài khoản?{' '}
            <Link className="font-semibold text-[#002045] hover:underline" to="/login">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
