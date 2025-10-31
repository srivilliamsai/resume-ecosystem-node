import { useEffect, useMemo, useState } from "react";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { CardWrapper } from "@/components/ui/CardWrapper";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";
import { cn } from "@/utils/cn";

type Preferences = {
  emailUpdates: boolean;
  productTips: boolean;
  pushAlerts: boolean;
};

const LOCAL_STORAGE_KEY = "resume-ecosystem-profile-preferences";

const defaultPrefs: Preferences = {
  emailUpdates: true,
  productTips: true,
  pushAlerts: false
};

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const theme = useThemeStore((state) => state.theme);

  const [preferences, setPreferences] = useState<Preferences>(() => {
    if (typeof window === "undefined") {
      return defaultPrefs;
    }
    try {
      const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) return defaultPrefs;
      return { ...defaultPrefs, ...(JSON.parse(stored) as Preferences) };
    } catch {
      return defaultPrefs;
    }
  });

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const roleSummary = useMemo(() => user?.roles?.join(" • ") ?? "USER", [user?.roles]);

  const toggle = (key: keyof Preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <CardWrapper className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400 dark:text-slate-500">
            Account
          </p>
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Profile overview</h3>
          <p className="text-sm text-slate-500 dark:text-slate-200">
            Manage your identity, theme, and notification preferences. Updates are stored locally until profile APIs land.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-800/70">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Primary details</h4>
            <dl className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-200">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-300">Name</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">{user?.name ?? "Not provided"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-300">Email</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">{user?.email ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-300">Roles</dt>
                <dd className="font-medium text-slate-900 dark:text-slate-100">{roleSummary}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-800/70">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Display preferences</h4>
            <div className="mt-3 flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-200">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-slate-50/70 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-200">Theme</p>
                  <p className="text-xs text-slate-500 dark:text-slate-300">Switch between light and dark modes.</p>
                </div>
                <ThemeToggle hideLabel variant="solid" />
              </div>
              <div className="rounded-xl border border-gray-100 bg-slate-50/70 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
                <p className="font-medium text-slate-700 dark:text-slate-200">Current mode</p>
                <p className="text-xs text-slate-500 dark:text-slate-300 capitalize">{theme}</p>
              </div>
            </div>
          </div>
        </div>
      </CardWrapper>

      <CardWrapper className="flex flex-col gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400 dark:text-slate-500">
            Notifications
          </p>
          <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-100">Stay in the loop</h3>
          <p className="text-sm text-slate-500 dark:text-slate-200">
            Choose how you want to hear about verifications, rebuilds, and platform updates.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <PreferenceToggle
            label="Verification emails"
            description="Receive an email when issuers approve or reject your submissions."
            active={preferences.emailUpdates}
            onToggle={() => toggle("emailUpdates")}
          />
          <PreferenceToggle
            label="Product tips"
            description="Helpful nudges on how to improve your resume score."
            active={preferences.productTips}
            onToggle={() => toggle("productTips")}
          />
          <PreferenceToggle
            label="Push alerts"
            description="Browser notifications for rebuild completions."
            active={preferences.pushAlerts}
            onToggle={() => toggle("pushAlerts")}
          />
        </div>
      </CardWrapper>

      <CardWrapper className="flex flex-col gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400 dark:text-slate-500">
            Security & integrations
          </p>
          <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-100">API access</h3>
          <p className="text-sm text-slate-500 dark:text-slate-200">
            Service tokens are generated per session and never displayed in the dashboard. Use the CLI to request a new
            token when you need to script against the API gateway.
          </p>
        </div>
        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-200">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 flex-none rounded-full bg-emerald-500" />
            Use the CLI helper in <code className="rounded bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">docs/integration.md</code> to mint a short-lived credential when needed.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 flex-none rounded-full bg-emerald-500" />
            Store tokens in your password manager—revocation happens automatically when you sign out.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 flex-none rounded-full bg-emerald-500" />
            Rotate credentials regularly for sandbox environments and never commit them to Git.
          </li>
        </ul>
        <button
          type="button"
          className="self-start rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition duration-200 ease-soft hover:-translate-y-[1px] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          disabled={!token}
          onClick={async () => {
            if (!token) return;
            try {
              await navigator.clipboard.writeText(token);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {!token ? "Sign in to copy a token" : copied ? "Token copied to clipboard" : "Copy current session token"}
        </button>
      </CardWrapper>
    </div>
  );
}

type PreferenceToggleProps = {
  label: string;
  description: string;
  active: boolean;
  onToggle: () => void;
};

function PreferenceToggle({ label, description, active, onToggle }: PreferenceToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "preference-toggle",
        active ? "preference-toggle--active" : "preference-toggle--inactive"
      )}
    >
      <div className="flex flex-col text-left">
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{label}</span>
        <span className="text-xs text-slate-500 dark:text-slate-300">{description}</span>
      </div>
      <span
        className={cn(
          "inline-flex h-6 w-11 items-center rounded-full border transition duration-200 ease-soft",
          active
            ? "justify-end border-emerald-500 bg-emerald-500/10"
            : "justify-start border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
        )}
      >
        <span
          className={cn(
            "mx-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ease-soft",
            active ? "translate-x-0 bg-emerald-500" : "translate-x-0 dark:bg-slate-500"
          )}
        />
      </span>
    </button>
  );
}
