import { useState } from "react";
import POS from "./POS";
import Admin from "./Admin";

function App() {
  const [vista, setVista] = useState<"pos" | "admin">("pos");

  return (
    <div style={{ height: "100vh", background: "#050505", color: "#fff" }}>
      
      {/* NAV */}
      <div style={{
        display: "flex",
        gap: "10px",
        padding: "10px",
        borderBottom: "2px solid #39FF14"
      }}>
        <button onClick={() => setVista("pos")}>
          POS
        </button>

        <button onClick={() => setVista("admin")}>
          Admin
        </button>
      </div>

      {/* VISTAS */}
      {vista === "pos" ? <POS /> : <Admin />}
    </div>
  );
}

export default App;