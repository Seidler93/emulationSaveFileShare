import { useState } from "react";

export default function Login({ onOk }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");

  function submit() {
    if (pin === "1234") onOk();
    else setErr("Wrong PIN");
  }

  return (
    <div className="login-card panel">
      <h2 className="page-title">RPCS3 Save Manager</h2>

      <div className="section-title">Enter PIN</div>

      <input
        className="login-input"
        value={pin}
        onChange={(e) => {
          setPin(e.target.value);
          setErr("");
        }}
        type="password"
        placeholder="1234"
      />

      {err && (
        <div className="status status-error">
          {err}
        </div>
      )}

      <button
        className="btn"
        style={{ marginTop: 14, width: "100%" }}
        onClick={submit}
      >
        Unlock
      </button>
    </div>
  );
}
