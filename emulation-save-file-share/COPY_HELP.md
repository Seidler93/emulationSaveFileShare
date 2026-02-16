## src/App.jsx

```javascript
import { useAuth } from "./auth/AuthProvider";
import Login from "./pages/Login";
import Library from "./pages/Library";

export default function App() {
  const { user, initializing } = useAuth();

  if (initializing) return <div style={{ padding: 16 }}>Loading...</div>;
  if (!user) return <Login />;

  return (
    <div className="app-shell">
      <Library />
    </div>
  );
}
```

---

## src/main.jsx

```javascript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./auth/AuthProvider.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
```

---

## src/styles.css

```css
/* ===== Global ===== */

:root {
  --bg: #0f1115;
  --panel: #171a21;
  --panel-2: #1e222b;
  --border: #2a2f3a;
  --text: #e6e9ef;
  --muted: #9aa3b2;
  --accent: #4da3ff;
  --accent-hover: #6ab3ff;
  --green: #3ccf91;
  --red: #ff5c5c;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: Inter, Segoe UI, system-ui, Arial, sans-serif;
}

/* ===== Layout ===== */

.app-page {
  padding: 18px;
  position: relative;
}

.panel {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 14px 25px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 12px;
}

.page-title {
  margin: 0;
  font-size: 18px;
}

.page-subtitle {
  font-size: 12px;
  color: var(--muted);
  word-break: break-word;
  text-align: right;
  max-width: 70%;
}

.toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.logout {
  padding: 15px 0;
}

.game-list {
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

.app-shell {
  height: 100vh;
}

.top-switch {
  display: flex;
  gap: 8px;
  padding: 14px 18px 0;
}

.top-switch .tab {
  background: #2a2f3a;
  color: var(--text);
  border: 1px solid var(--border);
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  font-size: 12px;
}

.top-switch .tab.active {
  background: var(--panel);
  border-color: #3a4252;
}

.input {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--panel-2);
  color: var(--text);
  outline: none;
  font-size: 13px;
}

.input:focus {
  border-color: var(--accent);
}

/* Version */
.version {
  position: absolute;
  bottom: 12px;
  right: 12px;
  padding: 15px 20px;
  font-size: 8px;
}

/* ===== Game Row ===== */

.game-row {
  border-top: 1px solid var(--border);
  padding: 14px;
}

.game-header {
  display: flex;
  justify-content: space-between;
  cursor: pointer;
}

.game-title {
  font-weight: 700;
  font-size: 15px;
}

.game-serial {
  font-size: 12px;
  color: var(--muted);
}

.game-meta {
  font-size: 12px;
  color: var(--muted);
}

.game-launch-row {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-start;
  
}

.game-launch-row .btn {
  width: auto;
  padding: 8px 16px;
}

/* expand grid for open game */
.game-expand-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 12px;
}

/* cloud section spans full width */
.game-cloud {
  grid-column: 1 / -1;
}

.file-type {
  opacity: .7;
  font-size: 12px;
  margin-left: 4px;
}

.file-path {
  font-size: 11px;
  opacity: .5;
  word-break: break-all;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* ===== Sections ===== */

.section {
  background: var(--panel-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px;
  max-height: 260px;
  overflow-y: auto;
}

.section-title {
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 8px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: .5px;
}

.file-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #222733;
}

.file-row:last-child {
  border-bottom: none;
}

.file-name {
  font-size: 13px;
  word-break: break-word;
}

/* ===== Buttons ===== */

.btn {
  background: var(--accent);
  border: none;
  color: #08121f;
  font-weight: 600;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  min-width: 90px;
}

.btn:hover {
  background: var(--accent-hover);
}

.btn-secondary {
  background: #2a2f3a;
  color: var(--text);
}

.btn-secondary:hover {
  background: #353b48;
}

.btn-green {
  background: var(--green);
  color: #062016;
}

.btn-green:hover {
  filter: brightness(1.1);
}

/* ===== Status ===== */

.status {
  font-size: 13px;
  margin-top: 8px;
  color: var(--muted);
}

.status-error {
  color: var(--red);
}

/* ===== Login ===== */

.login-card {
  max-width: 380px;
  margin: 90px auto;
}

.login-input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--panel-2);
  color: var(--text);
  font-size: 16px;
  margin-top: 6px;
  outline: none;
}

.login-input:focus {
  border-color: var(--accent);
}

/* ===== Login Additions ===== */

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 18px;
}

.login-header {
  margin-bottom: 12px;
}

.login-title {
  margin: 0;
  font-size: 22px;
  letter-spacing: 0.2px;
}

.login-subtitle {
  margin-top: 6px;
  font-size: 12px;
  color: var(--muted);
  line-height: 1.4;
}

.login-form {
  display: grid;
  gap: 10px;
}

.login-label {
  display: grid;
  gap: 6px;
  font-size: 12px;
  color: var(--muted);
}

.login-btn {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
}

.login-toggle {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
}

.login-status {
  margin-top: 4px;
  font-size: 12px;
  color: var(--muted);
  border: 1px solid var(--border);
  background: var(--panel-2);
  padding: 10px;
  border-radius: 8px;
}

.login-status--error {
  color: var(--red);
  border-color: rgba(255, 92, 92, 0.35);
}

.login-hint {
  margin-top: 6px;
  font-size: 11px;
  color: var(--muted);
  opacity: 0.9;
}

.game-row {
  position: relative;
  border-radius: 14px;
  overflow: hidden;

  /* cinematic background */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  /* fallback if no bg yet */
  background-color: rgba(20, 20, 24, 1);

  margin-bottom: 12px;
  border: 1px solid rgba(255,255,255,0.08);
}

.game-row-overlay {
  position: absolute;
  inset: 0;
  /* readable on any background */
  background: linear-gradient(
    90deg,
    rgba(0,0,0,0.72) 0%,
    rgba(0,0,0,0.35) 55%,
    rgba(0,0,0,0.55) 100%
  );
  pointer-events: none;
}

.game-header {
  position: relative;
  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 18px 18px;
  cursor: pointer;
}

.game-header-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.game-logo {
  height: 54px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 6px 14px rgba(0,0,0,0.5));
}

.game-title {
  font-size: 22px;
  font-weight: 800;
  text-shadow: 0 6px 16px rgba(0,0,0,0.55);
}

.game-serial {
  opacity: 0.85;
  font-size: 12px;
}

.game-meta {
  opacity: 0.9;
  font-size: 14px;
  text-shadow: 0 6px 16px rgba(0,0,0,0.55);
}

.platform-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  height: 30px;
  width: auto;
  opacity: 0.9;
  z-index: 3;
  filter: drop-shadow(0 6px 14px rgba(0,0,0,0.55));
  pointer-events: none;
}

/* expanded state: slightly darker + more “focus” */
.game-row.is-expanded .game-row-overlay {
  background: linear-gradient(
    90deg,
    rgba(0,0,0,0.78) 0%,
    rgba(0,0,0,0.45) 55%,
    rgba(0,0,0,0.65) 100%
  );
}

.game-expand-grid {
  position: relative;
  z-index: 2;
  padding: 0 18px 18px 18px;
}

```

