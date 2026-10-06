import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import RequirementsPage from './pages/Requirements';
import BannersPage from './pages/Banners';
import MobilesPage from './pages/Mobiles';
import DonationPointsPage from './pages/DonationPoints';
import SedesPage from './pages/Sedes';
import NotificationsPage from './pages/Notifications';
import GuidesPage from './pages/Guides';
import HelpCenterPage from './pages/HelpCenter';
import ContactPage from './pages/Contact';
import AboutUsPage from './pages/AboutUs';
import CategoriesPage from './pages/Categories';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
      />
      <Route
        path="/requirements"
        element={<ProtectedRoute><RequirementsPage /></ProtectedRoute>}
      />
      <Route
        path="/banners"
        element={<ProtectedRoute><BannersPage /></ProtectedRoute>}
      />
      <Route
        path="/mobiles"
        element={<ProtectedRoute><MobilesPage /></ProtectedRoute>}
      />
      <Route
        path="/points"
        element={<ProtectedRoute><DonationPointsPage /></ProtectedRoute>}
      />
      <Route
        path="/sedes"
        element={<ProtectedRoute><SedesPage /></ProtectedRoute>}
      />
      <Route
        path="/notifications"
        element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>}
      />
      <Route
        path="/guides"
        element={<ProtectedRoute><GuidesPage /></ProtectedRoute>}
      />
      <Route
        path="/help"
        element={<ProtectedRoute><HelpCenterPage /></ProtectedRoute>}
      />
      <Route
        path="/contact"
        element={<ProtectedRoute><ContactPage /></ProtectedRoute>}
      />
      <Route
        path="/about"
        element={<ProtectedRoute><AboutUsPage /></ProtectedRoute>}
      />
      <Route
        path="/categories"
        element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>}
      />
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
