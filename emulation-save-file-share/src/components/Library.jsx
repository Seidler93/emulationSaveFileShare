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
    <div style={{ padding: 16, fontFamily: "Arial" }}>
      <h2 style={{ marginTop: 0 }}>Library</h2>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <button onClick={chooseRoot}>Set RPCS3 Folder</button>
        <button onClick={scan}>Rescan</button>
        <div style={{ opacity: 0.8, fontSize: 13 }}>
          {rpcs3Root ? rpcs3Root : "(not set)"}
        </div>
      </div>

      {status && <div style={{ marginBottom: 12 }}>{status}</div>}

      <div style={{ border: "1px solid #ddd", borderRadius: 8 }}>
        {games.map((g) => (
          <GameRow key={g.serial} game={g} />
        ))}
      </div>
    </div>
  );
}
