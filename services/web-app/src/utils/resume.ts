type UnknownSectionItem = Record<string, unknown> & {
  id?: string;
  title?: string;
  organization?: string;
  text?: string | string[];
  description?: string | string[];
  score?: number;
  startDate?: string | null;
  endDate?: string | null;
};

export function toReadableItems(value: unknown): UnknownSectionItem[] {
  if (!Array.isArray(value)) return [];

  return value.map((item) => {
    if (typeof item === "string") {
      return { text: item };
    }
    if (item && typeof item === "object") {
      return item as UnknownSectionItem;
    }
    return { text: JSON.stringify(item) };
  });
}

export function formatTimeline(item: UnknownSectionItem): string | null {
  if (!item.startDate && !item.endDate) {
    return null;
  }

  const formatter = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short"
  });

  const start = item.startDate ? formatter.format(new Date(item.startDate)) : "Start";
  const end = item.endDate ? formatter.format(new Date(item.endDate)) : "Present";

  return `${start} – ${end}`;
}
