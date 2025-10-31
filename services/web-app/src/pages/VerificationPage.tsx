import { FormEvent, useEffect, useMemo, useState } from "react";

import { activityApi } from "@/api";
import type { Activity } from "@/api/types";
import { CardWrapper } from "@/components/ui/CardWrapper";
import { VerifyPanel } from "@/components/verification/VerifyPanel";
import { useActivitiesStore } from "@/store/activities";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/utils/cn";
import { TYPE_INFO } from "@/utils/activityStyles";
import { formatDateTime } from "@/utils/date";

const STATUS_BADGES: Record<Activity["status"], string> = {
  PENDING:
    "border border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-300/40 dark:bg-amber-400/25 dark:text-amber-50",
  VERIFIED:
    "border border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-300/40 dark:bg-emerald-400/25 dark:text-emerald-50",
  REJECTED:
    "border border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-300/40 dark:bg-rose-400/25 dark:text-rose-50"
};

const STATUS_LABELS: Record<Activity["status"], string> = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected"
};

export function VerificationPage() {
  const token = useAuthStore((state) => state.token);
  const userId = useAuthStore((state) => state.user?.id);

  const activities = useActivitiesStore((state) => state.activities);
  const loading = useActivitiesStore((state) => state.loading);
  const refresh = useActivitiesStore((state) => state.refresh);
  const updateStatus = useActivitiesStore((state) => state.updateStatus);
  const refreshError = useActivitiesStore((state) => state.error);

  const [selected, setSelected] = useState<string>("");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const awaitingVerification = useMemo(
    () => activities.filter((activity) => activity.status !== "VERIFIED"),
    [activities]
  );

  useEffect(() => {
    if (!token) return;
    if (!activities.length) {
      void refresh(token);
    }
  }, [token, activities.length, refresh]);

  useEffect(() => {
    if (!selected && activities.length > 0) {
      setSelected(activities[0].id);
    }
  }, [activities, selected]);

  useEffect(() => {
    if (!selected || activities.length === 0) {
      return;
    }
    const current = activities.find((activity) => activity.id === selected);
    if (!current) {
      setSelected(activities[0]?.id ?? "");
      return;
    }
    if (current.status === "VERIFIED") {
      const next = activities.find((activity) => activity.status !== "VERIFIED");
      if (next && next.id !== selected) {
        setSelected(next.id);
      }
    }
  }, [activities, selected]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !selected || !userId) return;
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      const verification = await activityApi.verifyByHash(token, userId, selected, expected, actual);
      setExpected("");
      setActual("");

      if (verification.status === "OK") {
        setMessage("Hashes match. Activity promoted to VERIFIED.");
        updateStatus(selected, "VERIFIED");
      } else {
        setMessage("Hashes do not match. The activity remains pending.");
        updateStatus(selected, "PENDING");
      }

      await refresh(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify activity");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <CardWrapper className="space-y-5">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400 dark:text-slate-400">Queue</p>
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Awaiting verification</h3>
          <p className="text-sm text-slate-500 dark:text-slate-200">
            Check the hash or attached evidence before promoting an activity to a verified record.
          </p>
        </header>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : refreshError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/80 px-6 py-5 text-sm text-rose-700 dark:border-rose-600/60 dark:bg-rose-500/10 dark:text-rose-200">
            {refreshError}
          </div>
        ) : activities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-slate-50/80 px-6 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
            No activities found. Create an activity first to run the verification flow.
          </div>
        ) : (
          <ul className="space-y-3">
            {activities.map((activity) => (
              <li
                key={activity.id}
                className="rounded-2xl border border-gray-100 bg-slate-50/70 px-5 py-4 transition duration-200 ease-soft hover:-translate-y-[1px] hover:border-gray-200 hover:bg-white dark:border-slate-700 dark:bg-slate-800/60 dark:hover:bg-slate-700/70"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{activity.title}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-200">
                      <span
                        className={cn(
                          "pill",
                          TYPE_INFO[activity.type].subtleClasses,
                          "font-semibold"
                        )}
                      >
                        <span aria-hidden="true">{TYPE_INFO[activity.type].icon}</span>
                        {TYPE_INFO[activity.type].label}
                      </span>
                      {activity.org ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-500 dark:bg-slate-700/70 dark:text-slate-200">
                          {activity.org}
                        </span>
                      ) : null}
                      <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-500 dark:bg-slate-700/70 dark:text-slate-200">
                        {activity.createdAt ? formatDateTime(activity.createdAt) : "—"}
                      </span>
                    </div>
                  </div>
                  <span className={cn("pill", STATUS_BADGES[activity.status])}>{STATUS_LABELS[activity.status]}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardWrapper>

      <VerifyPanel
        activities={awaitingVerification.length ? awaitingVerification : activities}
        selectedId={selected}
        expected={expected}
        actual={actual}
        submitting={submitting}
        message={message}
        error={error}
        onSelectedChange={setSelected}
        onExpectedChange={setExpected}
        onActualChange={setActual}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
