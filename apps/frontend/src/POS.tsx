import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

// 🔥 Definimos qué recibe el POS desde el App.tsx
interface POSProps {
  carrito: any[];
  setCarrito: Dispatch<SetStateAction<any[]>>;
  nombreTurno: string;
  setNombreTurno: Dispatch<SetStateAction<string>>;
}

export default function POS({ carrito, setCarrito, nombreTurno, setNombreTurno }: POSProps) {
  const [productos, setProductos] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "mercado_pago">("efectivo");
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = () => {
    fetch("http://localhost:3000/producto/disponibles")
      .then(res => res.json())
      .then(setProductos)
      .catch(err => console.error("Error al sincronizar stock:", err));
  };

  const getUsoEnCarrito = (idSimple: string) => {
    return carrito.reduce((acc, item) => {
      if (item.productoId === idSimple) return acc + item.cantidad;
      const pOriginal = productos.find(p => p.id === item.productoId);
      if (pOriginal?.esCombo) {
        const detalle = pOriginal.comboDetalles?.find((d: any) => d.productoId === idSimple);
        return acc + (detalle ? detalle.cantidad * item.cantidad : 0);
      }
      return acc;
    }, 0);
  };

  const getStockSimulado = (p: any) => {
    if (!p.esCombo) return p.stock - getUsoEnCarrito(p.id);
    if (!p.comboDetalles) return 0;
    const disponibilidades = p.comboDetalles.map((d: any) => {
      const hijo = productos.find(prod => prod.id === d.productoId);
      if (!hijo) return 0;
      const libre = hijo.stock - getUsoEnCarrito(hijo.id);
      return Math.floor(libre / d.cantidad);
    });
    return Math.min(...disponibilidades, 99);
  };

  const agregarAlCarrito = (producto: any) => {
    if (getStockSimulado(producto) <= 0) return;
    const existe = carrito.find(v => v.productoId === producto.id);
    if (existe) {
      setCarrito(carrito.map(v => v.productoId === producto.id ? { ...v, cantidad: v.cantidad + 1 } : v));
    } else {
      setCarrito([{ 
        id: Date.now(), productoId: producto.id, nombre: producto.nombre, 
        precio: producto.precio, esCombo: producto.esCombo, cantidad: 1 
      }, ...carrito]);
    }
  };

  const modificarCantidad = (id: string, delta: number) => {
    if (delta > 0) {
      const p = productos.find(prod => prod.id === id);
      if (getStockSimulado(p) <= 0) return;
    }
    setCarrito(carrito.map(v => v.productoId === id ? { ...v, cantidad: v.cantidad + delta } : v).filter(v => v.cantidad > 0));
  };

  const finalizarVenta = async () => {
    if (!nombreTurno || carrito.length === 0) return alert("COMPLETAR DATOS");
    try {
      const res = await fetch("http://localhost:3000/venta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metodoPago,
          items: carrito.map(v => ({ productoId: v.productoId, cantidad: v.cantidad })),
        }),
      });

      if (res.ok) {
        setCarrito([]); // App.tsx se encargará de limpiar el localStorage
        setMostrarModal(false);
        cargarProductos();
        alert("VENTA EXITOSA 🔥");
      }
    } catch (err) { alert("ERROR AL COBRAR"); }
  };

  const total = carrito.reduce((sum, v) => sum + Number(v.precio) * v.cantidad, 0);

  return (
    <div className="flex h-[calc(100vh-70px)] bg-[#050505] text-white font-sans uppercase overflow-hidden">
      
      {/* GRILLA */}
      <div className="w-3/5 p-8 flex flex-col border-r border-zinc-900 bg-black">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-[#39FF14] text-black px-3 py-1 rounded-md font-black italic rotate-[-3deg] shadow-[0_0_15px_#39FF14]">MR. SKABIO</div>
          <input 
            placeholder="BUSCAR BEBIDA..." 
            className="flex-1 p-4 rounded-2xl bg-black border-2 border-[#39FF14] text-[#39FF14] font-bold outline-none uppercase"
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 custom-scrollbar">
          {productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase())).map(p => {
            const stockReal = getStockSimulado(p);
            return (
              <button
                key={p.id} disabled={stockReal <= 0} onClick={() => agregarAlCarrito(p)}
                className={`relative p-5 rounded-3xl border-2 transition-all text-left ${stockReal <= 0 ? 'opacity-20 border-zinc-800' : 'border-zinc-800 hover:border-[#39FF14] bg-zinc-950'}`}
              >
                {p.esCombo && <span className="absolute top-2 right-2 text-[8px] bg-orange-600 text-black px-2 py-0.5 rounded-full font-black">COMBO</span>}
                <div className="font-black text-sm truncate">{p.nombre}</div>
                <div className="text-2xl font-black text-[#39FF14] italic">${p.precio}</div>
                <div className={`text-[10px] font-bold mt-2 ${stockReal < 5 ? 'text-red-500' : 'text-zinc-600'}`}>
                   {p.esCombo ? `COMBOS: ${stockReal}` : `STOCK: ${stockReal}`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* TICKET (PERSISTENTE) */}
      <div className="w-2/5 p-8 flex flex-col bg-[#080808]">
        <h2 className="text-[#39FF14] text-xl mb-8 font-black italic flex items-center gap-3">
          TICKET ACTUAL <span className="h-[1px] flex-1 bg-zinc-900"></span>
        </h2>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {carrito.length === 0 && <div className="h-full flex items-center justify-center text-zinc-800 font-black italic text-xl rotate-[-5deg] text-center">ESPERANDO PEDIDO...</div>}
          {carrito.map(v => (
            <div key={v.id} className="mb-6 border-b border-zinc-900 pb-4">
              <div className="flex justify-between font-black mb-2">
                <span className="text-sm">{v.nombre}</span>
                <span className="text-[#39FF14]">${v.precio * v.cantidad}</span>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => modificarCantidad(v.productoId, -1)} className="w-8 h-8 border-2 border-zinc-800 rounded-xl hover:bg-red-600 transition-colors font-black">-</button>
                <span className="text-xl font-black text-[#39FF14] w-8 text-center">{v.cantidad}</span>
                <button onClick={() => modificarCantidad(v.productoId, 1)} className="w-8 h-8 border-2 border-zinc-800 rounded-xl hover:bg-[#39FF14] hover:text-black transition-colors font-black">+</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t-4 border-double border-zinc-900">
          <div className="flex justify-between text-3xl font-black text-[#39FF14] mb-6">
            <span className="text-zinc-500 text-sm">TOTAL</span> <span>${total}</span>
          </div>
          <button 
            onClick={() => setMostrarModal(true)} 
            className="w-full p-6 bg-[#39FF14] text-black font-black text-2xl rounded-3xl shadow-[0_0_20px_#39FF14] hover:scale-105 transition-all"
          >
            COBRAR
          </button>
        </div>
      </div>

      {/* MODAL COBRO */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 p-10 rounded-[3rem] border-4 border-[#39FF14] max-w-sm w-full">
            <input 
              placeholder="NOMBRE DEL CAJERO" 
              className="w-full p-5 bg-black border-2 border-zinc-800 rounded-2xl text-[#39FF14] mb-6 font-black outline-none focus:border-[#39FF14] uppercase"
              value={nombreTurno} onChange={e => setNombreTurno(e.target.value.toUpperCase())}
            />
            <div className="flex gap-2 mb-8">
                <button onClick={() => setMetodoPago("efectivo")} className={`flex-1 p-3 rounded-xl border-2 font-black text-[10px] ${metodoPago === "efectivo" ? "border-[#39FF14] text-[#39FF14] bg-[#39FF14]/10" : "border-zinc-900 text-zinc-600"}`}>EFECTIVO</button>
                <button onClick={() => setMetodoPago("mercado_pago")} className={`flex-1 p-3 rounded-xl border-2 font-black text-[10px] ${metodoPago === "mercado_pago" ? "border-[#009EE3] text-[#009EE3] bg-[#009EE3]/10" : "border-zinc-900 text-zinc-600"}`}>MERCADO PAGO</button>
            </div>
            <button onClick={finalizarVenta} className="w-full p-5 bg-[#39FF14] text-black font-black rounded-2xl text-xl italic">CONFIRMAR VENTA</button>
            <button onClick={() => setMostrarModal(false)} className="w-full mt-4 text-zinc-600 font-bold text-xs">CANCELAR</button>
          </div>
        </div>
      )}
    </div>
  );
}