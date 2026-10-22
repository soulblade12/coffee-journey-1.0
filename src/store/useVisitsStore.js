import { create } from 'zustand';
import {
  getAllVisits,
  putVisit,
  patchVisit,
  deleteVisit,
  bulkPutVisits,
} from '@/data/visitsRepo';
import { computeUserStats, BADGES, earnedBadges } from '@/features/gamification/lib';
import { confetti } from '@/shared/lib/confetti';
import { uid } from '@/shared/lib/id';

export const useVisitsStore = create((set, get) => ({
  visits: [],
  loading: true,

  fetchVisits: async () => {
    try {
      const data = await getAllVisits();
      set({ visits: data, loading: false });
    } catch (err) {
      console.error('Failed to load visits:', err);
      set({ visits: [], loading: false });
    }
  },

  saveVisit: async (data, isEditId = null) => {
    const { visits } = get();
    const beforeStats = computeUserStats(visits);
    const hadBadges = earnedBadges(beforeStats);

    const record = isEditId
      ? { ...visits.find((v) => v.id === isEditId), ...data, id: isEditId }
      : {
          id: uid(),
          created: Date.now(),
          ...data,
        };

    await putVisit(record);
    const updated = isEditId
      ? visits.map((v) => (v.id === isEditId ? record : v))
      : [record, ...visits];

    set({ visits: updated });

    const afterStats = computeUserStats(updated);
    const newlyEarned = BADGES.filter(
      (b) => earnedBadges(afterStats).has(b.id) && !hadBadges.has(b.id)
    );

    const xpDelta = afterStats.xp - beforeStats.xp;
    let toastMessage = `+${Math.max(0, xpDelta)} XP dicatat`;

    if (afterStats.level > beforeStats.level) {
      toastMessage += ` · Naik ke Level ${afterStats.level}!`;
    }
    if (newlyEarned.length > 0) {
      toastMessage += ` · Lencana Baru: ${newlyEarned.map((b) => b.name).join(', ')}`;
    }

    confetti(afterStats.level > beforeStats.level || newlyEarned.length > 0 ? 90 : 35);
    return { record, toastMessage };
  },

  patchVisitRecord: async (id, patch) => {
    const updatedRecord = await patchVisit(id, patch);
    set((state) => ({
      visits: state.visits.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    }));
    return updatedRecord;
  },

  removeVisitRecord: async (id) => {
    await deleteVisit(id);
    set((state) => ({
      visits: state.visits.filter((v) => v.id !== id),
    }));
    return true;
  },

  importVisitsList: async (list) => {
    await bulkPutVisits(list);
    const fresh = await getAllVisits();
    set({ visits: fresh });
    confetti(50);
    return true;
  },
}));
