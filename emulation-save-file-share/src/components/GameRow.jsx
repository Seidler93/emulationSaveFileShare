import { useState } from "react";
import { db, storage } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";

async function uploadItem({ game, item }) {
  // 1) Zip the selected save folder/file
  const zipAbs = await window.api.zipPath(item.absPath);

  // 2) Read the zip bytes via Electron IPC
  const bytes = await window.api.readFileBytes(zipAbs);

  // 3) Create a safe storage path
  const safeName = item.name.replace(/[^\w.-]+/g, "_");
  const objectPath = `rpcs3/${game.serial}/${item.type}/${Date.now()}_${safeName}.zip`;

  // 4) Upload to Firebase Storage
  const storageRef = ref(storage, objectPath);
  await uploadBytes(storageRef, bytes);

  // 5) Store metadata in Firestore
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

  return (
    <div style={{ borderTop: "1px solid #eee", padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div
          onClick={() => setOpen(!open)}
          style={{ cursor: "pointer" }}
        >
          <div style={{ fontWeight: 700 }}>{game.title}</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>{game.serial}</div>
        </div>

        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Saves: {game.saves.length} • States: {game.savestates.length}
        </div>
      </div>

      {open && (
        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16
          }}
        >
          <Section
            title="Local Saves"
            items={game.saves}
            game={game}
            setBusy={setBusy}
          />

          <Section
            title="Local Savestates"
            items={game.savestates}
            game={game}
            setBusy={setBusy}
          />

          <div style={{ gridColumn: "1 / -1", paddingTop: 8, borderTop: "1px dashed #ddd" }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Downloadable (from Firebase)</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>
              Next step: query Firestore for this serial and list downloads here.
            </div>
          </div>

          {busy && (
            <div style={{ gridColumn: "1 / -1", fontSize: 13 }}>
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
      setBusy(`Zipping ${item.name}...`);
      // zip happens inside uploadItem, but keeping this status feels good UX
      setBusy(`Uploading ${item.name}...`);

      const objectPath = await uploadItem({ game, item });

      setBusy(`✅ Uploaded: ${item.name} → ${objectPath}`);
      setTimeout(() => setBusy(""), 2500);
    } catch (err) {
      console.error(err);
      setBusy(`❌ Upload failed: ${err?.message || String(err)}`);
    }
  }

  return (
    <div>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((it) => (
          <div
            key={it.absPath}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 8,
              alignItems: "center"
            }}
          >
            <div style={{ fontSize: 13, wordBreak: "break-word" }}>{it.name}</div>
            <button onClick={() => handleUpload(it)}>Upload</button>
          </div>
        ))}

        {!items.length && <div style={{ fontSize: 13, opacity: 0.7 }}>(none)</div>}
      </div>
    </div>
  );
}