---

## src/components/GameRow.jsx

```javascript
import { useEffect, useState } from "react";
import { db, storage } from "../firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getGameMedia } from "../lib/gameMedia";

async function uploadItem({ game, item }) {
  const zipAbs = await window.api.zipPath(item.absPath);
  const bytes = await window.api.readFileBytes(zipAbs);

  const safeName = item.name.replace(/[^\w.-]+/g, "_");
  const objectPath = `rpcs3/${game.serial}/${item.type}/${Date.now()}_${safeName}.zip`;

  const storageRef = ref(storage, objectPath);
  await uploadBytes(storageRef, bytes);

  await addDoc(collection(db, "rpcs3_assets"), {
    serial: game.serial,
    title: game.title,
    type: item.type,
    originalName: item.name,
    storagePath: objectPath,
    createdAt: serverTimestamp()
  });

  return objectPath;
}

export default function GameRow({ game, expanded, onToggle }) {
  const [busy, setBusy] = useState("");

  const [cloudItems, setCloudItems] = useState([]);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudError, setCloudError] = useState("");

  const media = getGameMedia(game);

  // Live query whenever expanded
  useEffect(() => {
    if (!expanded) return;

    setCloudLoading(true);
    setCloudError("");

    const q = query(
      collection(db, "rpcs3_assets"),
      where("serial", "==", game.serial),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCloudItems(rows);
        setCloudLoading(false);
      },
      (err) => {
        console.error(err);
        setCloudError(err?.message || String(err));
        setCloudLoading(false);
      }
    );

    return () => unsub();
  }, [expanded, game.serial]);

  async function handleInstall(item) {
    try {
      setBusy(`Preparing install for ${item.originalName}...`);

      const url = await getDownloadURL(ref(storage, item.storagePath));
      const rpcs3Root = localStorage.getItem("rpcs3Root");

      if (!rpcs3Root) {
        setBusy("❌ Set your RPCS3 folder first.");
        return;
      }

      setBusy(`Installing ${item.originalName} into RPCS3...`);

      const res = await window.api.installFromUrl({
        rpcs3Root,
        type: item.type,
        url
      });

      if (!res?.ok) throw new Error("Install failed.");

      if (res.backupPath) setBusy(`✅ Installed. Backup created: ${res.backupPath}`);
      else setBusy(`✅ Installed to: ${res.installedTo}`);

      setTimeout(() => setBusy(""), 2500);
    } catch (err) {
      console.error(err);
      setBusy(`❌ Install failed: ${err?.message || String(err)}`);
    }
  }

  async function handleLaunch(e) {
    e?.stopPropagation?.();

    try {
      const rpcs3Root = localStorage.getItem("rpcs3Root");
      if (!rpcs3Root) {
        setBusy("❌ Set your RPCS3 folder first.");
        return;
      }
      if (!game?.ebootPath) {
        setBusy("❌ No EBOOT.BIN found for this game.");
        return;
      }

      setBusy(`Launching ${game.title}...`);
      const res = await window.api.launchGame({ rpcs3Root, ebootPath: game.ebootPath });

      if (!res?.ok) {
        setBusy(`❌ Launch failed: ${res?.error || "Unknown error"}`);
        return;
      }

      setBusy(`✅ Launched ${game.title}`);
      setTimeout(() => setBusy(""), 2000);
    } catch (err) {
      console.error(err);
      setBusy(`❌ Launch failed: ${err?.message || String(err)}`);
    }
  }

  return (
    <div
      className={`game-row ${expanded ? "is-expanded" : ""}`}
      style={
        media.bgUrl
          ? { backgroundImage: `url("${media.bgUrl}")` }
          : undefined
      }
    >
      {/* background overlay for readability */}
      <div className="game-row-overlay" />

      {/* corner platform badge */}
      <img
        className="platform-badge"
        src={media.platformIconUrl}
        alt={media.platformLabel}
        title={media.platformLabel}
        draggable={false}
        onError={(e) => {
          // if you haven't added the badge image yet, just hide it
          e.currentTarget.style.display = "none";
        }}
      />

      <div className="game-header" onClick={onToggle} role="button" tabIndex={0}>
        <div className="game-header-left">
          {/* If logo image exists, show it; otherwise fallback to text */}
          {media.logoUrl ? (
            <img
              className="game-logo"
              src={media.logoUrl}
              alt={game.title}
              draggable={false}
              onError={(e) => {
                // if missing, hide logo and fallback to text below
                e.currentTarget.style.display = "none";
              }}
            />
          ) : null}

          <div className="game-title">{game.title}</div>
          <div className="game-serial">{game.serial}</div>
        </div>

        <div className="game-meta">
          Saves: {game.saves.length} • States: {game.savestates.length}
        </div>
      </div>

      {expanded && (
        <div className="game-expand-grid">
          <div className="game-launch-row">
            <button className="btn btn-primary" onClick={handleLaunch}>
              Launch Game
            </button>
          </div>

          <Section title="Local Saves" items={game.saves} game={game} setBusy={setBusy} />

          <Section
            title="Local Savestates"
            items={game.savestates}
            game={game}
            setBusy={setBusy}
          />

          {/* Cloud Downloads */}
          <div className="section game-cloud">
            <div className="section-title">Downloadable (from Firebase)</div>

            {cloudLoading && <div className="status">Loading…</div>}

            {cloudError && (
              <div className="status status-error">❌ {cloudError}</div>
            )}

            {!cloudLoading && !cloudError && cloudItems.length === 0 && (
              <div className="status">(Nothing uploaded yet)</div>
            )}

            {!cloudLoading && !cloudError && cloudItems.length > 0 && (
              <div className="file-list">
                {cloudItems.map((it) => (
                  <div key={it.id} className="file-row">
                    <div className="file-name">
                      <div>
                        {it.originalName}
                        <span className="file-type"> ({it.type})</span>
                      </div>
                      <div className="file-path">{it.storagePath}</div>
                    </div>

                    <button
                      className="btn btn-secondary"
                      onClick={() => handleInstall(it)}
                    >
                      Install
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {busy && <div className="status">{busy}</div>}
        </div>
      )}
    </div>
  );
}

function Section({ title, items, game, setBusy }) {
  async function handleUpload(item) {
    try {
      setBusy(`Uploading ${item.name}...`);
      const objectPath = await uploadItem({ game, item });
      setBusy(`✅ Uploaded → ${objectPath}`);
      setTimeout(() => setBusy(""), 2000);
    } catch (err) {
      console.error(err);
      setBusy(`❌ Upload failed: ${err?.message || String(err)}`);
    }
  }

  return (
    <div className="section">
      <div className="section-title">{title}</div>

      <div className="file-list">
        {items.map((it) => (
          <div key={it.absPath} className="file-row">
            <div className="file-name">
              {it.name}
              <span className="file-type"> ({it.type})</span>
            </div>

            <button className="btn" onClick={() => handleUpload(it)}>
              Upload
            </button>
          </div>
        ))}

        {!items.length && <div className="status">(none)</div>}
      </div>
    </div>
  );
}
```

