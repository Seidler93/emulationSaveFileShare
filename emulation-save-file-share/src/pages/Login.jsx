import { useState } from "react";
import { useAuth } from "../auth/AuthProvider";

export default function Login() {
  const { login, register } = useAuth();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);

    try {
      if (mode === "login") {
        setStatus("Logging in...");
        await login(email.trim(), password);
      } else {
        setStatus("Creating account...");
        await register(email.trim(), password);
      }
      setStatus("");
    } catch (err) {
      setStatus("");
      setError(err?.message ?? "Authentication error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="panel login-card">
        <div className="login-header">
          <h1 className="login-title">Save Locker</h1>
          <div className="login-subtitle">
            {mode === "login"
              ? "Log in to sync and share RPCS3 saves"
              : "Create an account to start syncing saves"}
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label">
            Email
            <input
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              inputMode="email"
            />
          </label>

          <label className="login-label">
            Password
            <input
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </label>

          <button
            className="btn login-btn"
            type="submit"
            disabled={loading || !email.trim() || password.length < 6}
            title={password.length < 6 ? "Password must be at least 6 characters" : ""}
          >
            {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
          </button>

          <button
            type="button"
            className="btn btn-secondary login-toggle"
            onClick={() => {
              setError("");
              setStatus("");
              setMode((m) => (m === "login" ? "register" : "login"));
            }}
          >
            {mode === "login" ? "Need an account?" : "Already have an account?"}
          </button>

          {(status || error) && (
            <div className={`login-status ${error ? "login-status--error" : ""}`}>
              {error || status}
            </div>
          )}

          <div className="login-hint">
            Tip: use the same account across PCs so your franchise stays in sync.
          </div>
        </form>
      </div>
    </div>
  );
}
