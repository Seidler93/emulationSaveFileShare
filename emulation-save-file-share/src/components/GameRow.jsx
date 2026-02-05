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
    type: item.type, // "save" or "savestate"
    originalName: item.name,
    storagePath: objectPath,
    createdAt: serverTimestamp()
  });

  return objectPath;
}

export default function GameRow({ game }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState("");

  const [cloudItems, setCloudItems] = useState([]);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudError, setCloudError] = useState("");

  // Live query whenever expanded
  useEffect(() => {
    if (!open) return;

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
  }, [open, game.serial]);

  async function handleDownload(item) {
    try {
      setBusy(`Fetching download link for ${item.originalName}...`);
      const url = await getDownloadURL(ref(storage, item.storagePath));

      // simplest working behavior: open the download in browser
      // (Later we can "Install" by downloading bytes in Electron main and unzipping into RPCS3)
      window.open(url, "_blank");

      setBusy("");
    } catch (err) {
      console.error(err);
      setBusy(`❌ Download failed: ${err?.message || String(err)}`);
    }
  }

  return (
    <div className="game-row">
      <div className="game-header" onClick={() => setOpen(!open)}>
        <div>
          <div className="game-title">{game.title}</div>
          <div className="game-serial">{game.serial}</div>
        </div>

        <div className="game-meta">
          Saves: {game.saves.length} • States: {game.savestates.length}
        </div>
      </div>

      {open && (
        <div className="game-expand-grid">

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
                      onClick={() => handleDownload(it)}
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {busy && (
            <div className="status">
              {busy}
            </div>
          )}

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

            <button
              className="btn"
              onClick={() => handleUpload(it)}
            >
              Upload
            </button>
          </div>
        ))}

        {!items.length && (
          <div className="status">(none)</div>
        )}
      </div>
    </div>
  );
}
