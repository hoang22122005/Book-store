import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { AdminLayout } from '../layouts/AdminLayout';

import { HomePage } from '../pages/public/HomePage';
import { BookDetailPage } from '../pages/public/BookDetailPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { ActivationPage } from '../pages/public/ActivationPage';
import { ForgotPasswordPage } from '../pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/public/ResetPasswordPage';
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
import { BookManagementPage } from '../pages/admin/BookManagementPage';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { AddBookPage } from '../pages/admin/AddBookPage';
import { EditBookPage } from '../pages/admin/EditBookPage';
import { WarehouseStockImportPage } from '../pages/admin/WarehouseStockImportPage';
import { StaffOrderManagementPage } from '../pages/admin/StaffOrderManagementPage';
import { VoucherManagementPage } from '../pages/admin/VoucherManagementPage';
import { adminRouteAccess, backofficeRoles } from '../utils/adminAccess';

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
        <Route path="/activation" element={<ActivationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Admin / Backoffice Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={[...backofficeRoles]}>
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
          element={
            <ProtectedRoute allowedRoles={[...adminRouteAccess['/admin/books']]}>
              <BookManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/books/add"
          element={
            <ProtectedRoute allowedRoles={[...adminRouteAccess['/admin/books']]}>
              <AddBookPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/books/:bookId/edit"
          element={
            <ProtectedRoute allowedRoles={[...adminRouteAccess['/admin/books']]}>
              <EditBookPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={[...adminRouteAccess['/admin/users']]}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vouchers"
          element={
            <ProtectedRoute allowedRoles={[...adminRouteAccess['/admin/vouchers']]}>
              <VoucherManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute allowedRoles={[...adminRouteAccess['/admin/orders']]}>
              <StaffOrderManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/chat"
          element={
            <ProtectedRoute allowedRoles={[...adminRouteAccess['/admin/chat']]}>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/warehouse"
          element={
            <ProtectedRoute allowedRoles={[...adminRouteAccess['/admin/warehouse']]}>
              <WarehouseStockImportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/finance"
          element={
            <ProtectedRoute allowedRoles={[...adminRouteAccess['/admin/finance']]}>
              <AdminFinancePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
