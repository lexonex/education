import { create } from 'zustand';
import { MoneyManagementSession } from '../types';
import { db, getPath } from '../lib/firebase';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';

interface MoneyManagementState {
  activeSession: MoneyManagementSession | null;
  historySessions: MoneyManagementSession[];
  settings: {
    totalEvents: number;
    expectedWins: number;
    odds: number;
  } | null;
  isDataLoaded: boolean;
  isHistoryLoaded: boolean;
  
  fetchActiveData: (userId: string) => Promise<void>;
  fetchHistoryData: (userId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
}

export const useMoneyManagementStore = create<MoneyManagementState>((set, get) => ({
  activeSession: null,
  historySessions: [],
  settings: null,
  isDataLoaded: false,
  isHistoryLoaded: false,

  fetchActiveData: async (userId: string) => {
    console.log('Fetching active data for user:', userId);
    if (!userId) {
      console.warn('fetchActiveData called with empty userId');
      set({ isDataLoaded: true });
      return;
    }
    try {
      // Fetch sessions
      const path = getPath('money_management_sessions');
      console.log('Querying path:', path);
      const sessionsRef = collection(db, path);
      const q = query(sessionsRef, where('userId', '==', userId));
      const snap = await getDocs(q);
      console.log('Sessions found:', snap.size);
      
      const allSessions = snap.docs.map(d => ({ id: d.id, ...d.data() } as MoneyManagementSession));
      
      const getTimestamp = (s: MoneyManagementSession) => {
        const createdAt = s.createdAt as any;
        if (createdAt?.toDate) return createdAt.toDate().getTime();
        if (typeof createdAt === 'string') return new Date(createdAt).getTime();
        if (createdAt?.seconds) return createdAt.seconds * 1000;
        return 0;
      };

      const active = allSessions
        .filter(s => s.status?.toUpperCase() === 'ACTIVE')
        .sort((a, b) => getTimestamp(b) - getTimestamp(a))[0];
      
      console.log('Active session:', active);

      // Fetch settings
      const qSettings = query(collection(db, getPath('money_management_settings')), where('userId', '==', userId));
      const settingsSnap = await getDocs(qSettings);
      let settings = null;
      if (!settingsSnap.empty) {
        const s = settingsSnap.docs[0].data();
        settings = {
          totalEvents: s.totalEvents || 15,
          expectedWins: s.expectedWins || 6,
          odds: s.odds || 1.90
        };
      }

      set({ activeSession: active || null, settings, isDataLoaded: true });
    } catch (err) {
      console.error('Error fetching Money Management active data:', err);
      set({ isDataLoaded: true }); // Prevent infinite loading
    }
  },

  fetchHistoryData: async (userId: string) => {
    console.log('Fetching history data for user:', userId);
    if (!userId) {
      console.warn('fetchHistoryData called with empty userId');
      set({ isHistoryLoaded: true });
      return;
    }
    try {
      const path = getPath('money_management_sessions');
      const sessionsRef = collection(db, path);
      const q = query(sessionsRef, where('userId', '==', userId));
      const snap = await getDocs(q);
      console.log('History sessions found:', snap.size);
      const allSessions = snap.docs.map(d => ({ id: d.id, ...d.data() } as MoneyManagementSession));
      
      const getTimestamp = (s: MoneyManagementSession) => {
        const createdAt = s.createdAt as any;
        if (createdAt?.toDate) return createdAt.toDate().getTime();
        if (typeof createdAt === 'string') return new Date(createdAt).getTime();
        if (createdAt?.seconds) return createdAt.seconds * 1000;
        return 0;
      };

      const history = allSessions
        .filter(s => ['COMPLETED', 'FAILED', 'ACTIVE'].includes(s.status?.toUpperCase()))
        .sort((a, b) => getTimestamp(b) - getTimestamp(a));

      set({ historySessions: history, isHistoryLoaded: true });
    } catch (err) {
      console.error('Error fetching Money Management history data:', err);
      set({ isHistoryLoaded: true });
    }
  },

  deleteSession: async (sessionId: string) => {
    try {
      await deleteDoc(doc(db, getPath('money_management_sessions'), sessionId));
      
      set(state => ({
        historySessions: state.historySessions.filter(s => s.id !== sessionId),
        activeSession: state.activeSession?.id === sessionId ? null : state.activeSession
      }));
    } catch (err) {
      console.error('Error deleting Money Management session:', err);
      throw err;
    }
  }
}));
