import { useState, useEffect } from "react";
import POS from "./POS";
import Admin from "./Admin";
import Reportes from "./Reportes";

export default function App() {
  const [vista, setVista] = useState<"pos" | "admin" | "reportes">("pos");
  
  // 🔥 ESTADO GLOBAL: Vive aquí para que no se borre al navegar
  const [carrito, setCarrito] = useState<any[]>([]);
  const [nombreTurno, setNombreTurno] = useState("");

  // Recuperar datos del localStorage al iniciar la app
  useEffect(() => {
    const c = localStorage.getItem("skabio_carrito_activo");
    const n = localStorage.getItem("skabio_cajero_activo");
    if (c) setCarrito(JSON.parse(c));
    if (n) setNombreTurno(n);
  }, []);

  // Guardar datos automáticamente ante cualquier cambio
  useEffect(() => {
    localStorage.setItem("skabio_carrito_activo", JSON.stringify(carrito));
    localStorage.setItem("skabio_cajero_activo", nombreTurno);
  }, [carrito, nombreTurno]);

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "sans-serif" }}>
      
      {/* NAV */}
      <div style={{ display: "flex", gap: "10px", padding: "15px", borderBottom: "2px solid #39FF14", background: "#111" }}>
        <button style={buttonStyle(vista === "pos")} onClick={() => setVista("pos")}>POS</button>
        <button style={buttonStyle(vista === "admin")} onClick={() => setVista("admin")}>INVENTARIO</button>
        <button style={buttonStyle(vista === "reportes")} onClick={() => setVista("reportes")}>📊 REPORTES</button>
      </div>

      {/* VISTAS: Pasamos el estado como PROPS */}
      <div style={{ padding: "0px" }}>
        {vista === "pos" && (
          <POS 
            carrito={carrito} 
            setCarrito={setCarrito} 
            nombreTurno={nombreTurno} 
            setNombreTurno={setNombreTurno} 
          />
        )}
        {vista === "admin" && <Admin />}
        {vista === "reportes" && <Reportes />}
      </div>
    </div>
  );
}

const buttonStyle = (active: boolean) => ({
  background: active ? "#39FF14" : "transparent",
  color: active ? "#000" : "#39FF14",
  border: "1px solid #39FF14",
  padding: "8px 16px",
  cursor: "pointer",
  fontWeight: "bold" as "bold",
  borderRadius: "4px",
  transition: "all 0.3s ease",
  textTransform: "uppercase" as "uppercase"
});