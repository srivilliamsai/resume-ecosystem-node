import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { activityApi, resumeApi } from "@/api";
import type { Activity, ResumeResponse } from "@/api/types";
import { ActivitySnapshot } from "@/components/dashboard/ActivitySnapshot";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { CardWrapper } from "@/components/ui/CardWrapper";
import { useAuthStore } from "@/store/auth";
import { formatDateTime } from "@/utils/date";
import { cn } from "@/utils/cn";

export function DashboardPage() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [resume, setResume] = useState<ResumeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rebuilding, setRebuilding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);

    Promise.all([activityApi.list(token), resumeApi.current(token)])
      .then(([acts, resumeData]) => {
        setActivities(acts);
        setResume(resumeData ?? null);
        setToast(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load data");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const stats = useMemo(() => {
    const verified = activities.filter((item) => item.status === "VERIFIED").length;
    const pending = activities.filter((item) => item.status === "PENDING").length;
    const rejected = activities.filter((item) => item.status === "REJECTED").length;
    return { total: activities.length, verified, pending, rejected };
  }, [activities]);

  const hasResume = Boolean(resume?.currentVersion);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-10 py-12 text-white shadow-soft">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_60%)]" />
        <div className="relative flex flex-col gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">Welcome back</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              {user?.name ? `Hi ${user.name}, your resume evolves in real-time.` : "Your resume evolves in real-time."}
            </h1>
          </div>
          <p className="max-w-xl text-base text-slate-300">
            Track internships, projects, hackathons, and courses. Every verified activity instantly polishes your
            public resume.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-slate-200">
            <span className="rounded-full border border-white/20 px-4 py-1.5 backdrop-blur">
              {stats.total} total activities
            </span>
            <span className="rounded-full border border-white/20 px-4 py-1.5 backdrop-blur">
              {stats.verified} verified
            </span>
            <span className="rounded-full border border-white/20 px-4 py-1.5 backdrop-blur">
              {stats.pending} pending approval
            </span>
          </div>
        </div>
      </section>

      {error ? (
        <CardWrapper className="border-rose-200 bg-rose-50/80 text-rose-700">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold">We hit a snag</h3>
              <p className="mt-1 text-sm text-rose-600">{error}</p>
            </div>
            <button
              type="button"
              className="rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-white"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        </CardWrapper>
      ) : null}

      {toast ? (
        <CardWrapper className="border-emerald-200 bg-emerald-50/80 text-emerald-700">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium">{toast}</p>
            <button
              type="button"
              className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-600 transition hover:bg-white"
              onClick={() => setToast(null)}
            >
              Dismiss
            </button>
          </div>
        </CardWrapper>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <ActivitySnapshot loading={loading} stats={stats} />

        <CardWrapper className="flex h-full flex-col justify-between bg-white dark:bg-slate-800/70">
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400 dark:text-slate-300">Live resume</p>
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                {hasResume ? "Your resume is live" : "Publish your first resume"}
              </h3>
              {hasResume ? (
                <p className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
                  <span className="font-semibold text-slate-700 dark:text-white">Score {resume?.currentVersion?.score ?? "—"}</span>
                  <span className="mx-1 text-slate-400">•</span>
                  <span>Last rebuilt {formatDateTime(resume!.currentVersion!.createdAt)}</span>
                </p>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  Rebuild after your first verification to publish a polished resume preview.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={async () => {
                  if (!token) return;
                  setRebuilding(true);
                  setError(null);
                  try {
                    const updated = await resumeApi.rebuild(token);
                    setResume(updated ?? null);
                    setToast("Resume rebuilt with the latest verified activities.");
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Failed to rebuild resume");
                  } finally {
                    setRebuilding(false);
                  }
                }}
                disabled={rebuilding}
                className={cn("btn btn--primary", rebuilding && "pointer-events-none opacity-70")}
              >
                {rebuilding ? "Rebuilding…" : hasResume ? "Rebuild resume" : "Build resume"}
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => navigate("/resume")}
              >
                View resume
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-slate-50/70 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
            Resume rebuilds pull the freshest verified activity and re-score your profile automatically.
          </div>
        </CardWrapper>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <RecentActivity loading={loading} activities={activities} />

        <CardWrapper className="flex flex-col gap-4 bg-white dark:bg-slate-800/70">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400 dark:text-slate-400">Next steps</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">Recommended actions</h3>
          </div>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-200">
            <li className="flex items-start gap-3 rounded-2xl bg-slate-50/80 px-4 py-3 dark:bg-slate-700/60">
              <span className="mt-1 h-2 w-2 flex-none rounded-full bg-slate-400 dark:bg-slate-200" />
              <span>Verify pending activities to unlock higher resume scores.</span>
            </li>
            <li className="flex items-start gap-3 rounded-2xl bg-slate-50/80 px-4 py-3 dark:bg-slate-700/60">
              <span className="mt-1 h-2 w-2 flex-none rounded-full bg-slate-400 dark:bg-slate-200" />
              <span>Attach artifacts like certificates or PR links for stronger proof.</span>
            </li>
            <li className="flex items-start gap-3 rounded-2xl bg-slate-50/80 px-4 py-3 dark:bg-slate-700/60">
              <span className="mt-1 h-2 w-2 flex-none rounded-full bg-slate-400 dark:bg-slate-200" />
              <span>Share your public resume link with mentors and hiring partners.</span>
            </li>
          </ul>
        </CardWrapper>
      </section>
    </div>
  );
}
