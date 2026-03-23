import { useState } from "react";

export default function Reportes() {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const buscar = async () => {
    if (!desde || !hasta) return alert("Seleccioná fechas");

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:3000/venta/reporte?desde=${desde}&hasta=${hasta}`
      );

      const data = await res.json();
      setVentas(data);
    } catch (err) {
      console.error(err);
      alert("Error al obtener reportes");
    }

    setLoading(false);
  };

  // 🔥 TOTAL GENERAL
  const totalGeneral = ventas.reduce(
    (sum, v) => sum + Number(v.total),
    0
  );

  // 🔥 TOTAL PRODUCTOS VENDIDOS
  const totalItems = ventas.reduce(
    (sum, v) =>
      sum +
      v.detalles.reduce((s: number, d: any) => s + d.cantidad, 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans uppercase">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-neon text-black px-4 py-1 rounded-md font-black italic rotate-[-2deg] shadow-neon">
          MR. SKABIO
        </div>
        <h2 className="text-3xl font-black tracking-tighter italic border-b-4 border-neon pr-6">
          REPORTES
        </h2>
      </div>

      {/* FILTROS */}
      <div className="bg-black p-6 rounded-3xl border-2 border-zinc-800 mb-10 flex flex-col lg:flex-row gap-4 items-end">
        <div className="flex flex-col">
          <label className="text-xs text-zinc-500 mb-1">DESDE</label>
          <input
            type="date"
            value={desde}
            onChange={e => setDesde(e.target.value)}
            className="p-3 rounded-xl bg-black border-2 border-zinc-800 text-neon"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-zinc-500 mb-1">HASTA</label>
          <input
            type="date"
            value={hasta}
            onChange={e => setHasta(e.target.value)}
            className="p-3 rounded-xl bg-black border-2 border-zinc-800 text-neon"
          />
        </div>

        <button
          onClick={buscar}
          className="p-4 bg-neon text-black font-black rounded-xl shadow-neon hover:scale-[1.02] transition-all"
        >
          BUSCAR
        </button>
      </div>

      {/* RESUMEN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-black p-6 rounded-2xl border-2 border-zinc-800">
          <div className="text-zinc-500 text-xs">TOTAL RECAUDADO</div>
          <div className="text-3xl text-neon font-black">
            ${totalGeneral}
          </div>
        </div>

        <div className="bg-black p-6 rounded-2xl border-2 border-zinc-800">
          <div className="text-zinc-500 text-xs">VENTAS REALIZADAS</div>
          <div className="text-3xl text-neon font-black">
            {ventas.length}
          </div>
        </div>

        <div className="bg-black p-6 rounded-2xl border-2 border-zinc-800">
          <div className="text-zinc-500 text-xs">PRODUCTOS VENDIDOS</div>
          <div className="text-3xl text-neon font-black">
            {totalItems}
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-[#0a0a0a] rounded-3xl border-2 border-zinc-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-900 text-zinc-400 text-[10px] tracking-[0.2em]">
              <th className="p-4 border-b border-zinc-800">FECHA</th>
              <th className="p-4 border-b border-zinc-800">METODO</th>
              <th className="p-4 border-b border-zinc-800">DETALLE</th>
              <th className="p-4 border-b border-zinc-800 text-right">TOTAL</th>
            </tr>
          </thead>

          <tbody>
            {ventas.map((v: any) => (
              <tr key={v.id} className="border-b border-zinc-900">
                <td className="p-4 text-zinc-400">
                  {new Date(v.fecha).toLocaleDateString()}
                </td>

                <td className="p-4">{v.metodoPago}</td>

                <td className="p-4 text-xs">
                  {v.detalles.map((d: any, i: number) => (
                    <div key={i}>
                      {d.cantidad}x {d.productoId}
                    </div>
                  ))}
                </td>

                <td className="p-4 text-right font-black text-neon">
                  ${v.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {ventas.length === 0 && !loading && (
          <div className="p-20 text-center text-zinc-700 font-black italic">
            SIN DATOS
          </div>
        )}

        {loading && (
          <div className="p-20 text-center text-neon font-black">
            CARGANDO...
          </div>
        )}
      </div>
    </div>
  );
}