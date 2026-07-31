import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { AdminLayout } from '../layouts/AdminLayout';

import { HomePage } from '../pages/public/HomePage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Customer Routes with CustomerLayout */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/books" element={<HomePage />} />
      </Route>

      {/* Auth Routes with AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Admin / Backoffice Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STAFF', 'ACCOUNTANT', 'WAREHOUSE_KEEPER']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/admin"
          element={
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Bảng Điều Hành Admin</h1>
              <p className="text-slate-400">Chào mừng bạn đến với trang quản trị hệ thống.</p>
            </div>
          }
        />
        <Route
          path="/admin/books"
          element={<div className="text-white">Quản Lý Danh Sách Sách</div>}
        />
        <Route
          path="/admin/vouchers"
          element={<div className="text-white">Quản Lý Voucher & Khuyến Mãi</div>}
        />
        <Route
          path="/admin/orders"
          element={<div className="text-white">Quản Lý Đơn Hàng</div>}
        />
        <Route
          path="/admin/warehouse"
          element={<div className="text-white">Quản Lý Nhập Kho</div>}
        />
        <Route
          path="/admin/finance"
          element={<div className="text-white">Báo Cáo Kế Toán & Doanh Thu</div>}
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
