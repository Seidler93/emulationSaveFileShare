import { useAuth } from "./auth/AuthProvider";
import Login from "./pages/Login";
import Library from "./pages/Library";

export default function App() {
  const { user, initializing } = useAuth();

  if (initializing) return <div style={{ padding: 16 }}>Loading...</div>;

  return user ? <Library /> : <Login />;
}
