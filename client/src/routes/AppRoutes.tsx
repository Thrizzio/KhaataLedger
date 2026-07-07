import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AuditPage } from '../pages/AuditPage';
import { CustomerDetailsPage } from '../pages/CustomerDetailsPage';
import { CustomersPage } from '../pages/CustomersPage';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ReportsPage } from '../pages/ReportsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { TransactionsPage } from '../pages/TransactionsPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes = () => (
  <Routes>
    <Route element={<Navigate replace to="/dashboard" />} path="/" />
    <Route element={<LoginPage />} path="/login" />
    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route element={<DashboardPage />} path="/dashboard" />
        <Route element={<CustomersPage />} path="/customers" />
        <Route element={<CustomerDetailsPage />} path="/customers/:id" />
        <Route element={<TransactionsPage />} path="/transactions" />
        <Route element={<AuditPage />} path="/audit" />
        <Route element={<ReportsPage />} path="/reports" />
        <Route element={<SettingsPage />} path="/settings" />
      </Route>
    </Route>
    <Route element={<NotFoundPage />} path="*" />
  </Routes>
);
