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
          <h2 className="page-title">Library</h2>
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
