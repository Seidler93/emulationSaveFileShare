import { useState } from "react";

export default function Login({ onOk }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");

  function submit() {
    if (pin === "1234") onOk();
    else setErr("Wrong PIN");
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", fontFamily: "Arial" }}>
      <h2>RPCS3 Save Manager</h2>
      <p>Enter PIN</p>
      <input
        value={pin}
        onChange={(e) => { setPin(e.target.value); setErr(""); }}
        type="password"
        placeholder="1234"
        style={{ width: "100%", padding: 10, fontSize: 16 }}
      />
      {err && <div style={{ color: "crimson", marginTop: 8 }}>{err}</div>}
      <button onClick={submit} style={{ marginTop: 12, padding: 10, width: "100%" }}>
        Unlock
      </button>
    </div>
  );
}
