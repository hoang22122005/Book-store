import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLogout } from '../../features/auth/hooks';
import { useCartDetailsQuery } from '../../features/cart';

export const Header: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { data: cartDetails } = useCartDetailsQuery();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const cartItemCount = cartDetails
    ? cartDetails.reduce((acc, item) => acc + (item.quantity || 0), 0)
    : 0;

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/login');
      },
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface border-b border-surface-variant shadow-sm shadow-[0_4px_6px_-1px_rgba(26,54,93,0.05),0_2px_4px_-1px_rgba(26,54,93,0.03)]">
      <div className="max-w-container-max mx-auto h-20 px-4 md:px-margin-desktop flex items-center justify-between gap-stack-md">
        <div className="flex items-center gap-stack-lg">
          <Link
            to="/"
            className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-primary tracking-tight"
          >
            BookStore
          </Link>
          <nav className="hidden md:flex items-center gap-stack-md text-body-md font-medium">
            <Link
              to="/books"
              className="text-on-surface-variant hover:text-secondary transition-colors duration-200"
            >
              Danh mục
            </Link>
            <Link
              to="/books?filter=new"
              className="text-on-surface-variant hover:text-secondary transition-colors duration-200"
            >
              Sách mới
            </Link>
            <Link
              to="/books?filter=bestseller"
              className="text-on-surface-variant hover:text-secondary transition-colors duration-200"
            >
              Bán chạy
            </Link>
            <Link
              to="/vouchers"
              className="text-on-surface-variant hover:text-secondary transition-colors duration-200"
            >
              Khuyến mãi
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-stack-md">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex relative items-center">
            <span className="material-symbols-outlined absolute left-3 text-primary">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm sách..."
              className="pl-10 pr-4 py-2 bg-surface-container-lowest border-[1.5px] border-surface-variant rounded-full text-body-md placeholder:text-on-tertiary-container focus:outline-none focus:border-primary focus:ring-0 focus:shadow-[0_0_0_3px_rgba(173,199,247,0.5)] transition-all w-64"
            />
          </form>

          {/* Cart Icon */}
          <Link
            to="/cart"
            className="relative text-primary hover:text-secondary transition-colors duration-200 opacity-80 hover:scale-95 transition-all p-1"
            title="Giỏ hàng"
          >
            <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
            {isAuthenticated && cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-error text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface animate-bounce">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </Link>

          {/* User Account / Login */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-stack-sm border-l border-surface-variant pl-3">
              <Link
                to="/my-orders"
                className="p-1 text-primary hover:text-secondary transition-colors"
                title="Theo dõi đơn hàng"
              >
                <span className="material-symbols-outlined text-[22px]">local_shipping</span>
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2 text-primary hover:text-secondary transition-colors"
                title="Hồ sơ cá nhân"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="hidden lg:inline text-label-md font-semibold text-primary">
                  {user.name}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-1 text-primary hover:text-error transition-colors cursor-pointer"
                title="Đăng xuất"
              >
                <span className="material-symbols-outlined text-[22px]">logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-primary hover:text-secondary transition-colors duration-200 opacity-80 hover:scale-95 transition-all p-1"
              title="Đăng nhập"
            >
              <span className="material-symbols-outlined text-[24px]">person</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
