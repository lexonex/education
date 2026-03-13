
import { create } from 'zustand';
import { User, UserRole, UserStatus } from '../types';
import { auth, db, getPath } from '../lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, limit } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useUIStore } from './uiStore';
import { useDataStore } from './dataStore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (firebaseUser: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  toggleBookmark: (docId: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (firebaseUser) => {
    if (!firebaseUser) {
      set({ isLoading: false, user: null, isAuthenticated: false });
      return;
    }

    useUIStore.getState().setGlobalLoading(true);

    try {
      const mappingRef = doc(db, getPath('user_mappings'), firebaseUser.uid);
      const mappingSnap = await getDoc(mappingRef);

      let userData: User | null = null;

      if (!mappingSnap.exists()) {
        // Check if any admin exists. If not, this is the first user and should be admin.
        // Otherwise, this is an unmapped user and should not be allowed in.
        const adminsRef = collection(db, getPath('admins'));
        const adminsSnap = await getDocs(query(adminsRef, limit(1)));
        
        if (adminsSnap.empty) {
          userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            role: UserRole.ADMIN,
            status: UserStatus.APPROVED,
            displayName: firebaseUser.displayName || 'Root Admin',
            permissions: { allAccess: true, categories: [] },
            bookmarks: []
          };
          
          await setDoc(mappingRef, { role: UserRole.ADMIN, adminId: firebaseUser.uid });
          await setDoc(doc(db, getPath('admins'), firebaseUser.uid), userData);
        } else {
          await signOut(auth);
          useUIStore.getState().addNotification('ERROR', 'UNAUTHORIZED', 'Unmapped identity detected. Access denied.');
          set({ user: null, isAuthenticated: false, isLoading: false });
          useUIStore.getState().setGlobalLoading(false);
          return;
        }
      } else {
        const { role, adminId } = mappingSnap.data();
        const profilePath = role === UserRole.ADMIN 
          ? getPath(`admins/${firebaseUser.uid}`) 
          : getPath(`admins/${adminId}/students/${firebaseUser.uid}`);
        
        const profileSnap = await getDoc(doc(db, profilePath));
        
        if (profileSnap.exists()) {
          const profile = profileSnap.data() as User;
          
          if (profile.role === UserRole.STUDENT && profile.status !== UserStatus.APPROVED) {
            await signOut(auth);
            let message = 'Account awaiting administrator approval.';
            let title = 'ACCESS_DENIED';
            
            if (profile.status === UserStatus.SUSPENDED) {
              message = 'Your account has been suspended. Contact administrator.';
              title = 'ACCOUNT_SUSPENDED';
            }
            
            useUIStore.getState().addNotification('ERROR', title, message);
            set({ user: null, isAuthenticated: false, isLoading: false });
            useUIStore.getState().setGlobalLoading(false);
            return;
          }
          
          userData = profile;
        } else {
          await signOut(auth);
          set({ user: null, isAuthenticated: false, isLoading: false });
          useUIStore.getState().setGlobalLoading(false);
          return;
        }
      }

      if (userData) {
        set({ user: userData, isAuthenticated: true, isLoading: false });
        useUIStore.getState().addNotification('SUCCESS', 'GRANTED', `Welcome back, ${userData.displayName}.`);
        // Add a small delay to ensure the dashboard is ready before hiding loader
        setTimeout(() => useUIStore.getState().setGlobalLoading(false), 1000);
      } else {
        set({ isLoading: false });
        useUIStore.getState().setGlobalLoading(false);
      }
    } catch (e: any) {
      console.error("Critical Auth Sync Error:", e);
      if (e.code === 'unavailable' || e.message?.includes('offline')) {
         useUIStore.getState().addNotification('ERROR', 'NETWORK_ERROR', 'Connection to neural network failed. Check signal.');
      }
      set({ isLoading: false });
      useUIStore.getState().setGlobalLoading(false);
    }
  },

  logout: async () => {
    const currentUser = get().user;
    if (currentUser) {
      useDataStore.getState().addLog('AUTH_EXIT', currentUser.displayName, 'Neural link terminated.');
    }
    useUIStore.getState().setGlobalLoading(true);
    useDataStore.getState().cleanupListeners();
    await signOut(auth);
    set({ user: null, isAuthenticated: false });
    setTimeout(() => useUIStore.getState().setGlobalLoading(false), 500);
  },

  updateUser: (data) => set((state) => ({
    user: state.user ? { ...state.user, ...data } : null
  })),

  toggleBookmark: (docId) => set((state) => {
    if (!state.user) return state;
    const currentBookmarks = state.user.bookmarks || [];
    const isAdding = !currentBookmarks.includes(docId);
    const newBookmarks = isAdding
      ? [...currentBookmarks, docId]
      : currentBookmarks.filter(id => id !== docId);
    
    useDataStore.getState().addLog(isAdding ? 'VAULT_ADD' : 'VAULT_REMOVE', state.user.displayName, `Knowledge node ${docId} modified in vault.`);
    
    return {
      user: { ...state.user, bookmarks: newBookmarks }
    };
  })
}));

onAuthStateChanged(auth, (user) => {
  if (user) {
    useAuthStore.getState().login(user);
  } else {
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
    useUIStore.getState().setGlobalLoading(false);
  }
});
