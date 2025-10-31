import type { FormEvent } from "react";

import type { Activity } from "@/api/types";
import { CardWrapper } from "@/components/ui/CardWrapper";
import { cn } from "@/utils/cn";

type VerifyPanelProps = {
  activities: Activity[];
  selectedId: string;
  expected: string;
  actual: string;
  submitting?: boolean;
  message?: string | null;
  error?: string | null;
  onSelectedChange: (id: string) => void;
  onExpectedChange: (value: string) => void;
  onActualChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function VerifyPanel({
  activities,
  selectedId,
  expected,
  actual,
  submitting,
  message,
  error,
  onSelectedChange,
  onExpectedChange,
  onActualChange,
  onSubmit
}: VerifyPanelProps) {
  return (
    <CardWrapper className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400 dark:text-slate-300">Manual hash</p>
        <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Verify by hash</h3>
        <p className="text-sm text-slate-500 dark:text-slate-200">
          Use this form to simulate verification when an integration cannot auto-confirm the attestation. Paste
          the hash values for a quick comparison.
        </p>
      </header>

      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="activity">
            Activity
          </label>
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <select
              id="activity"
              value={selectedId}
              onChange={(event) => onSelectedChange(event.currentTarget.value)}
              className="w-full appearance-none rounded-xl bg-transparent text-sm font-medium text-slate-700 focus:outline-none dark:text-slate-100"
            >
              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Expected hash"
            id="expected"
            placeholder="abc123"
            value={expected}
            onChange={onExpectedChange}
          />
          <Field label="Actual hash" id="actual" placeholder="xyz987" value={actual} onChange={onActualChange} />
        </div>

        {error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/60 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:border-emerald-500/60 dark:bg-emerald-500/10 dark:text-emerald-200">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting || !selectedId}
          className={cn(
            "w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-soft transition duration-200 ease-soft",
            "hover:-translate-y-[1px] hover:bg-slate-800 active:translate-y-0",
            (submitting || !selectedId) && "pointer-events-none opacity-60"
          )}
        >
          {submitting ? "Submitting…" : "Verify activity"}
        </button>
      </form>
    </CardWrapper>
  );
}

type FieldProps = {
  label: string;
  id: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

function Field({ label, id, value, placeholder, onChange }: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition duration-200 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
      />
    </div>
  );
}
