import { CardWrapper } from "@/components/ui/CardWrapper";

type ActivitySnapshotProps = {
  loading?: boolean;
  stats: {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
  };
};

export function ActivitySnapshot({ loading, stats }: ActivitySnapshotProps) {
  const total = Math.max(stats.total, 1);
  const verifiedPercent = Math.round((stats.verified / total) * 100);
  const pendingPercent = Math.round((stats.pending / total) * 100);

  return (
    <CardWrapper className="relative overflow-hidden">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400 dark:text-slate-500">Overview</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">Activity snapshot</h3>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
            {new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" }).format(new Date())}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4 dark:border-slate-700 dark:bg-slate-800/60">
          <div className="flex flex-col gap-2">
            <div className="flex items-end justify-between gap-3">
              <div className="text-4xl font-semibold text-slate-900 dark:text-slate-100">
                {loading ? (
                  <span className="inline-block h-9 w-20 animate-pulse rounded-full bg-slate-100 dark:bg-slate-700" />
                ) : (
                  stats.total
                )}
              </div>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-600 shadow-sm dark:bg-slate-900/80 dark:text-emerald-200">
                {loading ? "Syncing…" : `${verifiedPercent}% verified`}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-200">
              Total tracked activities across your ecosystem.
            </p>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-white dark:bg-slate-800">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-emerald-500 transition-[width] duration-500 ease-soft"
                style={{ width: `${loading ? 0 : verifiedPercent}%` }}
              />
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-amber-400/80 transition-[width] duration-500 ease-soft"
                style={{ width: `${loading ? 0 : verifiedPercent + pendingPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="status-card status-card--success">
            <span className="status-card__label">Verified</span>
            <p className="status-card__value">{loading ? "—" : stats.verified}</p>
            <span className="status-card__meta">Trusted issuers</span>
          </div>
          <div className="status-card status-card--pending">
            <span className="status-card__label">Pending</span>
            <p className="status-card__value">{loading ? "—" : stats.pending}</p>
            <span className="status-card__meta">Awaiting review</span>
          </div>
          <div className="status-card status-card--rejected">
            <span className="status-card__label">Rejected</span>
            <p className="status-card__value">{loading ? "—" : stats.rejected}</p>
            <span className="status-card__meta">Needs attention</span>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
}
