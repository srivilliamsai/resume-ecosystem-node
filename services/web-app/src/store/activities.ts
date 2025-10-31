import { create } from "zustand";

import { activityApi } from "@/api";
import type { Activity } from "@/api/types";

type ActivityState = {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  refresh: (token: string) => Promise<void>;
  upsert: (activity: Activity) => void;
  updateStatus: (id: string, status: Activity["status"]) => void;
  reset: () => void;
};

export const useActivitiesStore = create<ActivityState>((set, get) => ({
  activities: [],
  loading: false,
  error: null,
  async refresh(token: string) {
    set({ loading: true, error: null });
    try {
      const data = await activityApi.list(token);
      set({ activities: data, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load activities", loading: false });
    }
  },
  upsert(activity) {
    const current = get().activities;
    const exists = current.some((item) => item.id === activity.id);
    set({
      activities: exists
        ? current.map((item) => (item.id === activity.id ? activity : item))
        : [activity, ...current]
    });
  },
  updateStatus(id, status) {
    set({
      activities: get().activities.map((activity) =>
        activity.id === id ? { ...activity, status } : activity
      )
    });
  },
  reset() {
    set({ activities: [], loading: false, error: null });
  }
}));
