import type { Activity } from "@/api/types";

export const TYPE_INFO: Record<
  Activity["type"],
  {
    label: string;
    icon: string;
    classes: string;
    subtleClasses: string;
  }
> = {
  INTERNSHIP: {
    label: "Internship",
    icon: "🧑‍💼",
    classes:
      "border border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-300/40 dark:bg-blue-400/25 dark:text-blue-50",
    subtleClasses:
      "border border-blue-200 bg-blue-100 text-blue-600 dark:border-blue-300/30 dark:bg-blue-400/20 dark:text-blue-50"
  },
  COURSE: {
    label: "Course",
    icon: "📚",
    classes:
      "border border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-300/40 dark:bg-emerald-400/25 dark:text-emerald-50",
    subtleClasses:
      "border border-emerald-200 bg-emerald-100 text-emerald-600 dark:border-emerald-300/30 dark:bg-emerald-400/20 dark:text-emerald-50"
  },
  HACKATHON: {
    label: "Hackathon",
    icon: "🚀",
    classes:
      "border border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-300/40 dark:bg-amber-400/25 dark:text-amber-50",
    subtleClasses:
      "border border-amber-200 bg-amber-100 text-amber-600 dark:border-amber-300/30 dark:bg-amber-400/20 dark:text-amber-50"
  },
  PROJECT: {
    label: "Project",
    icon: "🧩",
    classes:
      "border border-purple-200 bg-purple-100 text-purple-700 dark:border-purple-300/40 dark:bg-purple-400/25 dark:text-purple-50",
    subtleClasses:
      "border border-purple-200 bg-purple-100 text-purple-600 dark:border-purple-300/30 dark:bg-purple-400/20 dark:text-purple-50"
  }
};
