import { useEffect, useState } from "react";

import { activityApi } from "@/api";
import type { Activity } from "@/api/types";
import { ActivityForm } from "@/components/ActivityForm";
import { ActivityList } from "@/components/ActivityList";
import { useActivitiesStore } from "@/store/activities";
import { useAuthStore } from "@/store/auth";

export function ActivitiesPage() {
  const token = useAuthStore((state) => state.token);

  const activities = useActivitiesStore((state) => state.activities);
  const loading = useActivitiesStore((state) => state.loading);
  const refresh = useActivitiesStore((state) => state.refresh);
  const upsert = useActivitiesStore((state) => state.upsert);
  const resetStore = useActivitiesStore((state) => state.reset);
  const refreshError = useActivitiesStore((state) => state.error);

  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      resetStore();
      return;
    }
    void refresh(token);
  }, [token, refresh, resetStore]);

  const handleCreate = async (
    payload: Pick<Activity, "title" | "type" | "org"> & { metadata?: Record<string, unknown> }
  ) => {
    if (!token) return;
    setSaving(true);
    setCreateError(null);

    try {
      const created = await activityApi.create(token, payload);
      upsert(created);
      setSuccess("Activity recorded successfully.");
      setTimeout(() => setSuccess(null), 3500);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Unable to add activity");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="activities-page">
      <ActivityForm
        onSubmit={handleCreate}
        loading={saving}
        errorMessage={createError ?? refreshError}
        successMessage={success}
      />
      <ActivityList activities={activities} loading={loading} />
    </div>
  );
}
