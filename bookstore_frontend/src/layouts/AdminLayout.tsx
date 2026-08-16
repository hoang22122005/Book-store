import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, Tag, ShoppingBag, Package, DollarSign, ArrowLeft, LogOut, MessagesSquare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { canAccessAdminRoute, type AdminRoute } from '../utils/adminAccess';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems: { label: string; path: AdminRoute; icon: typeof LayoutDashboard }[] = [
    { label: 'Tổng Quan', path: '/admin', icon: LayoutDashboard },
    { label: 'Quản Lý Sách', path: '/admin/books', icon: BookOpen },
    { label: 'Người Dùng', path: '/admin/users', icon: Users },
    { label: 'Voucher', path: '/admin/vouchers', icon: Tag },
    { label: 'Trò chuyện', path: '/admin/chat', icon: MessagesSquare },
    { label: 'Đơn Hàng', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Nhập Kho', path: '/admin/warehouse', icon: Package },
    { label: 'Doanh Thu', path: '/admin/finance', icon: DollarSign },
  ];
  const visibleNavItems = navItems.filter((item) => canAccessAdminRoute(user?.role, item.path));

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-800">
            <div className="p-2 bg-amber-600 rounded-xl text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white tracking-wide text-sm">ADMIN PORTAL</h2>
              <p className="text-[10px] text-amber-400 font-medium uppercase">{user?.role || 'ADMIN'}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Trở về Storefront</span>
          </Link>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 rounded-lg hover:bg-red-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 overflow-y-auto p-8 bg-slate-900">
        <Outlet />
      </main>
    </div>
  );
};
