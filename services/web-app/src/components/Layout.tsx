import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuthStore } from "@/store/auth";

const navItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/activities", label: "Activities" },
  { to: "/resume", label: "Resume" },
  { to: "/verification", label: "Verification" },
  { to: "/profile", label: "Profile" }
];

export function AppLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clear = useAuthStore((state) => state.clear);

  const handleLogout = () => {
    clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-25 text-slate-900 transition-colors duration-300 ease-soft dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-gray-200 bg-white/90 px-6 py-6 backdrop-blur transition-colors duration-300 ease-soft lg:flex lg:flex-col lg:justify-between dark:border-slate-800 dark:bg-slate-900/90">
          <div className="space-y-8">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400">Resume</span>
              <span className="text-xl font-semibold text-slate-900">Ecosystem</span>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      "flex items-center justify-between rounded-xl px-4 py-2 text-sm font-medium transition duration-200 ease-soft",
                      isActive
                        ? "bg-slate-900 text-white shadow-soft shadow-slate-900/10 dark:bg-white dark:text-slate-900"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-slate-50/70 p-4 text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
            <p>Tip: keep your resume fresh by rebuilding after every verification.</p>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur transition-colors duration-300 ease-soft dark:border-slate-800 dark:bg-slate-900/80">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
              <div className="flex flex-col gap-1 text-right">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {user?.name ?? user?.email ?? "Loading user"}
                </span>
                {user?.roles?.length ? (
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    {user.roles.join(" • ")}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle variant="ghost" className="theme-toggle--ghost" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-soft transition duration-200 ease-soft hover:-translate-y-[1px] hover:bg-slate-800 active:translate-y-0 dark:bg-white dark:text-slate-900 dark:hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
