import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';

// Customer Pages
import HomePage from '../pages/HomePage';
import ShopPage from '../pages/ShopPage';
import CategoryPage from '../pages/CategoryPage';
import CategoriesPage from '../pages/CategoriesPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrdersPage from '../pages/OrdersPage';
import ProfilePage from '../pages/ProfilePage';
import WishlistPage from '../pages/WishlistPage';
import SearchPage from '../pages/SearchPage';
import VerifyOTPPage from '../pages/VerifyOTPPage';

// Admin Pages
import AdminDashboard from '../pages/AdminDashboard';
import AdminProducts from '../pages/AdminProducts';
import ProductFormPage from '../pages/ProductFormPage';
import AdminCategories from '../pages/AdminCategories';
import AdminOrders from '../pages/AdminOrders';
import AdminOrderDetail from '../pages/AdminOrderDetail';
import AdminUsers from '../pages/AdminUsers';
import AdminCoupons from '../pages/AdminCoupons';

import OrderDetailsPage from '../pages/OrderDetailsPage';

// Auth State
import useAuthStore from '../store/authStore';
// ... existing imports ...
// Wait, I should add it properly in the list.
// I'll rewrite the children part.

const ProtectedRoute = ({ children }) => {
  const token = useAuthStore(state => state.token);
  return token ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const user = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);
  return (token && user?.role === 'admin') ? children : <Navigate to="/" replace />;
};

const AuthRoute = ({ children }) => {
  const token = useAuthStore(state => state.token);
  return token ? <Navigate to="/" replace /> : children;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'category/:slug', element: <CategoryPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'products/:slug', element: <ProductDetailPage /> },
      { path: 'cart', element: <ProtectedRoute><CartPage /></ProtectedRoute> },
      { path: 'wishlist', element: <ProtectedRoute><WishlistPage /></ProtectedRoute> },
      { path: 'profile/*', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
      { path: 'orders', element: <ProtectedRoute><OrdersPage /></ProtectedRoute> },
      { path: 'orders/:orderNumber', element: <ProtectedRoute><OrderDetailsPage /></ProtectedRoute> },
    ]
  },
  { path: '/login', element: <AuthRoute><LoginPage /></AuthRoute> },
  { path: '/register', element: <AuthRoute><RegisterPage /></AuthRoute> },
  { path: '/forgot-password', element: <AuthRoute><ForgotPasswordPage /></AuthRoute> },
  { path: '/verify-otp', element: <AuthRoute><VerifyOTPPage /></AuthRoute> },
  { path: '/checkout', element: <ProtectedRoute><CheckoutPage /></ProtectedRoute> },
  
  // Admin Panel
  {
    path: '/admin',
    element: <AdminRoute><AdminLayout /></AdminRoute>,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'products', element: <AdminProducts /> },
      { path: 'products/new', element: <ProductFormPage /> },
      { path: 'products/:id/edit', element: <ProductFormPage /> },
      { path: 'categories', element: <AdminCategories /> },
      { path: 'orders', element: <AdminOrders /> },
      { path: 'orders/:id', element: <AdminOrderDetail /> },
      { path: 'customers', element: <AdminUsers /> },
      { path: 'coupons', element: <AdminCoupons /> },
    ]
  },
  // Fallback
  { path: '*', element: <Navigate to="/" replace /> }
]);
