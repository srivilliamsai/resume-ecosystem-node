import type { ResumeResponse } from "@/api/types";
import { CardWrapper } from "@/components/ui/CardWrapper";
import { formatDateTime } from "@/utils/date";
import { formatTimeline, toReadableItems } from "@/utils/resume";

type ResumePanelProps = {
  version: NonNullable<ResumeResponse["currentVersion"]>;
};

export function ResumePanel({ version }: ResumePanelProps) {
  const sections = version.sections ?? {};

  return (
    <CardWrapper className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400 dark:text-slate-500">Current version</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Resume score {version.score}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="rounded-full border border-gray-200 bg-white px-3 py-1 font-medium dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            Version {version.id.slice(0, 6)}
          </span>
          <span className="rounded-full border border-gray-200 bg-white px-3 py-1 font-medium dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            Updated {formatDateTime(version.createdAt)}
          </span>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        {Object.entries(sections).map(([key, value]) => {
          const items = toReadableItems(value);
          return (
            <section
              key={key}
              className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-900/80"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formatHeading(key)}</h4>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-400 dark:bg-slate-900 dark:text-slate-500">
                  {items.length} items
                </span>
              </div>
              {items.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-200">No entries yet.</p>
              ) : (
                <ul className="space-y-3">
                  {items.map((item, index) => {
                    const itemKey = item.id ? String(item.id) : `${key}-${index}`;
                    const timeline = formatTimeline(item);
                    return (
                      <li
                        key={itemKey}
                        className="space-y-1 rounded-xl border border-white bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/90"
                      >
                        {item.title ? (
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                        ) : null}
                        {item.organization ? (
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                            {item.organization}
                          </p>
                        ) : null}
                        {item.text ? <p className="text-sm text-slate-600 dark:text-slate-300">{String(item.text)}</p> : null}
                        {item.description ? (
                          <p className="text-sm text-slate-500 dark:text-slate-200">{String(item.description)}</p>
                        ) : null}
                        <div className="flex flex-wrap gap-2 text-xs text-slate-400 dark:text-slate-500">
                          {item.score ? (
                            <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
                              Score +{item.score}
                            </span>
                          ) : null}
                          {timeline ? (
                            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                              {timeline}
                            </span>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </CardWrapper>
  );
}

function formatHeading(key: string) {
  return key
    .split(/[-_]/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
