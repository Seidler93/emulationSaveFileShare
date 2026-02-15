# SaveLocker – ChatGPT Packet

Generated: 2026-02-15T20:03:10.346Z

## Included files (4)
- CHAT_CONTEXT.md
- src/pages/GameLibrary.jsx
- src/pages/Library.jsx
- src/pages/Login.jsx

---

## CHAT_CONTEXT.md

```markdown
# SaveLocker — ChatGPT Context

## What this project is
SaveLocker is a desktop application that manages, backs up, and shares **emulator save files**, starting with **RPCS3 Madden franchise saves**.

Core purpose:
- Prevent save corruption or loss
- Allow friends to safely share and sync franchise saves
- Provide version history, rollback, and safety checks
- Be usable by non-technical users

This is **not** a generic file sync app.

---

## Current scope
- Emulator: RPCS3
- Game focus: Madden only (for now)
- Save handling: entire savedata folders bundled as zip files
- Cloud backend: Firebase
  - Firestore = metadata, users, slots, versions
  - Cloud Storage = actual save bundles
- Auth: Firebase Auth (email/password or Google)

Future games may be added later, but **Madden-first assumptions are allowed**.

---

## Core concepts (very important)
### Slot
- A “slot” is a shared workspace for one game (TitleID-based)
- Each slot can contain multiple in-game saves (handled by the game itself)
- Free users are limited in number of owned slots
- Slots are shared via access codes or direct invites

### Version
- Every upload creates an immutable version
- Versions point to a zip file in Cloud Storage
- One version is marked as “current”
- Old versions may be cleaned up based on tier limits

### Local safety
- Before applying any downloaded save:
  - A local backup is created automatically
- If apply fails:
  - App restores from local backup
- Safety > speed, always

---

## Save behavior rules
- The app does NOT merge saves
- Applying a save = overwrite the local savedata folder for that TitleID
- Zipping/unzipping is always atomic and validated
- Users can create multiple in-game saves inside Madden — no app-level forking needed

---

## Dependency awareness (Madden-specific)
Some saves depend on:
- Roster files
- Mods or specific configurations

Before applying a save:
- App performs a preflight check
- If required dependencies are missing:
  - Block apply
  - Show clear instructions
  - Do NOT partially apply saves

Do NOT store copyrighted roster files unless explicitly allowed.

---

## TitleID handling
- TitleID (e.g., BLUSxxxx) is the canonical game identifier
- Slot metadata is always keyed by TitleID
- Folder names and display names are NOT trusted identifiers
- Game display names may be resolved via RPCS3 metadata or internal mapping

Never assume folder names equal TitleID exactly.

---

## UX principles
- Clarity over power
- Safe defaults
- No destructive actions without recovery
- Explicit warnings > silent failure
- Users should never need to understand emulator internals

If a decision trades safety for convenience, choose safety.

---

## What ChatGPT should do
When asked to add or change features:
1. Search the repo first
2. Identify existing patterns and reuse them
3. List affected files before proposing changes
4. Avoid inventing new architecture unless asked
5. Respect Madden-first constraints
6. Avoid scope creep

If something is unclear:
- Ask ONE focused clarifying question
- Do not guess core architecture decisions

---

## What ChatGPT should NOT do
- Do not redesign the app without request
- Do not introduce complex sync/merge logic
- Do not assume multi-game support unless specified
- Do not remove safety checks for convenience
- Do not treat this like generic cloud storage

---

## Current development phase
- Installer + local save reliability first
- Cloud sync + auth second
- Social features (friends) later
- Monetization later

Debuggability and logging are high priority.

---

## Tone preference
- Direct
- Practical
- Minimal fluff
- Prefer concrete steps over theory

End of context.
```

---

## src/pages/GameLibrary.jsx

