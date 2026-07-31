import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-400">Đang kiểm tra phiên làm việc...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
        <div className="max-w-md text-center space-y-4 p-8 bg-slate-900 border border-slate-800 rounded-3xl">
          <h2 className="text-2xl font-bold text-red-400">403 - Không Có Quyền Truy Cập</h2>
          <p className="text-sm text-slate-400">
            Tài khoản của bạn ({role}) không có thẩm quyền truy cập vào trang này.
          </p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl transition-colors"
          >
            Về Trang Chủ
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
