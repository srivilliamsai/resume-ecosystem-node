const DATE_TIME_FORMAT = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short"
});

export function formatDateTime(value?: string) {
  if (!value) return "—";
  try {
    return DATE_TIME_FORMAT.format(new Date(value));
  } catch {
    return value;
  }
}
