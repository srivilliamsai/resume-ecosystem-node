import { cn } from "@/utils/cn";
import { useThemeStore } from "@/store/theme";

type ThemeToggleProps = {
  className?: string;
  variant?: "solid" | "ghost";
  hideLabel?: boolean;
};

const iconClasses = "h-4 w-4 transition-transform duration-300 ease-soft";

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className={cn(iconClasses, className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="currentColor"
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 2.5a1 1 0 0 1 1 1V22a1 1 0 1 1-2 0v-.5a1 1 0 0 1 1-1Zm0-17a1 1 0 0 1-1-1V2a1 1 0 0 1 2 0v.5a1 1 0 0 1-1 1Zm9.5 6.5a1 1 0 0 1 0 2H21a1 1 0 1 1 0-2h.5ZM3 12a1 1 0 0 1-1-1v-.5a1 1 0 0 1 2 0V11a1 1 0 0 1-1 1Zm15.78 6.78a1 1 0 0 1 0-1.42l.35-.36a1 1 0 1 1 1.42 1.42l-.35.36a1 1 0 0 1-1.42 0ZM4.45 5.22a1 1 0 0 1 0-1.42l.35-.35a1 1 0 1 1 1.42 1.41l-.35.36a1 1 0 0 1-1.42 0Zm13.12-1.77 1.08 1.09a1 1 0 1 1-1.42 1.41L16.15 4.9a1 1 0 1 1 1.42-1.42ZM6.93 17.08l-1.08 1.08a1 1 0 0 1-1.42-1.41l1.08-1.09a1 1 0 1 1 1.42 1.42Z"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className={cn(iconClasses, className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="currentColor"
        d="M12.67 2.05a1 1 0 0 1 1.21 1.2A8 8 0 1 0 20.75 13a1 1 0 0 1 1.2-1.21A10 10 0 1 1 12.67 2.05Z"
      />
    </svg>
  );
}

export function ThemeToggle({ className, variant = "solid", hideLabel }: ThemeToggleProps) {
  const theme = useThemeStore((state) => state.theme);
  const toggle = useThemeStore((state) => state.toggle);

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "theme-toggle",
        variant === "solid"
          ? "bg-slate-900 text-white shadow-soft hover:-translate-y-[1px] hover:bg-slate-800 active:translate-y-0 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          : "border border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
        className
      )}
    >
      <span className="sr-only">Toggle theme</span>
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      {hideLabel ? null : (
        <span className="text-sm font-medium">
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </span>
      )}
    </button>
  );
}
