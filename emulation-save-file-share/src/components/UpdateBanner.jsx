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
