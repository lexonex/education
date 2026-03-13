
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyD2GZkyQBir2wQIBilCXogyT3gz8QRVKgI",
  authDomain: "edu-lexonex.firebaseapp.com",
  projectId: "edu-lexonex",
  storageBucket: "edu-lexonex.firebasestorage.app",
  messagingSenderId: "47491392874",
  appId: "1:47491392874:web:b2d040ba976f17bebe7113",
  measurementId: "G-0BZGWP0R3X"
};

// Initialize Firebase App instance using modular SDK named export
const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings for better connectivity in restricted environments
// Using experimentalForceLongPolling can help bypass some network restrictions
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalForceLongPolling: true,
});

// Export instances for Auth, Firestore, and Analytics using modern modular patterns
export const auth = getAuth(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

// Database Root Configuration
// This ensures all data is saved inside an "admin" folder (collection/document structure)
export const DB_ROOT = 'admin/root';

/**
 * Helper to get the full path for a collection or document
 * Ensures all data stays within the admin folder
 */
export const getPath = (path: string) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${DB_ROOT}/${cleanPath}`;
};
