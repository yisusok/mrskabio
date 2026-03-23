import { useEffect, useState } from "react";

export default function Admin() {
  const [productos, setProductos] = useState<any[]>([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState(0);
  const [stock, setStock] = useState(0);

  const [esCombo, setEsCombo] = useState(false);
  const [comboItems, setComboItems] = useState<any[]>([]);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoEditar, setProductoEditar] = useState<any>(null);
  const [nombreEdit, setNombreEdit] = useState("");
  const [precioEdit, setPrecioEdit] = useState(0);
  const [stockEdit, setStockEdit] = useState(0);

  const cargar = () => {
    fetch("http://localhost:3000/producto")
      .then((res) => res.json())
      .then(setProductos)
      .catch((err) => console.error("Error backend:", err));
  };

  useEffect(() => {
    cargar();
  }, []);

  const crear = async () => {
    if (!nombre || precio <= 0) return alert("DATOS INCOMPLETOS");

    let url = "http://localhost:3000/producto";
    let payload: any;

    if (esCombo) {
      if (comboItems.length === 0) return alert("AGREGÁ PRODUCTOS AL COMBO");
      url = "http://localhost:3000/producto/combo";
      payload = {
        nombre,
        precio,
        items: comboItems.map((i) => ({
          productoId: i.productoId,
          cantidad: i.cantidad,
        })),
      };
    } else {
      payload = { nombre, precio, stock, esCombo: false };
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("ERROR AL CREAR");

      setNombre("");
      setPrecio(0);
      setStock(0);
      setEsCombo(false);
      setComboItems([]);
      cargar();
    } catch (err) {
      alert("ERROR EN EL SERVIDOR");
    }
  };

  const agregarItemCombo = (productoId: string) => {
    const existente = comboItems.find((i) => i.productoId === productoId);
    if (existente) {
      setComboItems(
        comboItems.map((i) =>
          i.productoId === productoId ? { ...i, cantidad: i.cantidad + 1 } : i
        )
      );
    } else {
      const prod = productos.find((p) => p.id === productoId);
      setComboItems([...comboItems, { productoId, nombre: prod?.nombre, cantidad: 1 }]);
    }
  };

  const quitarItemCombo = (productoId: string) => {
    setComboItems(comboItems.filter((i) => i.productoId !== productoId));
  };

  const editar = (p: any) => {
    setProductoEditar(p);
    setNombreEdit(p.nombre);
    setPrecioEdit(p.precio);
    setStockEdit(p.stock);
    setMostrarModal(true);
  };

  const guardarEdicion = async () => {
    try {
      await fetch(`http://localhost:3000/producto/${productoEditar.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombreEdit,
          precio: precioEdit,
          stock: productoEditar.esCombo ? 0 : stockEdit, // Forzamos 0 si es combo
        }),
      });
      setMostrarModal(false);
      cargar();
    } catch (err) {
      alert("ERROR AL EDITAR");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans uppercase">
      {/* HEADER MR. SKABIO */}
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-[#39FF14] text-black px-4 py-1 rounded-md font-black italic rotate-[-2deg] shadow-[0_0_20px_#39FF14]">
          MR. SKABIO
        </div>
        <h2 className="text-3xl font-black tracking-tighter italic border-b-4 border-[#39FF14] pr-6">
          ADMIN PANEL
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* FORMULARIO DE INGRESO */}
        <div className="bg-black p-6 rounded-3xl border-2 border-zinc-800 shadow-[10px_10px_0px_#18181b]">
          <h3 className="text-[#39FF14] font-black mb-6 text-xl tracking-widest flex items-center gap-2">
             {esCombo ? "NUEVO COMBO 🔥" : "NUEVO PRODUCTO"}
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl cursor-pointer" onClick={() => setEsCombo(!esCombo)}>
              <input
                type="checkbox"
                className="w-5 h-5 accent-[#39FF14]"
                checked={esCombo}
                readOnly
              />
              <span className={`font-bold text-sm ${esCombo ? "text-[#39FF14]" : "text-zinc-500"}`}>MODO COMBO ACTIVADO</span>
            </div>

            <input
              placeholder="NOMBRE DEL ARTÍCULO"
              value={nombre}
              onChange={(e) => setNombre(e.target.value.toUpperCase())}
              className="w-full p-4 bg-black border-2 border-zinc-800 rounded-2xl text-[#39FF14] focus:border-[#39FF14] transition-all outline-none"
            />

            <input
              type="number"
              placeholder="PRECIO DE VENTA"
              value={precio || ""}
              onChange={(e) => setPrecio(+e.target.value)}
              className="w-full p-4 bg-black border-2 border-zinc-800 rounded-2xl text-[#39FF14] focus:border-[#39FF14] outline-none"
            />

            {!esCombo && (
              <input
                type="number"
                placeholder="STOCK ACTUAL"
                value={stock || ""}
                onChange={(e) => setStock(+e.target.value)}
                className="w-full p-4 bg-black border-2 border-zinc-800 rounded-2xl text-[#39FF14] focus:border-[#39FF14] outline-none"
              />
            )}

            {/* BUILDER DE COMBOS */}
            {esCombo && (
              <div className="border-2 border-[#39FF14]/20 p-4 rounded-2xl bg-zinc-900/20 animate-pulse-slow">
                <div className="text-[#39FF14] mb-3 font-black text-[10px] tracking-tighter">COMPONENTES DISPONIBLES:</div>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto mb-4 pr-2 custom-scrollbar">
                  {productos
                    .filter((p) => !p.esCombo)
                    .map((p) => (
                      <button
                        key={p.id}
                        onClick={() => agregarItemCombo(p.id)}
                        className="p-2 border border-zinc-800 rounded-lg hover:border-[#39FF14] text-[9px] text-zinc-500 hover:text-[#39FF14] transition-all bg-black"
                      >
                        + {p.nombre}
                      </button>
                    ))}
                </div>

                <div className="space-y-2 border-t border-zinc-800 pt-3">
                  {comboItems.length === 0 && <div className="text-zinc-700 text-[10px] text-center italic">EL COMBO ESTÁ VACÍO</div>}
                  {comboItems.map((i) => (
                    <div key={i.productoId} className="flex justify-between items-center text-[11px] bg-zinc-900 p-2 rounded-xl border border-zinc-800">
                      <span className="font-bold">{i.nombre} <span className="text-[#39FF14] ml-1">x{i.cantidad}</span></span>
                      <button onClick={() => quitarItemCombo(i.productoId)} className="w-6 h-6 flex items-center justify-center bg-red-900/30 text-red-500 rounded-full hover:bg-red-600 hover:text-white transition-all">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={crear}
              className="w-full p-5 bg-[#39FF14] text-black font-black text-xl rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(57,255,20,0.3)]"
            >
              REGISTRAR EN BASE
            </button>
          </div>
        </div>

        {/* TABLA DE PRODUCTOS */}
        <div className="lg:col-span-2">
          <div className="bg-[#0a0a0a] rounded-3xl border-2 border-zinc-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900/80 text-zinc-500 text-[10px] tracking-[0.2em]">
                    <th className="p-5">ARTÍCULO</th>
                    <th className="p-5 text-center">TIPO</th>
                    <th className="p-5 text-center">STOCK FIS.</th>
                    <th className="p-5 text-right">PRECIO</th>
                    <th className="p-5 text-center">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {productos.map((p) => (
                    <tr key={p.id} className="hover:bg-[#39FF14]/5 transition-colors group">
                      <td className="p-5 font-black text-sm group-hover:text-[#39FF14]">{p.nombre}</td>
                      <td className="p-5 text-center">
                        {p.esCombo ? (
                          <span className="bg-orange-500/10 text-orange-500 text-[8px] font-bold px-2 py-1 rounded-md border border-orange-500/20">COMBO 🔥</span>
                        ) : (
                          <span className="bg-blue-500/10 text-blue-400 text-[8px] font-bold px-2 py-1 rounded-md border border-blue-500/20">SIMPLE</span>
                        )}
                      </td>
                      <td className="p-5 text-center font-mono text-xs">
                        {p.esCombo ? <span className="text-zinc-700 italic">DEPENDIENTE</span> : p.stock}
                      </td>
                      <td className="p-5 text-right font-black text-[#39FF14] text-base">${p.precio}</td>
                      <td className="p-5">
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => editar(p)} className="p-2 bg-zinc-900 border border-zinc-800 hover:border-[#39FF14] hover:text-[#39FF14] transition-all rounded-xl text-[9px] font-bold">
                            EDIT
                          </button>
                          <button 
                            onClick={() => {
                              if(window.confirm(`¿ELIMINAR ${p.nombre}?`)) {
                                fetch(`http://localhost:3000/producto/${p.id}`, { method: "DELETE" }).then(cargar);
                              }
                            }}
                            className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-red-600 hover:text-white transition-all rounded-xl text-[9px] font-bold"
                          >
                            DEL
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE EDICIÓN */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-[#050505] p-8 border-2 border-[#39FF14] rounded-[2rem] w-full max-w-md shadow-[0_0_100px_rgba(57,255,20,0.1)]">
            <h3 className="text-[#39FF14] font-black text-2xl mb-8 italic tracking-tighter">MODIFICAR DATOS</h3>
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 ml-2">NOMBRE</label>
                <input value={nombreEdit} onChange={e => setNombreEdit(e.target.value.toUpperCase())} className="w-full p-4 bg-zinc-900 border-2 border-zinc-800 rounded-2xl text-[#39FF14] outline-none focus:border-[#39FF14]" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 ml-2">PRECIO</label>
                <input type="number" value={precioEdit} onChange={e => setPrecioEdit(+e.target.value)} className="w-full p-4 bg-zinc-900 border-2 border-zinc-800 rounded-2xl text-[#39FF14] outline-none focus:border-[#39FF14]" />
              </div>
              {!productoEditar?.esCombo && (
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 ml-2">STOCK FISICO</label>
                  <input type="number" value={stockEdit} onChange={e => setStockEdit(+e.target.value)} className="w-full p-4 bg-zinc-900 border-2 border-zinc-800 rounded-2xl text-[#39FF14] outline-none focus:border-[#39FF14]" />
                </div>
              )}
              <div className="flex gap-4 pt-6">
                <button onClick={guardarEdicion} className="flex-2 p-4 bg-[#39FF14] text-black font-black rounded-2xl hover:shadow-[0_0_20px_#39FF14] transition-all">ACTUALIZAR</button>
                <button onClick={() => setMostrarModal(false)} className="flex-1 p-4 bg-zinc-800 text-white font-black rounded-2xl">VOLVER</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}