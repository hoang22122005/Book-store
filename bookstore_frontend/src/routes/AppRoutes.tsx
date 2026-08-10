import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { AdminLayout } from '../layouts/AdminLayout';

import { HomePage } from '../pages/public/HomePage';
import { BookDetailPage } from '../pages/public/BookDetailPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { CartPage } from '../pages/customer/CartPage';
import { CheckoutPage } from '../pages/customer/CheckoutPage';
import { OrderSuccessPage } from '../pages/customer/OrderSuccessPage';
import { MyOrdersPage } from '../pages/customer/MyOrdersPage';
import { BookCatalogPage } from '../pages/customer/BookCatalogPage';
import { ProfilePage } from '../pages/customer/ProfilePage';
import { ProtectedRoute } from './ProtectedRoute';
import { ChatPage } from '../pages/admin/ChatPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminFinancePage } from '../pages/admin/AdminFinancePage';
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
        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'STAFF', 'ACCOUNTANT', 'WAREHOUSE_KEEPER']}>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'STAFF', 'ACCOUNTANT', 'WAREHOUSE_KEEPER']}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success"
          element={
            <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'STAFF', 'ACCOUNTANT', 'WAREHOUSE_KEEPER']}>
              <OrderSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'STAFF', 'ACCOUNTANT', 'WAREHOUSE_KEEPER']}>
              <MyOrdersPage />
            </ProtectedRoute>
          }
        />
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
              <AdminDashboardPage />
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
          element={<ProtectedRoute allowedRoles={[...adminRouteAccess['/admin/finance']]}><AdminFinancePage /></ProtectedRoute>}
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
