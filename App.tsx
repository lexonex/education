
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
  const { brandingName, faviconURL, seoTitle, seoDescription, seoKeywords, seoImage, initializePublicSettings, updateLastActive } = useDataStore();

  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      updateLastActive(user.uid);
      
      const interval = setInterval(() => {
        updateLastActive(user.uid);
      }, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.uid, updateLastActive]);

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
    // Browser tab title will ONLY show SEO Title if provided.
    // If empty, it will show nothing (browser defaults to URL).
    document.title = seoTitle || '';
  }, [seoTitle]);

  useEffect(() => {
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.getElementsByTagName('head')[0].appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Standard Meta
    updateMeta('description', seoDescription || 'Pioneering dynamic multi-tenant education management through neural grid technologies.');
    updateMeta('keywords', seoKeywords || 'education, management, grid, learning');

    // Open Graph
    updateMeta('og:title', seoTitle || brandingName, true);
    updateMeta('og:description', seoDescription || 'Education Management System', true);
    updateMeta('og:image', seoImage || faviconURL || '/favicon.svg', true);
    updateMeta('og:type', 'website', true);
    updateMeta('og:site_name', brandingName, true);

    // Twitter
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', seoTitle || brandingName);
    updateMeta('twitter:description', seoDescription || 'Education Management System');
    updateMeta('twitter:image', seoImage || faviconURL || '/favicon.svg');

  }, [seoTitle, seoDescription, seoKeywords, seoImage, brandingName, faviconURL]);

  useEffect(() => {
    const updateFavicon = (url: string) => {
      const isSvg = url.toLowerCase().includes('.svg') || url.startsWith('data:image/svg+xml');
      const type = isSvg ? 'image/svg+xml' : 'image/x-icon';

      // Update standard icon
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = url;
      if (isSvg) link.setAttribute('type', 'image/svg+xml');
      else link.removeAttribute('type');

      // Update apple-touch-icon
      let appleLink: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']");
      if (!appleLink) {
        appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        document.getElementsByTagName('head')[0].appendChild(appleLink);
      }
      appleLink.href = url;
      
      // Update shortcut icon
      let shortcutLink: HTMLLinkElement | null = document.querySelector("link[rel='shortcut icon']");
      if (!shortcutLink) {
        shortcutLink = document.createElement('link');
        shortcutLink.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(shortcutLink);
      }
      shortcutLink.href = url;
    };

    if (faviconURL) {
      updateFavicon(faviconURL);
    } else {
      // Default to public/favicon.svg
      updateFavicon("/favicon.svg");
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
