import { useEffect, useState } from "react";

export default function Admin() {
  const [productos, setProductos] = useState<any[]>([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState(0);
  const [stock, setStock] = useState(0);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoEditar, setProductoEditar] = useState<any>(null);
  const [nombreEdit, setNombreEdit] = useState("");
  const [precioEdit, setPrecioEdit] = useState(0);
  const [stockEdit, setStockEdit] = useState(0);

  const cargar = () => {
    fetch("http://localhost:3000/producto")
      .then(res => res.json())
      .then(setProductos)
      .catch(err => console.error("Error backend:", err));
  };

  useEffect(() => {
    cargar();
  }, []);

  const crear = async () => {
    if (!nombre || precio <= 0) return alert("Datos incompletos");

    await fetch("http://localhost:3000/producto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, precio, stock }),
    });

    setNombre("");
    setPrecio(0);
    setStock(0);
    cargar();
  };

  const editar = (p: any) => {
    setProductoEditar(p);
    setNombreEdit(p.nombre);
    setPrecioEdit(p.precio);
    setStockEdit(p.stock);
    setMostrarModal(true);
  };

  const guardarEdicion = async () => {
    if (!nombreEdit || precioEdit <= 0 || stockEdit < 0)
      return alert("Datos incorrectos");

    await fetch(`http://localhost:3000/producto/${productoEditar.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nombreEdit,
        precio: precioEdit,
        stock: stockEdit,
      }),
    });

    setMostrarModal(false);
    setProductoEditar(null);
    cargar();
  };

  const eliminarProducto = async (id: string) => {
    if (!confirm("¿Seguro que querés eliminar este producto?")) return;
    await fetch(`http://localhost:3000/producto/${id}`, { method: "DELETE" });
    cargar();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans selection:bg-neon selection:text-black uppercase">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-neon text-black px-4 py-1 rounded-md font-black italic rotate-[-2deg] shadow-neon">
          MR. SKABIO
        </div>
        <h2 className="text-3xl font-black tracking-tighter italic border-b-4 border-neon pr-6">
          ADMIN PRODUCTOS
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* FORMULARIO DE CARGA */}
        <div className="lg:col-span-1 bg-black p-6 rounded-3xl border-2 border-zinc-800 shadow-[10px_10px_0px_#18181b]">
          <h3 className="text-neon font-black mb-6 text-xl tracking-widest">NUEVO INGRESO</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-zinc-500 font-bold ml-2">NOMBRE DEL PRODUCTO</label>
              <input 
                placeholder="EJ: FERNET 750ML" 
                value={nombre}
                onChange={e => setNombre(e.target.value.toUpperCase())} 
                className="w-full p-4 bg-black border-2 border-zinc-800 rounded-2xl focus:border-neon focus:shadow-neon outline-none transition-all font-bold text-neon"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold ml-2">PRECIO ($)</label>
                <input 
                  type="number" 
                  placeholder="0" 
                  value={precio || ""}
                  onChange={e => setPrecio(+e.target.value)} 
                  className="w-full p-4 bg-black border-2 border-zinc-800 rounded-2xl focus:border-neon focus:shadow-neon outline-none transition-all font-bold text-neon"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 font-bold ml-2">STOCK INICIAL</label>
                <input 
                  type="number" 
                  placeholder="0" 
                  value={stock || ""}
                  min={0}
                  onChange={e => setStock(Math.max(0, +e.target.value))} 
                  className="w-full p-4 bg-black border-2 border-zinc-800 rounded-2xl focus:border-neon focus:shadow-neon outline-none transition-all font-bold text-neon"
                />
              </div>
            </div>

            <button 
              onClick={crear}
              className="w-full mt-4 p-5 bg-neon text-black font-black text-xl rounded-2xl shadow-neon hover:scale-[1.02] active:scale-95 transition-all italic"
            >
              CARGAR AL SISTEMA
            </button>
          </div>
        </div>

        {/* LISTADO DE PRODUCTOS */}
        <div className="lg:col-span-2">
          <div className="bg-[#0a0a0a] rounded-3xl border-2 border-zinc-800 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900 text-zinc-400 text-[10px] tracking-[0.2em]">
                  <th className="p-4 border-b border-zinc-800">PRODUCTO</th>
                  <th className="p-4 border-b border-zinc-800 text-center">STOCK</th>
                  <th className="p-4 border-b border-zinc-800 text-right">PRECIO</th>
                  <th className="p-4 border-b border-zinc-800 text-center">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="custom-scrollbar">
                {productos.map((p: any) => (
                  <tr key={p.id} className="border-b border-zinc-900 hover:bg-zinc-900/50 transition-colors group">
                    <td className="p-4 font-black group-hover:text-neon transition-colors">{p.nombre}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full font-mono text-xs ${p.stock < 10 ? 'bg-red-900/30 text-red-500 border border-red-500/50' : 'bg-neon/10 text-neon border border-neon/30'}`}>
                        {p.stock} UNIDADES
                      </span>
                    </td>
                    <td className="p-4 text-right font-black text-xl italic text-neon drop-shadow-sm">${p.precio}</td>
                    <td className="p-4 text-center flex gap-2 justify-center">
                      <button onClick={() => editar(p)} className="px-3 py-1 bg-neon text-black rounded-md font-bold">EDITAR</button>
                      <button onClick={() => eliminarProducto(p.id)} className="px-3 py-1 bg-red-600 text-black rounded-md font-bold">ELIMINAR</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {productos.length === 0 && (
              <div className="p-20 text-center text-zinc-700 font-black italic tracking-widest uppercase">
                No hay mercadería cargada
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL EDITAR */}
      {mostrarModal && productoEditar && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black p-10 rounded-[2rem] border-4 border-neon shadow-neon w-full max-w-md">
            <h2 className="text-neon text-4xl mb-4 font-black italic tracking-tighter uppercase">Editar Producto</h2>
            <input
              placeholder="NOMBRE"
              value={nombreEdit}
              onChange={e => setNombreEdit(e.target.value.toUpperCase())}
              className="w-full p-4 mb-4 rounded-2xl bg-black border-2 border-zinc-800 text-neon focus:border-neon font-black text-xl uppercase transition-all"
            />
            <input
              type="number"
              placeholder="PRECIO"
              value={precioEdit || ""}
              onChange={e => setPrecioEdit(+e.target.value)}
              className="w-full p-4 mb-4 rounded-2xl bg-black border-2 border-zinc-800 text-neon focus:border-neon font-black text-xl transition-all"
            />
            <input
              type="number"
              placeholder="STOCK"
              value={stockEdit || ""}
              min={0}
              onChange={e => setStockEdit(Math.max(0, +e.target.value))}
              className="w-full p-4 mb-8 rounded-2xl bg-black border-2 border-zinc-800 text-neon focus:border-neon font-black text-xl transition-all"
            />

            <div className="flex gap-4">
              <button
                onClick={guardarEdicion}
                className="flex-1 p-4 bg-neon text-black rounded-2xl font-black text-xl uppercase hover:scale-[1.02] transition-transform"
              >
                Guardar
              </button>
              <button
                onClick={() => setMostrarModal(false)}
                className="flex-1 p-4 bg-red-600 text-black rounded-2xl font-black text-xl uppercase hover:scale-[1.02] transition-transform"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}