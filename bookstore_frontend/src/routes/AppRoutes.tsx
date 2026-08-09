import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { AdminLayout } from '../layouts/AdminLayout';

import { HomePage } from '../pages/public/HomePage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { BookCatalogPage } from '../pages/customer/BookCatalogPage';
import { BookDetailPage } from '../pages/customer/BookDetailPage';
import { ProfilePage } from '../pages/customer/ProfilePage';
import { ProtectedRoute } from './ProtectedRoute';
import { ChatPage } from '../pages/admin/ChatPage';
import { adminRouteAccess } from '../utils/adminAccess';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Customer Routes with CustomerLayout */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/books" element={<BookCatalogPage />} />
        <Route path="/books/:bookId" element={<BookDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
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
            <ProtectedRoute allowedRoles={[...adminRouteAccess['/admin']]}> 
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-white">Bảng Điều Hành Admin</h1>
                <p className="text-slate-400">Chào mừng bạn đến với trang quản trị hệ thống.</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/books"
          element={<ProtectedRoute allowedRoles={[...adminRouteAccess['/admin/books']]}><div className="text-white">Quản Lý Danh Sách Sách</div></ProtectedRoute>}
        />
        <Route
          path="/admin/vouchers"
          element={<ProtectedRoute allowedRoles={[...adminRouteAccess['/admin/vouchers']]}><div className="text-white">Quản Lý Voucher & Khuyến Mãi</div></ProtectedRoute>}
        />
        <Route
          path="/admin/orders"
          element={<ProtectedRoute allowedRoles={[...adminRouteAccess['/admin/orders']]}><div className="text-white">Quản Lý Đơn Hàng</div></ProtectedRoute>}
        />
        <Route path="/admin/chat" element={<ProtectedRoute allowedRoles={[...adminRouteAccess['/admin/chat']]}><ChatPage /></ProtectedRoute>} />
        <Route
          path="/admin/warehouse"
          element={<ProtectedRoute allowedRoles={[...adminRouteAccess['/admin/warehouse']]}><div className="text-white">Quản Lý Nhập Kho</div></ProtectedRoute>}
        />
        <Route
          path="/admin/finance"
          element={<ProtectedRoute allowedRoles={[...adminRouteAccess['/admin/finance']]}><div className="text-white">Báo Cáo Kế Toán & Doanh Thu</div></ProtectedRoute>}
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
