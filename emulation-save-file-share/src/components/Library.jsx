import { useEffect, useMemo, useState } from "react";
import GameRow from "./GameRow";

export default function Library() {
  const [rpcs3Root, setRpcs3Root] = useState(localStorage.getItem("rpcs3Root") || "");
  const [games, setGames] = useState([]);
  const [status, setStatus] = useState("");

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
    setGames(res.games);
    setStatus(`Found ${res.games.length} games with saves/savestates.`);
  }

  useEffect(() => { if (rpcs3Root) scan(); }, []);

  return (
    <div className="app-page">
      <div className="panel">
        <div className="page-header">
          <h2 className="page-title">Library</h2>
          <div className="page-subtitle">
            {rpcs3Root ? rpcs3Root : "(not set)"}
          </div>
        </div>

        <div className="toolbar">
          <button className="btn btn-secondary" onClick={chooseRoot}>
            Set RPCS3 Folder
          </button>
          <button className="btn btn-secondary" onClick={scan}>
            Rescan
          </button>

          {status && <div className="status">{status}</div>}
        </div>

        <div className="game-list">
          {games.map((g) => (
            <GameRow key={g.serial} game={g} />
          ))}
        </div>
      </div>
    </div>

  );
}