```javascript
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider";

export default function GameLibrary() {
  const [rpcs3Root, setRpcs3Root] = useState(localStorage.getItem("rpcs3Root") || "");
  const [games, setGames] = useState([]);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const { logout } = useAuth();

  async function chooseRoot() {
    const picked = await window.api.pickRpcs3Root();
    if (!picked) return;
    localStorage.setItem("rpcs3Root", picked);
    setRpcs3Root(picked);
  }

  async function scan() {
    if (!rpcs3Root) {
      setStatus("Pick your RPCS3 folder first.");
      return;
    }
    setStatus("Scanning...");
    const res = await window.api.scanLibrary(rpcs3Root);
    if (!res.ok) {
      setStatus(res.error || "Scan failed");
      return;
    }
    setGames(res.games || []);
    setStatus(`Found ${res.games?.length || 0} games.`);
  }

  useEffect(() => {
    if (rpcs3Root) scan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayGames = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...games]
      .filter((g) => {
        if (!q) return true;
        return (
          (g.title || "").toLowerCase().includes(q) ||
          (g.serial || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }, [games, query]);

  async function play(game) {
    try {
      const root = localStorage.getItem("rpcs3Root");
      if (!root) {
        setStatus("Set your RPCS3 folder first.");
        return;
      }

      setStatus(`Launching ${game.title}...`);
      const res = await window.api.launchRpcs3Game({
        rpcs3Root: root,
        launchTarget: game.launchTarget,
        noGui: true
      });


      if (!res?.ok) {
        setStatus(`❌ ${res?.error || "Launch failed"}`);
        return;
      }

      setStatus(`✅ Launched ${game.title}`);
      setTimeout(() => setStatus(""), 2000);
    } catch (e) {
      setStatus(`❌ ${e?.message || String(e)}`);
    }
  }

  return (
    <div className="app-page">
      <div className="panel">
        <div className="page-header">
          <h2 className="page-title">Game Library</h2>
          <div className="page-subtitle">{rpcs3Root ? rpcs3Root : "(not set)"}</div>
        </div>

        <div className="toolbar">
          <input
            className="input"
            placeholder="Search by game name or serial…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ minWidth: 260 }}
          />

          <button className="btn btn-secondary" onClick={chooseRoot}>
            Set RPCS3 Folder
          </button>
          <button className="btn btn-secondary" onClick={scan}>
            Rescan
          </button>

          {status && <div className="status">{status}</div>}
        </div>

        <div className="game-list">
          {displayGames.map((g) => (
            <div key={g.serial} className="game-row">
              <div className="game-header" style={{ cursor: "default" }}>
                <div>
                  <div className="game-title">{g.title}</div>
                  <div className="game-serial">{g.serial}</div>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div className="game-meta">
                    {g.ebootPath ? "Installed" : "No EBOOT found"}
                  </div>

                  <button
                    className={`btn ${g.ebootPath ? "" : "btn-secondary"}`}
                    onClick={() => play(g)}
                    disabled={!g.ebootPath}
                    title={!g.ebootPath ? "RPCS3 installed game not found for this Title ID" : ""}
                  >
                    Play
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="toolbar logout">
          <button className="btn btn-secondary" onClick={logout}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## src/pages/Library.jsx

```javascript
import { useEffect, useMemo, useState } from "react";
import GameRow from "../components/GameRow";
import UpdateBanner from "../components/UpdateBanner";
import { useAuth } from "../auth/AuthProvider";

// Optional fallback map (if you add one later)
// import titleMap from "../data/ps3TitleMap.json";

export default function Library() {
  const [rpcs3Root, setRpcs3Root] = useState(localStorage.getItem("rpcs3Root") || "");
  const [games, setGames] = useState([]);
  const [status, setStatus] = useState("");
  const [appVersion, setAppVersion] = useState("");
  const [query, setQuery] = useState("");
  const { logout } = useAuth();

  useEffect(() => {
    if (window.api?.getAppVersion) window.api.getAppVersion().then(setAppVersion);
  }, []);

  async function chooseRoot() {
    const picked = await window.api.pickRpcs3Root();
    if (!picked) return;
    localStorage.setItem("rpcs3Root", picked);
    setRpcs3Root(picked);
  }

  async function scan() {
    if (!rpcs3Root) {
      setStatus("Pick your RPCS3 folder first.");
      return;
    }
    setStatus("Scanning...");
    const res = await window.api.scanLibrary(rpcs3Root);
    if (!res.ok) {
      setStatus(res.error || "Scan failed");
      return;
    }

    // Normalize display name now (works even before you add PARAM.SFO parsing)
    const normalized = (res.games || []).map((g) => {
      const title =
        g.title
        // || titleMap?.[g.serial]
        || g.serial;

      return { ...g, title };
    });

    setGames(normalized);
    setStatus(`Found ${normalized.length} games with saves/savestates.`);
  }

  useEffect(() => { if (rpcs3Root) scan(); }, []); // keep as-is if you like

  const displayGames = useMemo(() => {
    const q = query.trim().toLowerCase();

    return [...games]
      .filter((g) => {
        if (!q) return true;
        return (
          (g.title || "").toLowerCase().includes(q) ||
          (g.serial || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }, [games, query]);

  return (
    <div className="app-page">
      <div className="version">
        RPCS3 Save Manager {appVersion && `• v${appVersion}`}
      </div>

      <div className="panel">
        <div className="page-header">
          <h2 className="page-title">Save Library</h2>
          <div className="page-subtitle">{rpcs3Root ? rpcs3Root : "(not set)"}</div>
        </div>

        <div className="toolbar">
          <UpdateBanner />

          <input
            className="input"
            placeholder="Search by game name or serial…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ minWidth: 260 }}
          />

          <button className="btn btn-secondary" onClick={chooseRoot}>
            Set RPCS3 Folder
          </button>
          <button className="btn btn-secondary" onClick={scan}>
            Rescan
          </button>

          {status && <div className="status">{status}</div>}
        </div>

        <div className="game-list">
          {displayGames.map((g) => (
            <GameRow key={g.serial} game={g} />
          ))}
        </div>

        <div className="toolbar logout">
          <button className="btn btn-secondary" onClick={logout}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## src/pages/Login.jsx

```javascript
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
```

---

