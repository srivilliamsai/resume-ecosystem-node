import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { authApi } from "@/api";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuthStore } from "@/store/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login(email.trim(), password);
      setAuth({ token: response.token, user: response.user });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
        <span className="auth-brand">
          <span className="brand-accent">Resume</span> Ecosystem
        </span>
        <ThemeToggle variant="ghost" />
      </header>

      <div className="auth-layout">
        <section className="auth-hero">
          <p className="auth-eyebrow">Connected career OS</p>
          <h1>
            Build, verify, and publish a living resume that updates itself.
          </h1>
          <ul>
            <li>Track internships, hackathons, projects, and courses in one place.</li>
            <li>Verified work syncs to your resume instantly.</li>
            <li>Share PDF snapshots or a live, auto-scored profile.</li>
          </ul>
        </section>

        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <h2>Welcome back</h2>
            <p>Sign in with your credentials to continue.</p>
          </div>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              placeholder="you@example.com"
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              placeholder="••••••••"
            />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button className="btn btn--primary w-full" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <p className="text-sm text-slate-500 dark:text-slate-200">
            Need an account?{" "}
            <Link className="link" to="/register">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
