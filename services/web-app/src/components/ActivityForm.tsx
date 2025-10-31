import { FormEvent, useState } from "react";

import type { Activity } from "@/api/types";

const activityTypes = [
  { value: "PROJECT", label: "Project" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "COURSE", label: "Course" },
  { value: "HACKATHON", label: "Hackathon" }
];

interface ActivityFormProps {
  loading?: boolean;
  className?: string;
  onSubmit: (
    payload: Pick<Activity, "title" | "type" | "org"> & { metadata?: Record<string, unknown> }
  ) => Promise<void>;
  errorMessage?: string | null;
  successMessage?: string | null;
}

export function ActivityForm({ loading, onSubmit, className, errorMessage, successMessage }: ActivityFormProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<Activity["type"]>("PROJECT");
  const [org, setOrg] = useState("");
  const [impact, setImpact] = useState(10);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    const payload = {
      title: title.trim(),
      type,
      org: org.trim() || undefined,
      metadata: {
        impact
      }
    };

    await onSubmit(payload);
    setTitle("");
    setOrg("");
    setImpact(10);
    setType("PROJECT");
  };

  return (
    <form className={className ?? "card space-y-5"} onSubmit={handleSubmit}>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Add Activity</h3>
      <label className="field">
        <span>Title</span>
        <input value={title} onChange={(event) => setTitle(event.currentTarget.value)} placeholder="Project title" />
      </label>
      <label className="field">
        <span>Type</span>
        <select value={type} onChange={(event) => setType(event.currentTarget.value as Activity["type"])}>
          {activityTypes.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Organisation</span>
        <input value={org} onChange={(event) => setOrg(event.currentTarget.value)} placeholder="Company or issuer" />
      </label>
      <label className="field">
        <span>Impact score (0-100)</span>
        <input
          type="number"
          min={0}
          max={100}
          value={impact}
          onChange={(event) => setImpact(Number(event.currentTarget.value))}
        />
      </label>
      {error ? <p className="error">{error}</p> : null}
      <button className="btn btn--primary mt-4 shadow-soft" type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save activity"}
      </button>
      {errorMessage ? <p className="error mt-3">{errorMessage}</p> : null}
      {successMessage ? (
        <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-300">{successMessage}</p>
      ) : null}
    </form>
  );
}
