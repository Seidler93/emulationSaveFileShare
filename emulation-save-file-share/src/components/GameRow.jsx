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

  async function handleInstall(item) {
    try {
      setBusy(`Preparing install for ${item.originalName}...`);

      // get download URL from Storage
      const url = await getDownloadURL(ref(storage, item.storagePath));

      // pull RPCS3 root from localStorage (same place your Library stores it)
      const rpcs3Root = localStorage.getItem("rpcs3Root");

      if (!rpcs3Root) {
        setBusy("❌ Set your RPCS3 folder first.");
        return;
      }

      setBusy(`Installing ${item.originalName} into RPCS3...`);

      const res = await window.api.installFromUrl({
        rpcs3Root,
        type: item.type, // "save" or "savestate"
        url
      });

      if (!res?.ok) throw new Error("Install failed.");

      if (res.backupPath) {
        setBusy(`✅ Installed. Backup created: ${res.backupPath}`);
      } else {
        setBusy(`✅ Installed to: ${res.installedTo}`);
      }

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
