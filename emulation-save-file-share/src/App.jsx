import { useEffect, useState } from "react";
import { useAuth } from "./auth/AuthProvider";
import Login from "./pages/Login";
import Library from "./pages/Library";
import GameLibrary from "./pages/GameLibrary";

export default function App() {
  const { user, initializing } = useAuth();
  const [view, setView] = useState(() => localStorage.getItem("topView") || "saves"); // "saves" | "games"

  useEffect(() => {
    localStorage.setItem("topView", view);
  }, [view]);

  if (initializing) return <div style={{ padding: 16 }}>Loading...</div>;
  if (!user) return <Login />;

  return (
    <div className="app-shell">
      <div className="top-switch">
        <button
          className={`tab ${view === "saves" ? "active" : ""}`}
          onClick={() => setView("saves")}
        >
          Save Library
        </button>
        {/* <button
          className={`tab ${view === "games" ? "active" : ""}`}
          onClick={() => setView("games")}
        >
          Game Library
        </button> */}
      </div>

      {view === "saves" ? <Library /> : <GameLibrary />}
    </div>
  );
}
