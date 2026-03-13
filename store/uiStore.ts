
import { create } from 'zustand';

export type NotificationType = 'SUCCESS' | 'ERROR' | 'INFO' | 'WARNING';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title: string;
}

interface UIState {
  isGlobalLoading: boolean;
  notifications: Notification[];
  setGlobalLoading: (loading: boolean) => void;
  addNotification: (type: NotificationType, title: string, message: string) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Set to true by default for startup loading
  isGlobalLoading: true,
  notifications: [],
  setGlobalLoading: (isGlobalLoading) => set({ isGlobalLoading }),
  addNotification: (type, title, message) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      notifications: [...state.notifications, { id, type, title, message }]
    }));
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      }));
    }, 5000);
  },
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id)
  }))
}));
