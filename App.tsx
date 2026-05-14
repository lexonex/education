
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useDataStore } from './store/dataStore';
import { useUIStore } from './store/uiStore';
import { UserRole } from './types';
import { isPermissionActive } from './lib/utils';

// Layout & Components
import Layout from './components/Layout';
import HUDNotification from './components/HUDNotification';
import GlobalLoader from './components/GlobalLoader';
import CyberBackground from './components/CyberBackground';

// Pages
import LandingPage from './pages/LandingPage';
import ContactUsPage from './pages/ContactUsPage';
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
  const { brandingName, faviconURL, seoTitle, seoDescription, seoKeywords, initializePublicSettings, updateLastActive } = useDataStore();
  const { isGlobalLoading, setGlobalLoading } = useUIStore();

  useEffect(() => {
    // Failsafe: Ensure loader is removed after 10 seconds if stuck
    const failsafe = setTimeout(() => {
      if (isLoading) {
        console.warn("Auth sync taking too long, forcing loader clear.");
        useAuthStore.setState({ isLoading: false });
      }
      setGlobalLoading(false);
    }, 10000);
    return () => clearTimeout(failsafe);
  }, [isLoading, setGlobalLoading]);

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
    // Only update tab title if a custom SEO Title is loaded from database.
    // If empty (during initial load), it stays with the hardcoded title in index.html.
    if (seoTitle) {
      document.title = seoTitle;

      // Sync titles for social sharing
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', seoTitle);
      
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) twitterTitle.setAttribute('content', seoTitle);
    }
  }, [seoTitle]);

  useEffect(() => {
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.getElementsByTagName('head')[0].appendChild(metaDesc);
    }
    
    const finalDesc = seoDescription || 'EDU Lexonex is a professional binary trading academy offering advanced trading courses, live trading sessions, VIP signals, and a powerful smart money management system.';
    metaDesc.setAttribute('content', finalDesc);

    // Social Fallbacks
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', finalDesc);
    
    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute('content', finalDesc);
  }, [seoDescription]);

  useEffect(() => {
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.getElementsByTagName('head')[0].appendChild(metaKeywords);
    }
    
    const finalKeywords = seoKeywords || 'EDU Lexonex, binary trading academy, binary trading course, live trading sessions, VIP trading signals, smart money management';
    metaKeywords.setAttribute('content', finalKeywords);
  }, [seoKeywords]);

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

      // Update Social Images
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) ogImage.setAttribute('content', url);
      const twitterImage = document.querySelector('meta[name="twitter:image"]');
      if (twitterImage) twitterImage.setAttribute('content', url);
    };

    if (faviconURL) {
      updateFavicon(faviconURL);
    } else {
      // Default to public/favicon.svg
      updateFavicon("/favicon.svg");
    }
  }, [faviconURL]);

  return (
    <>
      <CyberBackground />
      <HUDNotification />
      {/* Show GlobalLoader if either store says we are loading */}
      {(isLoading || isGlobalLoading) && <GlobalLoader />}
      
      {!isLoading && (
        <Router>
          {!isAuthenticated ? (
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/contact" element={<ContactUsPage />} />
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
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="/category/:categoryName" element={<PermissionViewPage />} />
                
                <Route path="/money-management" element={<MoneyManagementPage />} />
                <Route path="/money-management-history" element={<MoneyManagementHistory />} />
  
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
      )}
    </>
  );
};

export default App;
