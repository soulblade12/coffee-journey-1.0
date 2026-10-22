import { create } from 'zustand';

let toastTimer = null;

export const useUiStore = create((set) => ({
  activeTab: 'map', // 'map' | 'journal' | 'scrap' | 'quest'
  quickCheckinDraft: null, // Draft object for 30s quick check-in modal
  fullForm: null, // { id?: string, draft?: object } | null
  detailId: null, // ID of visit to show in Detail Modal
  scrapId: null, // ID of visit active in Scrapbook
  mapFocus: null, // { lat, lng }
  toast: '',

  setActiveTab: (tab) => {
    set({ activeTab: tab });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },

  openQuickCheckin: (draft) => set({ quickCheckinDraft: draft, fullForm: null }),
  closeQuickCheckin: () => set({ quickCheckinDraft: null }),

  openFullForm: (options = {}) => set({ fullForm: options, quickCheckinDraft: null }),
  closeFullForm: () => set({ fullForm: null }),

  openDetail: (id) => set({ detailId: id }),
  closeDetail: () => set({ detailId: null }),

  setScrapId: (id) => set({ scrapId: id }),
  setMapFocus: (focus) => set({ mapFocus: focus }),

  showToast: (msg) => {
    set({ toast: msg });
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      set({ toast: '' });
    }, 3800);
  },
}));
