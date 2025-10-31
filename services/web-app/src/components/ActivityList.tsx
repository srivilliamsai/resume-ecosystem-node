import type { Activity } from "@/api/types";
import { cn } from "@/utils/cn";
import { formatDateTime } from "@/utils/date";
import { TYPE_INFO } from "@/utils/activityStyles";

interface ActivityListProps {
  loading?: boolean;
  activities: Activity[];
}

const statusClass: Record<Activity["status"], string> = {
  PENDING: "pill pill--pending",
  VERIFIED: "pill pill--success",
  REJECTED: "pill pill--danger"
};

const STATUS_LABEL: Record<Activity["status"], string> = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected"
};

const TYPE_META = Object.fromEntries(
  Object.entries(TYPE_INFO).map(([key, value]) => [key, { label: value.label, icon: value.icon }])
) as Record<Activity["type"], { label: string; icon: string }>;

export function ActivityList({ loading, activities }: ActivityListProps) {
  if (loading) {
    return <div className="card">Loading activities...</div>;
  }

  if (activities.length === 0) {
    return <div className="card">No activities yet. Add one using the form.</div>;
  }

  return (
    <div className="card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Your activities</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:bg-slate-700/60 dark:text-slate-100">
          {activities.length} logged
        </span>
      </div>

      <div className="activity-grid" role="table">
        <div className="activity-grid__header" role="row">
          <span className="activity-grid__cell activity-grid__cell--header">Title</span>
          <span className="activity-grid__cell activity-grid__cell--header">Type</span>
          <span className="activity-grid__cell activity-grid__cell--header">Organisation</span>
          <span className="activity-grid__cell activity-grid__cell--header">Status</span>
          <span className="activity-grid__cell activity-grid__cell--header activity-grid__cell--created">Created</span>
        </div>
        <div className="activity-grid__body" role="rowgroup">
          {activities.map((activity) => {
            const meta = TYPE_META[activity.type];
            const styles = TYPE_INFO[activity.type].classes;
            const metadata = activity.metadata as Record<string, unknown> | null;
            const rawImpact = metadata?.impact as unknown;
            let impact: number | null = null;

            if (typeof rawImpact === "number") {
              impact = rawImpact;
            } else if (typeof rawImpact === "string") {
              const parsed = Number(rawImpact);
              impact = Number.isFinite(parsed) ? parsed : null;
            }

            return (
              <div key={activity.id} className="activity-grid__row" role="row">
                <div className="activity-grid__cell activity-grid__cell--title">
                  <div className="flex flex-col gap-2">
                    <span className="leading-tight text-base font-semibold text-slate-900 dark:text-white">
                      {activity.title}
                    </span>
                    {impact !== null ? <span className="activity-grid__impact">Impact {impact}</span> : null}
                  </div>
                </div>
                <div className="activity-grid__cell activity-grid__cell--type">
                  <span className={cn("activity-grid__type pill", styles)}>
                    <span aria-hidden="true">{meta.icon}</span>
                    {meta.label}
                  </span>
                </div>
                <div className="activity-grid__cell activity-grid__cell--organisation text-sm dark:text-slate-100">
                  {activity.org ?? "—"}
                </div>
                <div className="activity-grid__cell activity-grid__cell--status">
                  <span className={statusClass[activity.status]}>{STATUS_LABEL[activity.status]}</span>
                </div>
                <div className="activity-grid__cell activity-grid__cell--created">
                  <time className="block whitespace-nowrap text-sm font-medium" dateTime={activity.createdAt ?? undefined}>
                    {formatDateTime(activity.createdAt)}
                  </time>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
