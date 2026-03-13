
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useDataStore } from './store/dataStore';
import { UserRole } from './types';
import { isPermissionActive } from './lib/utils';

// Layout & Components
import Layout from './components/Layout';
import HUDNotification from './components/HUDNotification';
import GlobalLoader from './components/GlobalLoader';
import CyberBackground from './components/CyberBackground';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import PermissionManager from './pages/PermissionManager';
import DocumentManager from './pages/DocumentManager';
import DocumentEditor from './pages/DocumentEditor';
import StudentDashboard from './pages/StudentDashboard';
import DocumentViewer from './pages/DocumentViewer';
import SearchPage from './pages/SearchPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import RegistrationManager from './pages/RegistrationManager';
import SubscriptionManagementPage from './pages/SubscriptionManagementPage';

import PermissionViewPage from './pages/PermissionViewPage';
import AccountRegistrationManager from './pages/AccountRegistrationManager';
import SubscriptionPlanManager from './pages/SubscriptionPlanManager';
import MoneyManagementPage from './pages/MoneyManagementPage';
import MoneyManagementHistory from './pages/MoneyManagementHistory';

const App: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const { brandingName, faviconURL, initializePublicSettings } = useDataStore();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      // Optionally store the event to trigger it later from a UI button
      console.log('PWA install prompt available');
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    initializePublicSettings();
  }, [initializePublicSettings]);

  useEffect(() => {
    if (brandingName) {
      document.title = brandingName;
    } else {
      document.title = ' ';
    }
  }, [brandingName]);

  useEffect(() => {
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }

    if (faviconURL) {
      link.href = faviconURL;
    } else {
      // Set to transparent pixel if no favicon is set
      link.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E";
    }
  }, [faviconURL]);

  if (isLoading) {
    return <GlobalLoader />;
  }

  return (
    <>
      <CyberBackground />
      <HUDNotification />
      <GlobalLoader />
      <Router>
        {!isAuthenticated ? (
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          <Layout>
            <Routes>
              {/* Shared Routes accessible by both roles */}
              <Route path="/view/:id" element={<DocumentViewer />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/category/:categoryName" element={<PermissionViewPage />} />

              {/* Analytics Routes */}
              {(user?.role === UserRole.ADMIN || 
                user?.permissions?.allAccess || 
                (user?.permissions?.canAccessAnalytics && isPermissionActive(user?.permissions?.analytics))
              ) && (
                <>
                  {/* Any analytics specific routes would go here if needed */}
                </>
              )}

              {(user?.role === UserRole.ADMIN || 
                user?.permissions?.allAccess || 
                (user?.permissions?.canAccessMoneyManagement && isPermissionActive(user?.permissions?.moneyManagement))
              ) && (
                <>
                  <Route path="/money-management" element={<MoneyManagementPage />} />
                  <Route path="/money-management-history" element={<MoneyManagementHistory />} />
                </>
              )}

              {user?.role === UserRole.ADMIN ? (
                <>
                  <Route path="/dashboard" element={<AdminDashboard />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/categories" element={<PermissionManager />} />
                  <Route path="/documents" element={<DocumentManager />} />
                  <Route path="/documents/new" element={<DocumentEditor />} />
                  <Route path="/documents/edit/:id" element={<DocumentEditor />} />
                  <Route path="/subscriptions" element={<SubscriptionManagementPage />} />
                  <Route path="/registration" element={<RegistrationManager />} />
                  <Route path="/resource-links" element={<AccountRegistrationManager />} />
                  <Route path="/subscription-plans" element={<SubscriptionPlanManager />} />
                  <Route path="/logs" element={<ActivityLogsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </>
              ) : (
                <>
                  <Route path="/dashboard" element={<StudentDashboard />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </>
              )}
            </Routes>
          </Layout>
        )}
      </Router>
    </>
  );
};

export default App;
