import type { Activity } from "@/api/types";
import { formatDateTime } from "@/utils/date";
import { cn } from "@/utils/cn";
import { CardWrapper } from "@/components/ui/CardWrapper";

type RecentActivityProps = {
  loading?: boolean;
  activities: Activity[];
};

const TYPE_LABELS: Record<Activity["type"], { label: string; icon: string }> = {
  COURSE: { label: "Course", icon: "📚" },
  HACKATHON: { label: "Hackathon", icon: "🚀" },
  INTERNSHIP: { label: "Internship", icon: "🧑‍💼" },
  PROJECT: { label: "Project", icon: "🧩" }
};

const STATUS_BADGES: Record<Activity["status"], string> = {
  PENDING: "bg-amber-50 text-amber-600 border border-amber-100 dark:border-amber-500/40 dark:bg-amber-500/20 dark:text-amber-200",
  VERIFIED: "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-200",
  REJECTED: "bg-rose-50 text-rose-600 border border-rose-100 dark:border-rose-500/40 dark:bg-rose-500/20 dark:text-rose-200"
};

const STATUS_LABELS: Record<Activity["status"], string> = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected"
};

export function RecentActivity({ loading, activities }: RecentActivityProps) {
  const recent = activities.slice(0, 5);

  return (
    <CardWrapper>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400 dark:text-slate-400">Timeline</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">Recent activity</h3>
        </div>
        <span className="text-sm font-medium text-slate-400 dark:text-slate-300">Latest 5 entries</span>
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="flex animate-pulse flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70"
            >
              <div className="h-4 w-2/3 rounded bg-slate-100 dark:bg-slate-700" />
              <div className="h-3 w-1/3 rounded bg-slate-100 dark:bg-slate-700" />
            </div>
          ))
        ) : recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-slate-50/50 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
            No activity yet. Add your first project or internship to kick things off.
          </div>
        ) : (
          recent.map((activity) => (
            <div
              key={activity.id}
              className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-slate-50/70 px-4 py-3 transition duration-200 ease-soft hover:-translate-y-[1px] hover:border-gray-200 hover:bg-white dark:border-slate-700 dark:bg-slate-800/70 dark:hover:bg-slate-700/70"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{activity.title}</span>
                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600 dark:bg-slate-700/70 dark:text-slate-100">
                    <span aria-hidden="true">{TYPE_LABELS[activity.type].icon}</span>
                    {TYPE_LABELS[activity.type].label}
                  </span>
                  {activity.org ? <span>{activity.org}</span> : null}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "px-3 py-1 text-xs font-medium uppercase tracking-wide",
                    "rounded-full transition duration-200 ease-soft",
                    STATUS_BADGES[activity.status]
                  )}
                >
                  {STATUS_LABELS[activity.status]}
                </span>
                <time className="text-xs text-slate-400 dark:text-slate-500" dateTime={activity.createdAt}>
                  {activity.createdAt ? formatDateTime(activity.createdAt) : "—"}
                </time>
              </div>
            </div>
          ))
        )}
      </div>
    </CardWrapper>
  );
}
