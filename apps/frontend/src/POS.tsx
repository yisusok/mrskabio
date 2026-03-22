import { useEffect, useState } from "react";

export default function POS() {
  const [productos, setProductos] = useState<any[]>([]);
  const [ventas, setVentas] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nombreTurno, setNombreTurno] = useState("");

  useEffect(() => {
    const data = localStorage.getItem("ventas");
    if (data) setVentas(JSON.parse(data));

    fetch("http://localhost:3000/producto/disponibles")
      .then(res => res.json())
      .then(setProductos)
      .catch(err => console.error("Error al cargar productos:", err));
  }, []);

  useEffect(() => {
    localStorage.setItem("ventas", JSON.stringify(ventas));
  }, [ventas]);

  const agregarVenta = (producto: any) => {
    const vendido = ventas.find(v => v.productoId === producto.id);
    const disponible = producto.stock - (vendido?.cantidad || 0);
    if (disponible <= 0) return alert("Stock insuficiente");

    if (vendido) {
      setVentas(
        ventas.map(v =>
          v.productoId === producto.id
            ? { ...v, cantidad: v.cantidad + 1 }
            : v
        )
      );
    } else {
      setVentas([{ 
        id: Date.now(),
        productoId: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
        hora: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
      }, ...ventas]);
    }
  };

  const aumentar = (productoId: string) => {
    const producto = productos.find(p => p.id === productoId);
    const venta = ventas.find(v => v.productoId === productoId);
    const disponible = producto.stock - (venta?.cantidad || 0);
    if (disponible <= 0) return;
    setVentas(ventas.map(v => v.productoId === productoId ? { ...v, cantidad: v.cantidad + 1 } : v));
  };

  const disminuir = (productoId: string) => {
    setVentas(
      ventas
        .map(v => v.productoId === productoId ? { ...v, cantidad: v.cantidad - 1 } : v)
        .filter(v => v.cantidad > 0)
    );
  };

  const total = ventas.reduce((sum, v) => sum + v.precio * v.cantidad, 0);

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const terminarTurno = async () => {
    if (!nombreTurno) return alert("Ingresá tu nombre");
    if (ventas.length === 0) return alert("No hay ventas");

    try {
      // Enviar ventas al backend
      await fetch("http://localhost:3000/venta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metodoPago: "efectivo",
          items: ventas.map(v => ({ productoId: v.productoId, cantidad: v.cantidad })),
        }),
      });

      const historial = JSON.parse(localStorage.getItem("turnos") || "[]");
      historial.push({ nombre: nombreTurno, fecha: new Date(), ventas, total });
      localStorage.setItem("turnos", JSON.stringify(historial));

      setVentas([]);
      localStorage.removeItem("ventas");
      setMostrarModal(false);
      setNombreTurno("");
      alert("Turno guardado y stock actualizado correctamente");
    } catch (err) {
      console.error(err);
      alert("Error al guardar turno");
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white selection:bg-neon selection:text-black font-sans">

      <div className="w-3/5 p-8 flex flex-col border-r border-zinc-800 bg-black">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-neon text-black px-3 py-1 rounded-md font-black italic rotate-[-3deg] shadow-neon">
            MR. SKABIO
          </div>
          <input
            autoFocus
            placeholder="BUSCAR PRODUCTO..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="flex-1 p-4 rounded-2xl bg-black border-2 border-neon text-neon placeholder:text-zinc-700 shadow-neon focus:outline-none transition-all uppercase font-bold"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neon">
          {productosFiltrados.map(p => (
            <button
              key={p.id}
              onClick={() => agregarVenta(p)}
              className="group p-5 rounded-2xl border-2 border-neon bg-black hover:bg-neon transition-all duration-300 shadow-[4px_4px_0px_#00FF00] hover:shadow-none hover:translate-x-1 hover:translate-y-1 text-left"
            >
              <div className="font-black text-xl mb-1 group-hover:text-black uppercase truncate leading-none">{p.nombre}</div>
              <div className="text-neon text-2xl font-black group-hover:text-black italic">${p.precio}</div>
              <div className="text-xs text-zinc-500 mt-1">Stock disponible: {p.stock - (ventas.find(v => v.productoId === p.id)?.cantidad || 0)}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="w-2/5 p-8 flex flex-col bg-[#0a0a0a] relative">
        <h2 className="text-neon text-2xl mb-6 font-black italic tracking-tighter flex items-center gap-3">
          REGISTRO DE VENTAS <span className="h-[2px] flex-1 bg-zinc-800"></span>
        </h2>

        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
          {ventas.map(v => (
            <div key={v.id} className="mb-6 animate-in slide-in-from-right-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-lg uppercase leading-tight">{v.nombre}</div>
                  <div className="text-zinc-500 text-xs font-mono">{v.hora}</div>
                </div>
                <div className="text-neon font-black text-xl italic shadow-black drop-shadow-md">${v.precio * v.cantidad}</div>
              </div>

              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center bg-black border border-zinc-700 rounded-xl p-1">
                  <button onClick={() => disminuir(v.productoId)} className="w-8 h-8 flex items-center justify-center hover:text-red-500 transition-colors font-bold text-xl">-</button>
                  <span className="w-10 text-center font-black text-neon">{v.cantidad}</span>
                  <button onClick={() => aumentar(v.productoId)} className="w-8 h-8 flex items-center justify-center hover:text-neon transition-colors font-bold text-xl">+</button>
                </div>
                <div className="h-[1px] flex-1 bg-zinc-900"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <span className="font-black text-xl text-neon">TOTAL:</span>
          <span className="font-black text-2xl text-neon">${total}</span>
        </div>

        <button
          onClick={() => setMostrarModal(true)}
          className="mt-6 w-full p-5 bg-neon text-black font-black text-xl rounded-2xl shadow-neon hover:scale-[1.02] active:scale-95 transition-all italic"
        >
          TERMINAR TURNO
        </button>

        {mostrarModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-black p-10 rounded-[2rem] border-4 border-neon shadow-neon w-full max-w-md">
              <h2 className="text-neon text-4xl mb-6 font-black italic uppercase">Confirmar Turno</h2>
              <input
                placeholder="Tu nombre..."
                value={nombreTurno}
                onChange={e => setNombreTurno(e.target.value)}
                className="w-full p-4 mb-8 rounded-2xl bg-black border-2 border-zinc-800 text-neon focus:border-neon font-black text-xl uppercase transition-all"
              />

              <div className="flex gap-4">
                <button
                  onClick={terminarTurno}
                  className="flex-1 p-4 bg-neon text-black rounded-2xl font-black text-xl uppercase hover:scale-[1.02] transition-transform"
                >
                  CONFIRMAR
                </button>
                <button
                  onClick={() => setMostrarModal(false)}
                  className="flex-1 p-4 bg-red-600 text-black rounded-2xl font-black text-xl uppercase hover:scale-[1.02] transition-transform"
                >
                  CANCELAR
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}