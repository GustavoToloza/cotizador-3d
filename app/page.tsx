"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Cotizador3D() {
  const [pestañaActiva, setPestañaActiva] = useState("general");

  // Parámetros Globales de Máquina y Energía
  const [precioKg, setPrecioKg] = useState(25500);
  const [watts, setWatts] = useState(120);
  const [costoKwh, setCostoKwh] = useState(50);
  const [desgasteHora, setDesgasteHora] = useState(346.5);

  // Estados Formulario General
  const [generalNombre, setGeneralNombre] = useState("");
  const [generalCliente, setGeneralCliente] = useState("");
  const [generalMaterial, setGeneralMaterial] = useState("PLA");
  const [generalPeso, setGeneralPeso] = useState(50);
  const [generalHoras, setGeneralHoras] = useState(2);
  const [generalMinutos, setGeneralMinutos] = useState(30);
  const [generalMargen, setGeneralMargen] = useState(4);
  const [generalPiezas, setGeneralPiezas] = useState(1);

  // Estados Formulario Chops
  const [chopNombre, setChopNombre] = useState("Chop Futbolero / Fernet");
  const [chopCliente, setChopCliente] = useState("");
  const [chopTipoVenta, setChopTipoVenta] = useState("minorista");
  const [chopPeso, setChopPeso] = useState(180);
  const [chopHoras, setChopHoras] = useState(8);
  const [chopMinutos, setChopMinutos] = useState(0);
  const [chopCantidad, setChopCantidad] = useState(1);
  const [chopCostoAluminio, setChopCostoAluminio] = useState(3500);
  const [chopCostoLogos, setChopCostoLogos] = useState(800);
  const [chopDescuentoMayorista, setChopDescuentoMayorista] = useState(20);
  const [chopMargen, setChopMargen] = useState(2.2);

  // Estados Formulario Llaveros (Por Plancha)
  const [llaveroNombre, setLlaveroNombre] = useState("Llavero Logo Custom");
  const [llaveroCliente, setLlaveroCliente] = useState("");
  const [llaveroColores, setLlaveroColores] = useState("2");
  const [llaverosPorPlancha, setLlaverosPorPlancha] = useState(10);
  const [pesoTotalPlancha, setPesoTotalPlancha] = useState(30);
  const [planchaHoras, setPlanchaHoras] = useState(1);
  const [planchaMinutos, setPlanchaMinutos] = useState(40);
  const [cantidadLlaverosPedida, setCantidadLlaverosPedida] = useState(20);
  const [llaveroMargen, setLlaveroMargen] = useState(2.2);

  // Estados Formulario Llavero Unitario Rápido
  const [unitarioNombre, setUnitarioNombre] = useState("Llavero Unitario");
  const [unitarioColores, setUnitarioColores] = useState("1");
  const [unitarioPeso, setUnitarioPeso] = useState(12);
  const [unitarioHoras, setUnitarioHoras] = useState(0);
  const [unitarioMinutos, setUnitarioMinutos] = useState(25);
  const [unitarioMargen, setUnitarioMargen] = useState(3.0);

  // Historiales sincronizados con Supabase
  const [historialCotizaciones, setHistorialCotizaciones] = useState([]);
  const [historialPresupuestos, setHistorialPresupuestos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);

  // Cargar datos desde Supabase al iniciar la app
  useEffect(() => {
    cargarDatosSupabase();
  }, []);

  const cargarDatosSupabase = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("registros")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setHistorialCotizaciones(data.filter((item) => item.tipo_historial === "cotizaciones"));
      setHistorialPresupuestos(data.filter((item) => item.tipo_historial === "presupuestos"));
    }
    setCargando(false);
  };

  // Función de cálculo de costos base
  const calcularCostosBase = (pesoGramos, horas, mins, precioKilo, w, kwh, desgaste) => {
    const tiempoTotalHs = Number(horas) + Number(mins) / 60;
    const costoMat = Number(pesoGramos) * (Number(precioKilo) / 1000);
    const luz = (tiempoTotalHs * (Number(w) / 1000)) * Number(kwh);
    const amort = tiempoTotalHs * Number(desgaste);
    const total = costoMat + luz + amort;
    return { costoMat, luz, amort, total, tiempoTotalHs };
  };

  // 1. Cálculos Cotizador General
  const calcGeneral = calcularCostosBase(generalPeso, generalHoras, generalMinutos, precioKg, watts, costoKwh, desgasteHora);
  const costoTotalLoteGeneral = calcGeneral.total * Number(generalPiezas);
  const ventaGeneralTotal = costoTotalLoteGeneral * Number(generalMargen);
  const gananciaGeneralTotal = ventaGeneralTotal - costoTotalLoteGeneral;

  // 2. Cálculos Chops
  const calcChopUnitario = calcularCostosBase(chopPeso, chopHoras, chopMinutos, precioKg, watts, costoKwh, desgasteHora);
  const costoInsumosExtraChop = Number(chopCostoAluminio) + Number(chopCostoLogos);
  const costoTotalPorChop = calcChopUnitario.total + costoInsumosExtraChop;
  const chopCostoTotalLote = costoTotalPorChop * Number(chopCantidad);
  const chopVentaSinDescuento = chopCostoTotalLote * Number(chopMargen);
  const chopVentaFinal = chopTipoVenta === "mayorista" 
    ? chopVentaSinDescuento * (1 - Number(chopDescuentoMayorista) / 100)
    : chopVentaSinDescuento;
  const chopGananciaFinal = chopVentaFinal - chopCostoTotalLote;

  // 3. Cálculos Llaveros por Plancha
  const factorTorrePlancha = llaveroColores === "1" ? 1.0 : llaveroColores === "2" ? 1.15 : llaveroColores === "3" ? 1.25 : 1.35;
  const pesoTotalPlanchaConTorre = Number(pesoTotalPlancha) * factorTorrePlancha;
  const cantidadPlanchasNecesarias = Math.ceil(Number(cantidadLlaverosPedida) / Number(llaverosPorPlancha || 1));
  const pesoTotalPedidoLlaveros = pesoTotalPlanchaConTorre * cantidadPlanchasNecesarias;
  const tiempoTotalPedidoLlaverosHs = (Number(planchaHoras) + Number(planchaMinutos) / 60) * cantidadPlanchasNecesarias;
  
  const costoTotalProduccionLlaveros = (pesoTotalPedidoLlaveros * (Number(precioKg) / 1000)) + 
    (tiempoTotalPedidoLlaverosHs * (Number(watts) / 1000) * Number(costoKwh)) + 
    (tiempoTotalPedidoLlaverosHs * Number(desgasteHora));

  const costoUnitarioLlavero = Number(cantidadLlaverosPedida) > 0 ? costoTotalProduccionLlaveros / Number(cantidadLlaverosPedida) : 0;
  const llaveroVentaFinal = costoTotalProduccionLlaveros * Number(llaveroMargen);
  const llaveroGananciaFinal = llaveroVentaFinal - costoTotalProduccionLlaveros;

  // 4. Cálculos Llavero Unitario Rápido
  const factorTorreUnitario = unitarioColores === "1" ? 1.0 : unitarioColores === "2" ? 1.15 : unitarioColores === "3" ? 1.25 : 1.35;
  const pesoUnitarioConTorre = Number(unitarioPeso) * factorTorreUnitario;
  const calcUnitarioLlavero = calcularCostosBase(pesoUnitarioConTorre, unitarioHoras, unitarioMinutos, precioKg, watts, costoKwh, desgasteHora);
  const precioVentaUnitarioSuelto = calcUnitarioLlavero.total * Number(unitarioMargen);
  const gananciaUnitarioSuelto = precioVentaUnitarioSuelto - calcUnitarioLlavero.total;

  // Guardado en la nube con Supabase
  const guardarRegistro = async (tipoHistorial, itemData) => {
    if (!itemData.nombreModelo.trim()) return;

    const nuevoRegistro = {
      tipo_historial: tipoHistorial,
      nombre_modelo: itemData.nombreModelo,
      cliente: itemData.cliente,
      material: itemData.material,
      peso: itemData.peso,
      tiempo_total: itemData.tiempoTotal,
      costo_total: Number(itemData.costoTotal),
      ganancia_neta: Number(itemData.gananciaNeta),
      venta_sugerida: Number(itemData.ventaSugerida),
      tipo: itemData.tipo
    };

    const { error } = await supabase.from("registros").insert([nuevoRegistro]);

    if (error) {
      alert("Error al guardar en Supabase: " + error.message);
    } else {
      alert("¡Guardado en la nube exitosamente!");
      cargarDatosSupabase();
    }
  };

  const filtrarHistorial = (lista) => {
    return lista.filter((item) =>
      item.nombre_modelo.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.material.toLowerCase().includes(busqueda.toLowerCase())
    );
  };

  return (
    <main className="min-h-screen bg-[#080a10] text-zinc-100 p-4 md:p-8 font-sans selection:bg-amber-400 selection:text-black">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-800/80 pb-5 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <span className="bg-gradient-to-r from-amber-400 to-amber-200 text-transparent bg-clip-text">
                Rufus Design
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-600/10 text-blue-400 border border-blue-600/20">
                Cotizador 3D Cloud ☁️
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">Plataforma integral de costos y presupuestos en la nube</p>
          </div>
        </header>

        {/* CONFIGURACIÓN GLOBAL DE MÁQUINA Y ENERGÍA */}
        <section className="bg-[#12161f] p-4 md:p-5 rounded-2xl border border-blue-600/30 shadow-xl space-y-3">
          <h2 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
            ⚡ Configuración Global de Máquina y Energía
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Precio Filamento ($/kg)</label>
              <input
                type="number"
                value={precioKg}
                onChange={(e) => setPrecioKg(e.target.value)}
                className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Consumo (Watts)</label>
              <input
                type="number"
                value={watts}
                onChange={(e) => setWatts(e.target.value)}
                className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Costo kWh ($)</label>
              <input
                type="number"
                value={costoKwh}
                onChange={(e) => setCostoKwh(e.target.value)}
                className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Desgaste Máquina ($/h)</label>
              <input
                type="number"
                value={desgasteHora}
                onChange={(e) => setDesgasteHora(e.target.value)}
                className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Pestañas de navegación */}
        <nav className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
          <button
            onClick={() => setPestañaActiva("general")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              pestañaActiva === "general"
                ? "bg-amber-400 text-black shadow-lg shadow-amber-400/10"
                : "bg-[#12161f] text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            🖨️ Cotizador General
          </button>
          <button
            onClick={() => setPestañaActiva("chops")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              pestañaActiva === "chops"
                ? "bg-amber-400 text-black shadow-lg shadow-amber-400/10"
                : "bg-[#12161f] text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            🍺 Especial Chops
          </button>
          <button
            onClick={() => setPestañaActiva("llaveros")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              pestañaActiva === "llaveros"
                ? "bg-amber-400 text-black shadow-lg shadow-amber-400/10"
                : "bg-[#12161f] text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            🔑 Llaveros AMS (Plancha)
          </button>
          <button
            onClick={() => setPestañaActiva("unitario")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              pestañaActiva === "unitario"
                ? "bg-amber-400 text-black shadow-lg shadow-amber-400/10"
                : "bg-[#12161f] text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            🔑 Llavero Unitario Rápido
          </button>
          <button
            onClick={() => setPestañaActiva("cotizaciones")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ml-auto ${
              pestañaActiva === "cotizaciones"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "bg-[#12161f] text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            📦 Cotizaciones ({historialCotizaciones.length})
          </button>
          <button
            onClick={() => setPestañaActiva("presupuestos")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              pestañaActiva === "presupuestos"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "bg-[#12161f] text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            📄 Presupuestos Clientes ({historialPresupuestos.length})
          </button>
        </nav>

        {/* CONTENIDO SOLAPA 1: COTIZADOR GENERAL */}
        {pestañaActiva === "general" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#12161f] p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
                <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">📌 Información de la Pieza</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Nombre Modelo</label>
                    <input
                      type="text"
                      value={generalNombre}
                      onChange={(e) => setGeneralNombre(e.target.value)}
                      placeholder="Ej: Soporte Casco"
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Cliente / Ref</label>
                    <input
                      type="text"
                      value={generalCliente}
                      onChange={(e) => setGeneralCliente(e.target.value)}
                      placeholder="Ej: Stock Catálogo / Nombre"
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#12161f] p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
                <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">🧵 Parámetros de Impresión</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Material</label>
                    <select
                      value={generalMaterial}
                      onChange={(e) => setGeneralMaterial(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="PLA">PLA</option>
                      <option value="PETG">PETG</option>
                      <option value="ABS">ABS</option>
                      <option value="TPU">TPU</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Peso (gramos)</label>
                    <input
                      type="number"
                      value={generalPeso}
                      onChange={(e) => setGeneralPeso(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Horas</label>
                      <input
                        type="number"
                        value={generalHoras}
                        onChange={(e) => setGeneralHoras(e.target.value)}
                        className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Minutos</label>
                      <input
                        type="number"
                        value={generalMinutos}
                        onChange={(e) => setGeneralMinutos(e.target.value)}
                        className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Margen</label>
                      <select
                        value={generalMargen}
                        onChange={(e) => setGeneralMargen(e.target.value)}
                        className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="2">x2.0 - Normal / Estándar</option>
                        <option value="3">x3.0 - Recomendado Minorista</option>
                        <option value="4">x4.0 - Premium / Detalle</option>
                        <option value="5">x5.0 - Alta Rentabilidad</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Unidades</label>
                      <input
                        type="number"
                        value={generalPiezas}
                        onChange={(e) => setGeneralPiezas(e.target.value)}
                        className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen General */}
            <div className="bg-[#12161f] p-6 rounded-2xl border-2 border-amber-400 shadow-2xl space-y-6">
              <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-3">Resumen General</h2>
              <div className="space-y-3 text-sm text-zinc-400">
                <div className="flex justify-between">
                  <span>Costo Filamento:</span>
                  <span className="text-white">${(calcGeneral.costoMat * Number(generalPiezas)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Electricidad:</span>
                  <span className="text-white">${(calcGeneral.luz * Number(generalPiezas)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amortización Máquina:</span>
                  <span className="text-white">${(calcGeneral.amort * Number(generalPiezas)).toFixed(2)}</span>
                </div>
                <div className="border-t border-zinc-800 pt-3 flex justify-between font-semibold">
                  <span>Costo Total Lote:</span>
                  <span className="text-white">${costoTotalLoteGeneral.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-extrabold text-xs bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/40">
                  <span>💡 Ganancia Neta Estimada:</span>
                  <span>+${gananciaGeneralTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-gradient-to-b from-amber-500 to-amber-300 p-4 rounded-xl text-center">
                <span className="text-xs text-black uppercase font-extrabold">Precio Venta Sugerido</span>
                <div className="text-3xl font-black text-black">${ventaGeneralTotal.toFixed(2)}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => guardarRegistro("cotizaciones", {
                    nombreModelo: generalNombre || "Sin nombre",
                    cliente: generalCliente || "Catálogo",
                    material: generalMaterial,
                    peso: `${generalPeso}g`,
                    tiempoTotal: `${generalHoras}h ${generalMinutos}m`,
                    costoTotal: costoTotalLoteGeneral.toFixed(2),
                    gananciaNeta: gananciaGeneralTotal.toFixed(2),
                    ventaSugerida: ventaGeneralTotal.toFixed(2),
                    tipo: "Cotización Generada"
                  })}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 px-2 rounded-xl transition-all cursor-pointer"
                >
                  📦 Guardar Cotización
                </button>
                <button
                  onClick={() => guardarRegistro("presupuestos", {
                    nombreModelo: generalNombre || "Sin nombre",
                    cliente: generalCliente || "Cliente General",
                    material: generalMaterial,
                    peso: `${generalPeso}g`,
                    tiempoTotal: `${generalHoras}h ${generalMinutos}m`,
                    costoTotal: costoTotalLoteGeneral.toFixed(2),
                    gananciaNeta: gananciaGeneralTotal.toFixed(2),
                    ventaSugerida: ventaGeneralTotal.toFixed(2),
                    tipo: "Presupuesto Cliente"
                  })}
                  className="bg-gradient-to-r from-blue-600 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 text-white text-xs font-bold py-3 px-2 rounded-xl transition-all cursor-pointer"
                >
                  📄 Guardar Presupuesto
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO SOLAPA 2: ESPECIAL CHOPS */}
        {pestañaActiva === "chops" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#12161f] p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
                <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">🍺 Configuración del Chop (Estructura, Aluminio y Logos)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Modelo Chop</label>
                    <input
                      type="text"
                      value={chopNombre}
                      onChange={(e) => setChopNombre(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Cliente / Ref</label>
                    <input
                      type="text"
                      value={chopCliente}
                      onChange={(e) => setChopCliente(e.target.value)}
                      placeholder="Ej: Pedido Chops"
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Tipo de Venta</label>
                    <select
                      value={chopTipoVenta}
                      onChange={(e) => setChopTipoVenta(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="minorista">Minorista (1 a 5 unidades)</option>
                      <option value="mayorista">Mayorista (6+ unidades)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Cantidad de Chops</label>
                    <input
                      type="number"
                      value={chopCantidad}
                      onChange={(e) => setChopCantidad(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Peso Impresión 3D por Chop (g)</label>
                    <input
                      type="number"
                      value={chopPeso}
                      onChange={(e) => setChopPeso(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Costo Vaso de Aluminio Unitario ($)</label>
                    <input
                      type="number"
                      value={chopCostoAluminio}
                      onChange={(e) => setChopCostoAluminio(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Costo Logos / Insignias Unitario ($)</label>
                    <input
                      type="number"
                      value={chopCostoLogos}
                      onChange={(e) => setChopCostoLogos(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Multiplicador (Margen Chop)</label>
                    <select
                      value={chopMargen}
                      onChange={(e) => setChopMargen(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="2">x2.0 - Margen Competitivo</option>
                      <option value="2.2">x2.2 - Estándar Recom.</option>
                      <option value="2.5">x2.5 - Venta Directa</option>
                      <option value="3">x3.0 - Minorista Exclusivo</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:col-span-2">
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Horas / Chop</label>
                      <input
                        type="number"
                        value={chopHoras}
                        onChange={(e) => setChopHoras(e.target.value)}
                        className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Mins / Chop</label>
                      <input
                        type="number"
                        value={chopMinutos}
                        onChange={(e) => setChopMinutos(e.target.value)}
                        className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  {chopTipoVenta === "mayorista" && (
                    <div className="md:col-span-2">
                      <label className="text-xs text-zinc-400 block mb-1">% Descuento Mayorista</label>
                      <input
                        type="number"
                        value={chopDescuentoMayorista}
                        onChange={(e) => setChopDescuentoMayorista(e.target.value)}
                        className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Resumen Chops */}
            <div className="bg-[#12161f] p-6 rounded-2xl border-2 border-amber-400 shadow-2xl space-y-6">
              <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-3">Cotización Chops</h2>
              <div className="space-y-3 text-sm text-zinc-400">
                <div className="flex justify-between">
                  <span>Costo Impresión 3D (Lote):</span>
                  <span className="text-white">${(calcChopUnitario.total * Number(chopCantidad)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo Aluminio + Logos (Lote):</span>
                  <span className="text-white">${(costoInsumosExtraChop * Number(chopCantidad)).toFixed(2)}</span>
                </div>
                <div className="border-t border-zinc-800 pt-3 flex justify-between font-semibold">
                  <span>Costo Total Lote:</span>
                  <span className="text-white">${chopCostoTotalLote.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-extrabold text-xs bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/40">
                  <span>💡 Ganancia Neta Estimada:</span>
                  <span>+${chopGananciaFinal.toFixed(2)}</span>
                </div>
                {chopTipoVenta === "mayorista" && (
                  <div className="flex justify-between text-amber-400 font-medium">
                    <span>Descuento aplicado:</span>
                    <span>-{chopDescuentoMayorista}%</span>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-b from-amber-500 to-amber-300 p-4 rounded-xl text-center">
                <span className="text-xs text-black uppercase font-extrabold">
                  Precio Total {chopTipoVenta === "mayorista" ? "Mayorista" : "Minorista"}
                </span>
                <div className="text-3xl font-black text-black">${chopVentaFinal.toFixed(2)}</div>
                <div className="text-xs text-amber-950 font-bold mt-1">
                  (${(chopVentaFinal / Number(chopCantidad || 1)).toFixed(2)} c/u)
                </div>
              </div>

              <button
                onClick={() => guardarRegistro("presupuestos", {
                  nombreModelo: `${chopNombre} (${chopCantidad}u - ${chopTipoVenta})`,
                  cliente: chopCliente || "Pedido Chops",
                  material: "PLA + Aluminio + Logos",
                  peso: `${chopPeso * chopCantidad}g impresos`,
                  tiempoTotal: `${(Number(chopHoras) * Number(chopCantidad))}h total`,
                  costoTotal: chopCostoTotalLote.toFixed(2),
                  gananciaNeta: chopGananciaFinal.toFixed(2),
                  ventaSugerida: chopVentaFinal.toFixed(2),
                  tipo: `Chop ${chopTipoVenta}`
                })}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-extrabold py-3 rounded-xl cursor-pointer"
              >
                📄 Guardar en Presupuestos
              </button>
            </div>
          </div>
        )}

        {/* CONTENIDO SOLAPA 3: LLAVEROS MULTICOLOR AMS (POR PLANCHA / LOTE) */}
        {pestañaActiva === "llaveros" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#12161f] p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
                <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">🔑 Llaveros Multicolor (Cálculo por Plancha Completa)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Nombre Llavero</label>
                    <input
                      type="text"
                      value={llaveroNombre}
                      onChange={(e) => setLlaveroNombre(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Cliente / Ref</label>
                    <input
                      type="text"
                      value={llaveroCliente}
                      onChange={(e) => setLlaveroCliente(e.target.value)}
                      placeholder="Ej: Pedido Llaveros"
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Cantidad de Colores</label>
                    <select
                      value={llaveroColores}
                      onChange={(e) => setLlaveroColores(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="1">1 Color (Sin torre AMS)</option>
                      <option value="2">2 Colores (+15% torre AMS)</option>
                      <option value="3">3 Colores (+25% torre AMS)</option>
                      <option value="4">4 Colores (+35% torre AMS)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">¿Cuántos entran en 1 Plancha?</label>
                    <input
                      type="number"
                      value={llaverosPorPlancha}
                      onChange={(e) => setLlaverosPorPlancha(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Peso Base 1 Plancha (g, sin torre)</label>
                    <input
                      type="number"
                      value={pesoTotalPlancha}
                      onChange={(e) => setPesoTotalPlancha(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Cantidad Total que te encargaron</label>
                    <input
                      type="number"
                      value={cantidadLlaverosPedida}
                      onChange={(e) => setCantidadLlaverosPedida(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Horas / Plancha</label>
                      <input
                        type="number"
                        value={planchaHoras}
                        onChange={(e) => setPlanchaHoras(e.target.value)}
                        className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Mins / Plancha</label>
                      <input
                        type="number"
                        value={planchaMinutos}
                        onChange={(e) => setPlanchaMinutos(e.target.value)}
                        className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Multiplicador (Margen Lote)</label>
                    <select
                      value={llaveroMargen}
                      onChange={(e) => setLlaveroMargen(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="2">x2.0 - Mayorista (80 a 100+ u.)</option>
                      <option value="2.2">x2.2 - Estándar Lote (30 a 50 u.)</option>
                      <option value="2.5">x2.5 - Mediano (10 a 20 u.)</option>
                      <option value="3">x3.0 - Minorista / Pocos</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen Llaveros por Plancha */}
            <div className="bg-[#12161f] p-6 rounded-2xl border-2 border-amber-400 shadow-2xl space-y-6">
              <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-3">Cotización Llaveros (Lote)</h2>
              <div className="space-y-3 text-sm text-zinc-400">
                <div className="flex justify-between">
                  <span>Peso Plancha (con torre):</span>
                  <span className="text-white font-mono">{pesoTotalPlanchaConTorre.toFixed(1)}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Planchas necesarias:</span>
                  <span className="text-white font-mono">{cantidadPlanchasNecesarias} plancha(s)</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo Real Unitario:</span>
                  <span className="text-white font-mono">${costoUnitarioLlavero.toFixed(2)} c/u</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo Total Producción:</span>
                  <span className="text-white">${costoTotalProduccionLlaveros.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-extrabold text-xs bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/40">
                  <span>💡 Ganancia Neta Estimada:</span>
                  <span>+${llaveroGananciaFinal.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-gradient-to-b from-amber-500 to-amber-300 p-4 rounded-xl text-center">
                <span className="text-xs text-black uppercase font-extrabold">Precio Total Lote Llaveros</span>
                <div className="text-3xl font-black text-black">${llaveroVentaFinal.toFixed(2)}</div>
                <div className="text-xs text-amber-950 font-bold mt-1">
                  (${(llaveroVentaFinal / Number(cantidadLlaverosPedida || 1)).toFixed(2)} c/u)
                </div>
              </div>

              <button
                onClick={() => guardarRegistro("presupuestos", {
                  nombreModelo: `${llaveroNombre} (${cantidadLlaverosPedida}u - ${llaveroColores} cols)`,
                  cliente: llaveroCliente || "Pedido Llaveros",
                  material: `PLA (${llaveroColores} cols)`,
                  peso: `${pesoTotalPedidoLlaveros.toFixed(0)}g (${cantidadPlanchasNecesarias} planchas)`,
                  tiempoTotal: `${(tiempoTotalPedidoLlaverosHs).toFixed(1)}h total`,
                  costoTotal: costoTotalProduccionLlaveros.toFixed(2),
                  gananciaNeta: llaveroGananciaFinal.toFixed(2),
                  ventaSugerida: llaveroVentaFinal.toFixed(2),
                  tipo: "Llaveros Plancha"
                })}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-extrabold py-3 rounded-xl cursor-pointer"
              >
                📄 Guardar en Presupuestos
              </button>
            </div>
          </div>
        )}

        {/* CONTENIDO SOLAPA 4: LLAVERO UNITARIO RÁPIDO */}
        {pestañaActiva === "unitario" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#12161f] p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
                <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">🔑 Calculadora Rápida: Precio Unitario de 1 Llavero</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Nombre Llavero</label>
                    <input
                      type="text"
                      value={unitarioNombre}
                      onChange={(e) => setUnitarioNombre(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Cantidad de Colores</label>
                    <select
                      value={unitarioColores}
                      onChange={(e) => setUnitarioColores(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="1">1 Color (Sin torre AMS)</option>
                      <option value="2">2 Colores (+15% torre)</option>
                      <option value="3">3 Colores (+25% torre)</option>
                      <option value="4">4 Colores (+35% torre)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Peso Estimado (g)</label>
                    <input
                      type="number"
                      value={unitarioPeso}
                      onChange={(e) => setUnitarioPeso(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Horas</label>
                      <input
                        type="number"
                        value={unitarioHoras}
                        onChange={(e) => setUnitarioHoras(e.target.value)}
                        className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Minutos</label>
                      <input
                        type="number"
                        value={unitarioMinutos}
                        onChange={(e) => setUnitarioMinutos(e.target.value)}
                        className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-zinc-400 block mb-1">Multiplicador (Margen Unitario)</label>
                    <select
                      value={unitarioMargen}
                      onChange={(e) => setUnitarioMargen(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="2.5">x2.5 - Venta por Mayor (Pack inicial de 5-10 u.)</option>
                      <option value="3.0">x3.0 - Minorista / Venta por Unid. Suelta</option>
                      <option value="4.0">x4.0 - Estándar Alta Rentabilidad</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen Unitario */}
            <div className="bg-[#12161f] p-6 rounded-2xl border-2 border-amber-400 shadow-2xl space-y-6">
              <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-3">Precio Llavero Unitario</h2>
              <div className="space-y-3 text-sm text-zinc-400">
                <div className="flex justify-between">
                  <span>Peso con descarte:</span>
                  <span className="text-white font-mono">{pesoUnitarioConTorre.toFixed(1)}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo Producción Base:</span>
                  <span className="text-white">${calcUnitarioLlavero.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-extrabold text-xs bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/40">
                  <span>💡 Ganancia Neta Estimada:</span>
                  <span>+${gananciaUnitarioSuelto.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-gradient-to-b from-amber-500 to-amber-300 p-4 rounded-xl text-center">
                <span className="text-xs text-black uppercase font-extrabold">Precio de Venta Unitario</span>
                <div className="text-3xl font-black text-black">${precioVentaUnitarioSuelto.toFixed(2)}</div>
                <div className="text-xs text-amber-950 font-bold mt-1">
                  Margen: x{unitarioMargen}
                </div>
              </div>

              <button
                onClick={() => guardarRegistro("cotizaciones", {
                  nombreModelo: `${unitarioNombre} (1 unidad - ${unitarioColores} col)`,
                  cliente: "Catálogo / Suelto",
                  material: `PLA (${unitarioColores} col)`,
                  peso: `${pesoUnitarioConTorre.toFixed(0)}g`,
                  tiempoTotal: `${unitarioHoras}h ${unitarioMinutos}m`,
                  costoTotal: calcUnitarioLlavero.total.toFixed(2),
                  gananciaNeta: gananciaUnitarioSuelto.toFixed(2),
                  ventaSugerida: precioVentaUnitarioSuelto.toFixed(2),
                  tipo: "Llavero Unitario"
                })}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 rounded-xl cursor-pointer"
              >
                📦 Guardar en Cotizaciones
              </button>
            </div>
          </div>
        )}

        {/* HISTORIALES NUBE CON SUPABASE */}
        {(pestañaActiva === "cotizaciones" || pestañaActiva === "presupuestos") && (
          <section className="bg-[#12161f] p-6 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  📋 {pestañaActiva === "cotizaciones" ? "Historial de Cotizaciones (Catálogo)" : "Historial de Presupuestos (Clientes)"}
                </h2>
                {cargando && <span className="text-xs text-blue-400 animate-pulse">Sincronizando con Supabase...</span>}
              </div>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="🔍 Buscar..."
                className="w-full md:w-72 bg-[#1c212e] border border-blue-600/20 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {filtrarHistorial(pestañaActiva === "cotizaciones" ? historialCotizaciones : historialPresupuestos).length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-6 text-center">No hay registros guardados en la nube.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#1c212e] text-zinc-400 uppercase text-[11px] font-semibold tracking-wider">
                    <tr>
                      <th className="p-3 rounded-l-xl">Fecha</th>
                      <th className="p-3">Modelo</th>
                      <th className="p-3">Cliente / Tipo</th>
                      <th className="p-3">Material</th>
                      <th className="p-3">Peso</th>
                      <th className="p-3">Tiempo</th>
                      <th className="p-3">Costo Total</th>
                      <th className="p-3 text-emerald-400">Ganancia Neta</th>
                      <th className="p-3 text-right">Precio Venta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filtrarHistorial(pestañaActiva === "cotizaciones" ? historialCotizaciones : historialPresupuestos).map((item) => (
                      <tr key={item.id} className="hover:bg-[#1c212e]/50 transition-colors">
                        <td className="p-3 text-zinc-400 text-xs">{new Date(item.created_at).toLocaleString()}</td>
                        <td className="p-3 font-semibold text-white">{item.nombre_modelo}</td>
                        <td className="p-3 text-zinc-300">{item.cliente}</td>
                        <td className="p-3 text-zinc-300">
                          <span className="bg-blue-600/10 text-blue-400 border border-blue-600/20 text-xs px-2 py-0.5 rounded-md font-mono">{item.material}</span>
                        </td>
                        <td className="p-3 text-zinc-300 text-xs">{item.peso}</td>
                        <td className="p-3 text-zinc-300 text-xs font-mono">{item.tiempo_total}</td>
                        <td className="p-3 text-zinc-400 font-mono text-xs">${item.costo_total}</td>
                        <td className="p-3 font-extrabold text-emerald-400 font-mono text-xs">+${item.ganancia_neta}</td>
                        <td className="p-3 font-extrabold text-amber-400 text-right font-mono">${item.venta_sugerida}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

      </div>
    </main>
  );
}