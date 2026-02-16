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
