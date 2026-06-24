import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';

// Pages (to be created)
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Clients from '../pages/Clients';
import Products from '../pages/Products';
import Invoices from '../pages/Invoices';
import CreateInvoice from '../pages/CreateInvoice';
import InvoiceDetail from '../pages/InvoiceDetail';
import CompanyProfile from '../pages/CompanyProfile';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected SaaS App Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/products" element={<Products />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/create" element={<CreateInvoice />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
          <Route path="/profile" element={<CompanyProfile />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
