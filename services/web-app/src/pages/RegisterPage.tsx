import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { authApi } from "@/api";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuthStore } from "@/store/auth";

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authApi.register(email.trim(), password, name.trim());
      const login = await authApi.login(email.trim(), password);
      setAuth({ token: login.token, user: login.user });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register");
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
          <p className="auth-eyebrow">Launch your portfolio</p>
          <h1>All your achievements, verified and ready to showcase.</h1>
          <ul>
            <li>Create once, keep it updated forever.</li>
            <li>Invite trusted issuers to verify your work.</li>
            <li>Share secure resume links or rich PDF exports.</li>
          </ul>
        </section>

        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <h2>Create your account</h2>
            <p>It only takes a minute. You can invite mentors later.</p>
          </div>
          <label className="field">
            <span>Name</span>
            <input value={name} onChange={(event) => setName(event.currentTarget.value)} placeholder="Your name" />
          </label>
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
              placeholder="At least 8 characters"
            />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button className="btn btn--primary w-full" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
          <p className="text-sm text-slate-500 dark:text-slate-200">
            Already have an account?{" "}
            <Link className="link" to="/login">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
