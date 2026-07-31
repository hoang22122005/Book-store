import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLogout } from '../../features/auth/hooks';
import { isAdminOrStaffRole } from '../../utils';

export const Header: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/login');
      },
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-surface border-b border-surface-container-high shadow-xs">
      <div className="max-w-7xl mx-auto px-4 md:px-12 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="font-extrabold text-2xl text-primary hover:opacity-90 transition-opacity tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl text-secondary-container">menu_book</span>
          <span>BookStore</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-on-surface-variant">
          <Link to="/books" className="hover:text-secondary transition-colors">Danh mục</Link>
          <Link to="/books?filter=new" className="hover:text-secondary transition-colors">Sách mới</Link>
          <Link to="/books?filter=bestseller" className="hover:text-secondary transition-colors">Bán chạy</Link>
          <Link to="/vouchers" className="hover:text-secondary transition-colors">Khuyến mãi</Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-surface-container-high">
              {isAdminOrStaffRole(user.role) && (
                <Link
                  to="/admin"
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-primary bg-primary-fixed rounded-md hover:bg-primary-fixed-dim transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">shield</span>
                  <span>{user.role}</span>
                </Link>
              )}


              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold text-sm flex items-center justify-center overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="hidden lg:inline text-sm text-primary font-semibold">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-primary hover:text-error transition-colors cursor-pointer"
                  title="Đăng xuất"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-bold text-primary hover:text-secondary transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-bold text-on-secondary-container bg-secondary-container hover:bg-secondary-fixed-dim rounded-lg shadow-xs transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
