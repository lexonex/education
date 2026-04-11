
import { create } from 'zustand';
import { User, Category, Document, UserStatus, UserRole, RegistrationToken, SubscriptionCode, TradingPlatform, SubscriptionPlan } from '../types';
import { db, getPath } from '../lib/firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  setDoc,
  increment,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  getDoc,
  writeBatch,
  getDocs
} from 'firebase/firestore';

interface SystemLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

interface DataState {
  isInitialized: boolean;
  students: User[];
  categories: Category[];
  documents: Document[];
  systemLogs: SystemLog[];
  registrationTokens: RegistrationToken[];
  subscriptionCodes: SubscriptionCode[];
  tradingPlatforms: TradingPlatform[];
  subscriptionPlans: SubscriptionPlan[];
  currentAdminId: string | null;
  registrationToken: string;
  registrationKeyRequired: boolean;
  defaultAdminId: string;
  brandingName: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerAddress: string;
  whatsappNumber: string;
  officeHours: string;
  faviconURL: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoImage: string;
  
  initializePublicSettings: () => void;
  initializeListeners: (adminId: string, role: UserRole, userId?: string) => void;
  cleanupListeners: () => void;
  
  addCategory: (cat: Partial<Category>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addDocument: (docData: Partial<Document>) => Promise<void>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  incrementView: (id: string) => Promise<void>;

  registerStudent: (data: any) => Promise<void>;
  updateStudentStatus: (uid: string, status: UserStatus) => Promise<void>;
  updateStudentPermissions: (uid: string, permissions: any) => Promise<void>;
  updateStudent: (uid: string, data: Partial<User>) => Promise<void>;

  generateRegistrationToken: (adminName: string) => Promise<void>;
  revokeRegistrationToken: (id: string) => Promise<void>;
  
  generateSubscriptionCode: (data: { 
    type: 'CATEGORY' | 'MONEY_MANAGEMENT', 
    targetIds?: string[], 
    durationDays: number, 
    expiresAt?: string,
    targetDurations?: Record<string, number>
  }) => Promise<string>;
  suspendSubscriptionCode: (id: string) => Promise<void>;
  redeemSubscriptionCode: (code: string, userId: string) => Promise<void>;
  
  addTradingPlatform: (data: Partial<TradingPlatform>) => Promise<void>;
  updateTradingPlatform: (id: string, updates: Partial<TradingPlatform>) => Promise<void>;
  deleteTradingPlatform: (id: string) => Promise<void>;
  updateTradingPlatformsOrder: (platforms: TradingPlatform[]) => Promise<void>;
  trackPlatformClick: (id: string) => Promise<void>;

  addSubscriptionPlan: (data: Partial<SubscriptionPlan>) => Promise<void>;
  updateSubscriptionPlan: (id: string, updates: Partial<SubscriptionPlan>) => Promise<void>;
  deleteSubscriptionPlan: (id: string) => Promise<void>;
  updateSubscriptionPlansOrder: (plans: SubscriptionPlan[]) => Promise<void>;

  addLog: (action: string, userName: string, details: string) => Promise<void>;
  clearLogs: () => Promise<void>;
  updateSettings: (key: string, name: string, favicon: string, settings: Partial<AdminContactSettings>, registrationKeyRequired: boolean, defaultAdminId: string, seoTitle: string, seoDescription: string, seoKeywords: string, seoImage: string) => Promise<void>;
  updateLastActive: (uid: string) => Promise<void>;
}

interface AdminContactSettings {
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerAddress: string;
  whatsappNumber: string;
  officeHours: string;
}

let unsubscribers: (() => void)[] = [];
let publicUnsub: (() => void) | null = null;

const firebaseConfig = {
  apiKey: "AIzaSyD2GZkyQBir2wQIBilCXogyT3gz8QRVKgI",
  authDomain: "edu-lexonex.firebaseapp.com",
  projectId: "edu-lexonex",
  storageBucket: "edu-lexonex.firebasestorage.app",
  messagingSenderId: "47491392874",
  appId: "1:47491392874:web:b2d040ba976f17bebe7113"
};

const DEFAULT_BRANDING_NAME = 'EDU LEXONEX';

export const useDataStore = create<DataState>((set, get) => ({
  isInitialized: false,
  students: [],
  categories: [],
  documents: [],
  systemLogs: [],
  registrationTokens: [],
  subscriptionCodes: [],
  tradingPlatforms: [],
  subscriptionPlans: [],
  currentAdminId: null,
  registrationToken: 'BSEMS-8821',
  registrationKeyRequired: true,
  defaultAdminId: '',
  brandingName: DEFAULT_BRANDING_NAME,
  ownerName: 'Admin Root',
  ownerPhone: '+8801XXXXXXX',
  ownerEmail: 'support@domain.com',
  ownerAddress: 'Global Grid Sector 01',
  whatsappNumber: '+8801XXXXXXX',
  officeHours: 'Sat - Thu: 09:00 - 18:00',
  faviconURL: '',
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  seoImage: '',

  initializePublicSettings: () => {
    if (publicUnsub) return;
    
    publicUnsub = onSnapshot(doc(db, getPath('system_config'), 'branding'), (snapshot) => {
      const data = snapshot.data();
      if (data) {
        set({ 
          brandingName: data.brandingName || DEFAULT_BRANDING_NAME,
          registrationToken: data.masterKey || 'BSEMS-8821',
          registrationKeyRequired: data.registrationKeyRequired ?? true,
          defaultAdminId: data.defaultAdminId || '',
          ownerName: data.ownerName || 'Admin Root',
          ownerPhone: data.ownerPhone || '+8801XXXXXXX',
          ownerEmail: data.ownerEmail || 'support@domain.com',
          ownerAddress: data.ownerAddress || 'Global Grid Sector 01',
          whatsappNumber: data.whatsappNumber || '+8801XXXXXXX',
          officeHours: data.officeHours || 'Sat - Thu: 09:00 - 18:00',
          faviconURL: data.faviconURL || '',
          seoTitle: data.seoTitle || '',
          seoDescription: data.seoDescription || '',
          seoKeywords: data.seoKeywords || '',
          seoImage: data.seoImage || '',
          isInitialized: true
        });
      } else {
        set({ isInitialized: true });
      }
    }, (error) => {
      // Silent fail for public settings to avoid permission errors on landing
      console.warn("Public settings fetch restricted:", error.message);
      set({ isInitialized: true });
    });

    const platformsUnsub = onSnapshot(query(collection(db, getPath('trading_platforms')), where("status", "==", "ACTIVE")), (snapshot) => {
      const platforms = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as TradingPlatform));
      set({ tradingPlatforms: platforms.sort((a, b) => (a.order || 0) - (b.order || 0)) });
    }, (err) => console.warn("Platforms public fetch restricted:", err.message));

    const plansUnsub = onSnapshot(query(collection(db, getPath('subscription_plans')), where("status", "==", "ACTIVE")), (snapshot) => {
      const plans = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as SubscriptionPlan));
      set({ subscriptionPlans: plans.sort((a, b) => (a.order || 0) - (b.order || 0)) });
    }, (err) => console.warn("Plans public fetch restricted:", err.message));
    unsubscribers.push(platformsUnsub, plansUnsub);
  },

  initializeListeners: (adminId: string, role: UserRole, userId?: string) => {
    if (!adminId) return;
    
    get().cleanupListeners();
    set({ currentAdminId: adminId });

    try {
      const adminUnsub = onSnapshot(doc(db, getPath(`admins/${adminId}`)), (snapshot) => {
        const data = snapshot.data();
        if (data) {
          set({ 
            brandingName: data.brandingName || DEFAULT_BRANDING_NAME,
            registrationToken: data.masterKey || 'BSEMS-8821',
            registrationKeyRequired: data.registrationKeyRequired ?? true,
            defaultAdminId: data.defaultAdminId || '',
            ownerName: data.ownerName || 'Admin Root',
            ownerPhone: data.ownerPhone || '+8801XXXXXXX',
            ownerEmail: data.ownerEmail || 'support@domain.com',
            ownerAddress: data.ownerAddress || 'Global Grid Sector 01',
            whatsappNumber: data.whatsappNumber || '+8801XXXXXXX',
            officeHours: data.officeHours || 'Sat - Thu: 09:00 - 18:00',
            faviconURL: data.faviconURL || '',
            seoTitle: data.seoTitle || '',
            seoDescription: data.seoDescription || '',
            seoKeywords: data.seoKeywords || '',
            seoImage: data.seoImage || ''
          });
        }
      }, (err) => console.warn("Admin profile fetch restricted:", err.message));

      const categoriesUnsub = onSnapshot(collection(db, getPath(`admins/${adminId}/categories`)), (snapshot) => {
        set({ categories: snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Category)) });
      }, (err) => console.warn("Categories fetch restricted:", err.message));

      const docsRef = collection(db, getPath(`admins/${adminId}/documents`));
      const docsQuery = role === UserRole.ADMIN ? docsRef : query(docsRef, where("status", "==", "PUBLISHED"));
      
      const documentsUnsub = onSnapshot(docsQuery, (snapshot) => {
        set({ documents: snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Document)) });
      }, (err) => console.warn("Documents fetch restricted:", err.message));

      const platformsUnsub = onSnapshot(collection(db, getPath('trading_platforms')), (snapshot) => {
        const platforms = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as TradingPlatform));
        set({ tradingPlatforms: platforms.sort((a, b) => (a.order || 0) - (b.order || 0)) });
      }, (err) => console.warn("Platforms fetch restricted:", err.message));
      unsubscribers.push(platformsUnsub);

      const plansUnsub = onSnapshot(collection(db, getPath('subscription_plans')), (snapshot) => {
        const plans = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as SubscriptionPlan));
        set({ subscriptionPlans: plans.sort((a, b) => (a.order || 0) - (b.order || 0)) });
      }, (err) => console.warn("Plans fetch restricted:", err.message));
      unsubscribers.push(plansUnsub);

      unsubscribers.push(adminUnsub, categoriesUnsub, documentsUnsub);

      if (role === UserRole.ADMIN) {
        const studentsUnsub = onSnapshot(collection(db, getPath(`admins/${adminId}/students`)), (snapshot) => {
          set({ students: snapshot.docs.map(d => ({ ...d.data(), uid: d.id } as User)) });
        }, (err) => console.warn("Students fetch restricted:", err.message));

        const keysQuery = query(collection(db, getPath("registration_keys")), where("adminId", "==", adminId));
        const keysUnsub = onSnapshot(keysQuery, (snapshot) => {
           set({ registrationTokens: snapshot.docs.map(d => ({ ...d.data(), id: d.id } as RegistrationToken)) });
        }, (err) => console.warn("Keys fetch restricted:", err.message));

        const subCodesQuery = query(collection(db, getPath("subscription_codes")), where("adminId", "==", adminId));
        const subCodesUnsub = onSnapshot(subCodesQuery, (snapshot) => {
          set({ subscriptionCodes: snapshot.docs.map(d => ({ ...d.data(), id: d.id } as SubscriptionCode)) });
        }, (err) => console.warn("Codes fetch restricted:", err.message));

        const logsQuery = query(collection(db, getPath(`admins/${adminId}/logs`)), orderBy('timestamp', 'desc'), limit(100));
        const logsUnsub = onSnapshot(logsQuery, (snapshot) => {
          set({ systemLogs: snapshot.docs.map(d => ({ ...d.data(), id: d.id } as SystemLog)) });
        }, (err) => console.warn("Logs fetch restricted:", err.message));

        unsubscribers.push(studentsUnsub, keysUnsub, subCodesUnsub, logsUnsub);
      } else if (role === UserRole.STUDENT && userId) {
        // For students, listen to their own profile to keep it synced
        const studentUnsub = onSnapshot(doc(db, getPath(`admins/${adminId}/students/${userId}`)), (snapshot) => {
          if (snapshot.exists()) {
            set({ students: [{ ...snapshot.data(), uid: snapshot.id } as User] });
          }
        }, (err) => console.warn("Student profile fetch restricted:", err.message));

        const mySubCodesQuery = query(collection(db, getPath("subscription_codes")), where("usedBy", "==", userId));
        const mySubCodesUnsub = onSnapshot(mySubCodesQuery, (snapshot) => {
          set({ subscriptionCodes: snapshot.docs.map(d => ({ ...d.data(), id: d.id } as SubscriptionCode)) });
        }, (err) => console.warn("My codes fetch restricted:", err.message));

        unsubscribers.push(studentUnsub, mySubCodesUnsub);
      }
    } catch (err) {
      console.error("Failed to initialize listeners:", err);
    }
  },

  cleanupListeners: () => {
    unsubscribers.forEach(unsub => {
      try { unsub(); } catch (e) { console.error("Cleanup failed:", e); }
    });
    unsubscribers = [];
    if (publicUnsub) {
      try { publicUnsub(); } catch (e) { console.error("Public cleanup failed:", e); }
      publicUnsub = null;
    }
    set({ currentAdminId: null, students: [], categories: [], documents: [], registrationTokens: [], systemLogs: [], tradingPlatforms: [], subscriptionPlans: [] });
  },

  addLog: async (action, userName, details) => {
    const adminId = get().currentAdminId;
    if (!adminId) return;

    try {
      await addDoc(collection(db, getPath(`admins/${adminId}/logs`)), {
        action,
        user: userName,
        details,
        timestamp: new Date().toISOString()
      });
    } catch (e: any) {
      if (!e.message?.includes('already exists')) {
        console.error("Log Write Failed:", e);
      }
    }
  },

  clearLogs: async () => {
    const adminId = get().currentAdminId;
    if (!adminId) return;

    try {
      const logsRef = collection(db, getPath(`admins/${adminId}/logs`));
      const snapshot = await getDocs(logsRef);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => {
        batch.delete(d.ref);
      });
      
      await batch.commit();
      await get().addLog('LOG_PURGE', 'Admin', 'Institutional activity logs wiped successfully.');
    } catch (e) {
      console.error("Failed to clear logs:", e);
      throw e;
    }
  },

  updateSettings: async (key, name, favicon, settings, registrationKeyRequired, defaultAdminId, seoTitle, seoDescription, seoKeywords, seoImage) => {
    const adminId = get().currentAdminId;
    if (!adminId) return;
    
    const updateData: any = {
      brandingName: name,
      masterKey: key,
      faviconURL: favicon,
      registrationKeyRequired,
      defaultAdminId,
      seoTitle,
      seoDescription,
      seoKeywords,
      seoImage,
      ...settings
    };

    await updateDoc(doc(db, getPath(`admins/${adminId}`)), updateData);
    await setDoc(doc(db, getPath('system_config'), 'branding'), updateData, { merge: true });
    
    set({ 
      brandingName: name || DEFAULT_BRANDING_NAME, 
      registrationToken: key, 
      faviconURL: favicon, 
      registrationKeyRequired, 
      defaultAdminId, 
      seoTitle, 
      seoDescription, 
      seoKeywords, 
      seoImage,
      ...settings 
    });
  },

  updateLastActive: async (uid) => {
    if (!uid) return;
    const mappingRef = doc(db, getPath('user_mappings'), uid);
    const mappingSnap = await getDoc(mappingRef);
    if (!mappingSnap.exists()) return;
    
    const { role, adminId } = mappingSnap.data();
    const now = new Date().toISOString();
    
    const profilePath = role === UserRole.ADMIN ? doc(db, getPath('admins'), uid) : doc(db, getPath(`admins/${adminId}/students`), uid);
    
    try {
      await updateDoc(profilePath, { lastActive: now });
    } catch (e) {
      console.warn("Failed to update lastActive:", e);
    }
  },

  registerStudent: async (data) => {
    const adminId = get().currentAdminId;
    if (!adminId) return;

    const secondaryApp = initializeApp(firebaseConfig, `secondary-${Date.now()}`);
    const secondaryAuth = getAuth(secondaryApp);

    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, data.email, data.password);
      const uid = userCredential.user.uid;

      const profile = {
        uid,
        email: data.email,
        displayName: data.displayName,
        username: data.username,
        photoURL: data.photoURL || '',
        role: UserRole.STUDENT,
        status: data.status || UserStatus.APPROVED,
        adminId: adminId,
        permissions: { allAccess: false, categories: [] },
        bookmarks: []
      };

      await setDoc(doc(db, getPath(`admins/${adminId}/students`), uid), profile);
      await setDoc(doc(db, getPath('user_mappings'), uid), { 
        role: UserRole.STUDENT, 
        adminId: adminId,
        photoURL: data.photoURL || '',
        displayName: data.displayName
      });
      
      await get().addLog('USER_REG', 'System', `Provisioned node: ${data.displayName}`);
      await signOut(secondaryAuth);
    } finally {
      await deleteApp(secondaryApp);
    }
  },

  addCategory: async (cat) => {
    const adminId = get().currentAdminId;
    if (!adminId) return;
    const serialNumber = `SN: CAT-${Math.floor(100000 + Math.random() * 900000)}`;
    const createdAt = new Date().toISOString();
    await addDoc(collection(db, getPath(`admins/${adminId}/categories`)), { ...cat, adminId, serialNumber, createdAt });
    await get().addLog('CAT_ADD', 'Admin', `Created namespace: ${cat.name} [${serialNumber}]`);
  },

  updateCategory: async (id, updates) => {
    const adminId = get().currentAdminId;
    if (!adminId) return;
    await updateDoc(doc(db, getPath(`admins/${adminId}/categories`), id), updates);
    await get().addLog('CAT_UPDATE', 'Admin', `Modified namespace: ${id}`);
  },

  deleteCategory: async (id) => {
    const adminId = get().currentAdminId;
    if (!adminId) return;
    await deleteDoc(doc(db, getPath(`admins/${adminId}/categories`), id));
    await get().addLog('CAT_DELETE', 'Admin', `Erased namespace: ${id}`);
  },

  addDocument: async (docData) => {
    const adminId = get().currentAdminId;
    if (!adminId) return;
    const serialNumber = `SN: DOC-${Math.floor(100000 + Math.random() * 900000)}`;
    await addDoc(collection(db, getPath(`admins/${adminId}/documents`)), { ...docData, adminId, serialNumber, createdAt: new Date().toISOString() });
    await get().addLog('DOC_CREATE', 'Admin', `Initialized asset: ${docData.title} [${serialNumber}]`);
  },

  updateDocument: async (id, updates) => {
    const adminId = get().currentAdminId;
    if (!adminId) return;
    await updateDoc(doc(db, getPath(`admins/${adminId}/documents`), id), updates);
    await get().addLog('DOC_UPDATE', 'Admin', `Synchronized asset: ${id}`);
  },

  deleteDocument: async (id) => {
    const adminId = get().currentAdminId;
    if (!adminId) return;
    await deleteDoc(doc(db, getPath(`admins/${adminId}/documents`), id));
    await get().addLog('DOC_DELETE', 'Admin', `Purged asset: ${id}`);
  },

  incrementView: async (id) => {
    const adminId = get().currentAdminId;
    if (!adminId) return;
    await updateDoc(doc(db, getPath(`admins/${adminId}/documents`), id), { viewCount: increment(1) });
  },

  updateStudentStatus: async (uid, status) => {
    const adminId = get().currentAdminId;
    if (!adminId) return;
    await updateDoc(doc(db, getPath(`admins/${adminId}/students`), uid), { status });
    await get().addLog('STATUS_OVERRIDE', 'Admin', `Node ${uid} set to ${status}`);
  },

  updateStudentPermissions: async (uid, permissions) => {
    const adminId = get().currentAdminId;
    if (!adminId) return;
    await updateDoc(doc(db, getPath(`admins/${adminId}/students`), uid), { permissions });
    await get().addLog('AUTH_MOD', 'Admin', `Access updated for node ${uid}`);
  },

  updateStudent: async (uid, data) => {
    if (!uid) throw new Error("Missing Identity UID for sync.");
    const mappingRef = doc(db, getPath('user_mappings'), uid);
    const mappingSnap = await getDoc(mappingRef);
    if (!mappingSnap.exists()) throw new Error(`Node [${uid}] unmapped.`);
    const { role, adminId } = mappingSnap.data();

    const updatePayload: any = {};
    if (data.displayName !== undefined) updatePayload.displayName = data.displayName;
    if (data.username !== undefined) updatePayload.username = data.username;
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.address !== undefined) updatePayload.address = data.address;
    if (data.photoURL !== undefined) updatePayload.photoURL = data.photoURL;

    const tasks = [];
    const profilePath = role === UserRole.ADMIN ? doc(db, getPath('admins'), uid) : doc(db, getPath(`admins/${adminId}/students`), uid);
    tasks.push(updateDoc(profilePath, updatePayload));

    if (data.photoURL !== undefined || data.displayName !== undefined) {
      tasks.push(updateDoc(mappingRef, { 
        ...(data.photoURL !== undefined && { photoURL: data.photoURL }),
        ...(data.displayName !== undefined && { displayName: data.displayName })
      }));
    }

    await Promise.all(tasks);
    await get().addLog('IDENTITY_SYNC', 'User', `Node ${uid} updated profile.`);
  },

  generateRegistrationToken: async (adminName) => {
    const adminId = get().currentAdminId;
    if (!adminId) return;
    const keyString = `REG-${Math.floor(100000 + Math.random() * 900000)}`;
    const keyData = {
      key: keyString,
      status: 'ACTIVE',
      generatedBy: adminName,
      adminId: adminId,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, getPath('registration_keys'), keyString), keyData);
    await get().addLog('TOKEN_GEN', adminName, `Provisioned registration token: ${keyString}`);
  },

  revokeRegistrationToken: async (id) => {
    const adminId = get().currentAdminId;
    if (!adminId) return;
    await updateDoc(doc(db, getPath('registration_keys'), id), { status: 'REVOKED' });
    await get().addLog('TOKEN_REVOKE', 'Admin', `Token ${id} revoked.`);
  },

  generateSubscriptionCode: async (data) => {
    const adminId = get().currentAdminId;
    if (!adminId) throw new Error("Admin context required");
    
    const codeNum = Math.floor(100000 + Math.random() * 900000);
    const codeString = `SUB-${codeNum}`;
    
    const codeData: SubscriptionCode = {
      id: codeString,
      code: codeString,
      type: data.type,
      targetIds: data.targetIds,
      targetDurations: data.targetDurations,
      durationDays: data.durationDays,
      status: 'ACTIVE',
      expiresAt: data.expiresAt,
      adminId,
      createdAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, getPath('subscription_codes'), codeString), codeData);
    await get().addLog('SUB_CODE_GEN', 'Admin', `Generated subscription code: ${codeString}`);
    return codeString;
  },

  suspendSubscriptionCode: async (id) => {
    await updateDoc(doc(db, getPath('subscription_codes'), id), { status: 'SUSPENDED' });
    await get().addLog('SUB_CODE_SUSPEND', 'Admin', `Suspended subscription code: ${id}`);
  },

  redeemSubscriptionCode: async (code, userId) => {
    let adminId = get().currentAdminId;
    let userRole = UserRole.STUDENT;
    
    const mappingRef = doc(db, getPath('user_mappings'), userId);
    const mappingSnap = await getDoc(mappingRef);
    if (mappingSnap.exists()) {
      const mappingData = mappingSnap.data();
      adminId = mappingData.adminId;
      userRole = mappingData.role || UserRole.STUDENT;
    }

    if (!adminId) throw new Error("Admin context required");

    const codeRef = doc(db, getPath('subscription_codes'), code);
    const codeSnap = await getDoc(codeRef);

    if (!codeSnap.exists()) throw new Error("Invalid code");
    const codeData = codeSnap.data() as SubscriptionCode;

    if (codeData.status === 'USED') throw new Error("This code has already been used");
    if (codeData.status !== 'ACTIVE') throw new Error("Code is no longer active");
    
    if (codeData.expiresAt && new Date(codeData.expiresAt) < new Date()) {
      await updateDoc(codeRef, { status: 'EXPIRED' });
      throw new Error("Code has expired");
    }

    // Grant permission
    const userRef = userRole === UserRole.ADMIN 
      ? doc(db, getPath('admins'), userId)
      : doc(db, getPath(`admins/${adminId}/students`), userId);
      
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error("User profile not found");
    
    const userData = userSnap.data() as User;
    const permissions = userData.permissions || { allAccess: false, categories: [] };
    
    const serialNumber = `SN: SUB-${code.split('-')[1] || code.slice(0, 8)}`;
    
    if (codeData.type === 'MONEY_MANAGEMENT' || (codeData.targetIds && codeData.targetIds.includes('MONEY_MGMT'))) {
      // Robustly parse duration to integer to prevent string concatenation or float issues
      const rawDuration = codeData.targetDurations?.['MONEY_MGMT'] ?? codeData.durationDays;
      const mmDuration = Math.floor(Number(rawDuration));
      
      let mmExpiresAt = new Date();
      // Check if existing subscription is still active and extend it
      if (permissions.moneyManagement?.expiresAt) {
        const existingExpiry = new Date(permissions.moneyManagement.expiresAt);
        if (existingExpiry > new Date()) {
          mmExpiresAt = existingExpiry;
        }
      }
      mmExpiresAt.setDate(mmExpiresAt.getDate() + mmDuration);

      permissions.canAccessMoneyManagement = true;
      permissions.moneyManagement = {
        active: true,
        expiresAt: mmExpiresAt.toISOString(),
        serialNumber,
        grantedAt: new Date().toISOString()
      };
    }
    
    if (codeData.targetIds) {
      codeData.targetIds.forEach(tid => {
        if (tid === 'MONEY_MGMT') return;
        if (!permissions.categories.includes(tid)) {
          permissions.categories.push(tid);
        }
        if (!permissions.categoryPermissions) permissions.categoryPermissions = {};
        
        const rawCatDuration = codeData.targetDurations?.[tid] ?? codeData.durationDays;
        const catDuration = Math.floor(Number(rawCatDuration));
        
        let catExpiresAt = new Date();
        // Check if existing category subscription is still active and extend it
        if (permissions.categoryPermissions[tid]?.expiresAt) {
          const existingExpiry = new Date(permissions.categoryPermissions[tid].expiresAt);
          if (existingExpiry > new Date()) {
            catExpiresAt = existingExpiry;
          }
        }
        catExpiresAt.setDate(catExpiresAt.getDate() + catDuration);

        permissions.categoryPermissions[tid] = {
          active: true,
          expiresAt: catExpiresAt.toISOString(),
          serialNumber,
          grantedAt: new Date().toISOString()
        };
      });
    }

    const batch = writeBatch(db);
    batch.update(userRef, { permissions });
    batch.update(codeRef, { status: 'USED', usedBy: userId, usedAt: new Date().toISOString() });
    
    await batch.commit();
    await get().addLog('SUB_REDEEM', userId, `Redeemed code ${code}. Type: ${codeData.type}, Duration: ${codeData.durationDays}d`);
  },

  addTradingPlatform: async (data) => {
    const adminId = get().currentAdminId;
    if (!adminId) return;
    const currentPlatforms = get().tradingPlatforms;
    const maxOrder = currentPlatforms.length > 0 ? Math.max(...currentPlatforms.map(p => p.order || 0)) : -1;

    await addDoc(collection(db, getPath('trading_platforms')), {
      ...data,
      adminId,
      order: maxOrder + 1,
      clickCount: 0,
      clicksToday: 0,
      createdAt: new Date().toISOString()
    });
    await get().addLog('PLATFORM_ADD', 'Admin', `Added trading platform: ${data.name}`);
  },

  updateTradingPlatform: async (id, updates) => {
    const adminId = get().currentAdminId;
    if (!adminId) return;
    await updateDoc(doc(db, getPath('trading_platforms'), id), updates);
    await get().addLog('PLATFORM_UPDATE', 'Admin', `Updated trading platform: ${id}`);
  },

  deleteTradingPlatform: async (id) => {
    const adminId = get().currentAdminId;
    if (!adminId) return;
    await deleteDoc(doc(db, getPath('trading_platforms'), id));
    await get().addLog('PLATFORM_DELETE', 'Admin', `Deleted trading platform: ${id}`);
  },

  updateTradingPlatformsOrder: async (platforms) => {
    const adminId = get().currentAdminId;
    if (!adminId) return;

    const batch = writeBatch(db);
    platforms.forEach((platform, index) => {
      const platformRef = doc(db, getPath('trading_platforms'), platform.id);
      batch.update(platformRef, { order: index });
    });

    await batch.commit();
    await get().addLog('PLATFORM_REORDER', 'Admin', 'Trading platforms reordered.');
  },

  trackPlatformClick: async (id) => {
    await updateDoc(doc(db, getPath('trading_platforms'), id), {
      clickCount: increment(1),
      clicksToday: increment(1),
      lastClickAt: new Date().toISOString()
    });
  },

  addSubscriptionPlan: async (data) => {
    const adminId = get().currentAdminId;
    if (!adminId) return;
    const currentPlans = get().subscriptionPlans;
    const maxOrder = currentPlans.length > 0 ? Math.max(...currentPlans.map(p => p.order || 0)) : -1;
    
    await addDoc(collection(db, getPath('subscription_plans')), {
      ...data,
      adminId,
      order: maxOrder + 1,
      createdAt: new Date().toISOString()
    });
    await get().addLog('PLAN_ADD', 'Admin', `Added subscription plan: ${data.name}`);
  },

  updateSubscriptionPlan: async (id, updates) => {
    const adminId = get().currentAdminId;
    if (!adminId) return;
    await updateDoc(doc(db, getPath('subscription_plans'), id), updates);
    await get().addLog('PLAN_UPDATE', 'Admin', `Updated subscription plan: ${id}`);
  },

  deleteSubscriptionPlan: async (id) => {
    const adminId = get().currentAdminId;
    if (!adminId) return;
    await deleteDoc(doc(db, getPath('subscription_plans'), id));
    await get().addLog('PLAN_DELETE', 'Admin', `Deleted subscription plan: ${id}`);
  },

  updateSubscriptionPlansOrder: async (plans) => {
    const adminId = get().currentAdminId;
    if (!adminId) return;

    const batch = writeBatch(db);
    plans.forEach((plan, index) => {
      const planRef = doc(db, getPath('subscription_plans'), plan.id);
      batch.update(planRef, { order: index });
    });

    await batch.commit();
    await get().addLog('PLAN_REORDER', 'Admin', 'Subscription plans reordered.');
  },
}));
