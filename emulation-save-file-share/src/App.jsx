import { useState } from "react";
import Login from "./components/Login";
import Library from "./components/Library";

export default function App() {
  const [ok, setOk] = useState(false);
  return ok ? <Library /> : <Login onOk={() => setOk(true)} />;
}