---

## src/components/UpdateBanner.jsx

```javascript
import { useEffect, useState } from "react";

export default function UpdateBanner() {
  const [state, setState] = useState("idle"); // idle | checking | available | none | downloading | downloaded | error
  const [info, setInfo] = useState(null);
  const [progress, setProgress] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!window.api) return;

    window.api.onUpdateAvailable((data) => {
      setInfo(data);
      setState("available");
      setErr("");
    });

    window.api.onUpdateNotAvailable(() => {
      setState("none");
      setErr("");
      setProgress(null);
      setTimeout(() => setState("idle"), 2000);
    });

    window.api.onUpdateProgress((p) => {
      setProgress(p);
      setState("downloading");
    });

    window.api.onUpdateDownloaded(() => {
      setState("downloaded");
    });

    window.api.onUpdateError((msg) => {
      setErr(msg);
      setState("error");
    });
  }, []);

  async function check() {
    setState("checking");
    setErr("");
    try {
      await window.api.checkForUpdates();
    } catch (e) {
      setErr(e?.message || String(e));
      setState("error");
    }
  }

  async function download() {
    setErr("");
    try {
      await window.api.downloadUpdate();
    } catch (e) {
      setErr(e?.message || String(e));
      setState("error");
    }
  }

  function install() {
    window.api.installUpdate();
  }

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      <button className="btn btn-secondary" onClick={check} disabled={state === "checking" || state === "downloading"}>
        {state === "checking" ? "Checking..." : "Check for Updates"}
      </button>

      {state === "available" && (
        <>
          <div className="status">Update available{info?.version ? `: v${info.version}` : ""}</div>
          <button className="btn" onClick={download}>Download</button>
        </>
      )}

      {state === "downloading" && (
        <div className="status">
          Downloading… {progress?.percent ? `${progress.percent.toFixed(0)}%` : ""}
        </div>
      )}

      {state === "downloaded" && (
        <>
          <div className="status">Update downloaded.</div>
          <button className="btn" onClick={install}>Restart & Install</button>
        </>
      )}

      {state === "none" && <div className="status">No updates available.</div>}
      {state === "error" && <div className="status status-error">❌ {err}</div>}
    </div>
  );
}
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

export default function Library() {
  const [rpcs3Root, setRpcs3Root] = useState(localStorage.getItem("rpcs3Root") || "");
  const [games, setGames] = useState([]);
  const [status, setStatus] = useState("");
  const [appVersion, setAppVersion] = useState("");
  const [expandedSerial, setExpandedSerial] = useState(null);
  const { logout } = useAuth();

  useEffect(() => {
    if (window.api?.getAppVersion) window.api.getAppVersion().then(setAppVersion);
  }, []);

  async function chooseRoot() {
    const picked = await window.api.pickRpcs3Root();
    if (!picked) return;
    localStorage.setItem("rpcs3Root", picked);
    setRpcs3Root(picked);
    setExpandedSerial(null);
  }

  async function scan() {
    if (!rpcs3Root) {
      setStatus("Pick your RPCS3 folder first.");
      return;
    }
    setStatus("Scanning installed games...");
    const res = await window.api.scanLibrary(rpcs3Root);
    if (!res.ok) {
      setStatus(res.error || "Scan failed");
      return;
    }
    setGames(res.games || []);
    setStatus(`Found ${res.games.length} installed games.`);
  }

  useEffect(() => {
    if (rpcs3Root) scan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedGames = useMemo(() => {
    return [...games].sort((a, b) =>
      (a.title || a.serial).localeCompare(b.title || b.serial)
    );
  }, [games]);

  function toggleExpand(serial) {
    setExpandedSerial((cur) => (cur === serial ? null : serial));
  }

  return (
    <div className="app-page">
      <div className="version">
        RPCS3 Save Manager {appVersion && `• v${appVersion}`}
      </div>

      <div className="panel">
        <div className="page-header">
          <h2 className="page-title">Library</h2>
          <div className="page-subtitle">{rpcs3Root ? rpcs3Root : "(not set)"}</div>
        </div>

        <div className="toolbar">
          <UpdateBanner />
          <button className="btn btn-secondary" onClick={chooseRoot}>
            Set RPCS3 Folder
          </button>
          <button className="btn btn-secondary" onClick={scan}>
            Rescan
          </button>
          {status && <div className="status">{status}</div>}
        </div>

        <div className="game-list">
          {sortedGames.map((g) => {
            const expanded = expandedSerial === g.serial;
            return (
              <div key={g.serial} className="game-item">
                <GameRow
                  game={g}
                  expanded={expanded}
                  onToggle={() => toggleExpand(g.serial)}
                />
              </div>
            );
          })}
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

