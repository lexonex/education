import { create } from 'zustand';
import { ResourceAnalyticsSession } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';

interface AnalyticsState {
  activeSession: ResourceAnalyticsSession | null;
  historySessions: ResourceAnalyticsSession[];
  settings: {
    totalEvents: number;
    expectedSuccess: number;
    ratio: number;
  } | null;
  isDataLoaded: boolean;
  isHistoryLoaded: boolean;
  
  fetchActiveData: (adminId: string, userId: string) => Promise<void>;
  fetchHistoryData: (adminId: string, userId: string) => Promise<void>;
  deleteSession: (adminId: string, sessionId: string) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  activeSession: null,
  historySessions: [],
  settings: null,
  isDataLoaded: false,
  isHistoryLoaded: false,

  fetchActiveData: async (adminId: string, userId: string) => {
    try {
      // Fetch sessions
      const sessionsRef = collection(db, `admins/${adminId}/analytics_sessions`);
      const q = query(sessionsRef, where('userId', '==', userId));
      const snap = await getDocs(q);
      const allSessions = snap.docs.map(d => ({ id: d.id, ...d.data() } as ResourceAnalyticsSession));
      
      const getTimestamp = (s: ResourceAnalyticsSession) => {
        const createdAt = s.createdAt as any;
        if (createdAt?.toDate) return createdAt.toDate().getTime();
        if (typeof createdAt === 'string') return new Date(createdAt).getTime();
        if (createdAt?.seconds) return createdAt.seconds * 1000;
        return 0;
      };

      const active = allSessions
        .filter(s => s.status === 'ACTIVE')
        .sort((a, b) => getTimestamp(b) - getTimestamp(a))[0];

      // Fetch settings
      const qSettings = query(collection(db, `admins/${adminId}/analytics_settings`), where('userId', '==', userId));
      const settingsSnap = await getDocs(qSettings);
      let settings = null;
      if (!settingsSnap.empty) {
        const s = settingsSnap.docs[0].data();
        settings = {
          totalEvents: s.totalEvents || 15,
          expectedSuccess: s.expectedSuccess || 6,
          ratio: s.ratio || 1.90
        };
      }

      set({ activeSession: active || null, settings, isDataLoaded: true });
    } catch (err) {
      console.error('Error fetching analytics active data:', err);
      set({ isDataLoaded: true });
    }
  },

  fetchHistoryData: async (adminId: string, userId: string) => {
    try {
      const sessionsRef = collection(db, `admins/${adminId}/analytics_sessions`);
      const q = query(sessionsRef, where('userId', '==', userId));
      const snap = await getDocs(q);
      const allSessions = snap.docs.map(d => ({ id: d.id, ...d.data() } as ResourceAnalyticsSession));
      
      const getTimestamp = (s: ResourceAnalyticsSession) => {
        const createdAt = s.createdAt as any;
        if (createdAt?.toDate) return createdAt.toDate().getTime();
        if (typeof createdAt === 'string') return new Date(createdAt).getTime();
        if (createdAt?.seconds) return createdAt.seconds * 1000;
        return 0;
      };

      const history = allSessions
        .filter(s => s.status === 'COMPLETED' || s.status === 'FAILED' || s.status === 'ACTIVE')
        .sort((a, b) => getTimestamp(b) - getTimestamp(a));

      set({ historySessions: history, isHistoryLoaded: true });
    } catch (err) {
      console.error('Error fetching analytics history data:', err);
      set({ isHistoryLoaded: true });
    }
  },

  deleteSession: async (adminId: string, sessionId: string) => {
    try {
      await deleteDoc(doc(db, `admins/${adminId}/analytics_sessions`, sessionId));
      
      set(state => ({
        historySessions: state.historySessions.filter(s => s.id !== sessionId),
        activeSession: state.activeSession?.id === sessionId ? null : state.activeSession
      }));
    } catch (err) {
      console.error('Error deleting analytics session:', err);
      throw err;
    }
  }
}));
