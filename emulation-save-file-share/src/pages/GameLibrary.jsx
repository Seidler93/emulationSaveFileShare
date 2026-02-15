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
