// @ts-nocheck
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Cotizador3D() {
  const [pestañaActiva, setPestañaActiva] = useState("general");

  // Parámetros Globales de Máquina y Energía
  const [precioKg, setPrecioKg] = useState(25500);
  const [watts, setWatts] = useState(120);
  const [costoKwh, setCostoKwh] = useState(50);
  const [desgasteHora, setDesgasteHora] = useState(390);

  // Estado para saber si estamos editando un registro existente
  const [editandoId, setEditandoId] = useState(null);

  // Estados Formulario General
  const [generalNombre, setGeneralNombre] = useState("");
  const [generalCliente, setGeneralCliente] = useState("");
  const [generalMaterial, setGeneralMaterial] = useState("PLA");
  const [generalPeso, setGeneralPeso] = useState(50);
  const [generalHoras, setGeneralHoras] = useState(2);
  const [generalMinutos, setGeneralMinutos] = useState(30);
  const [generalMargen, setGeneralMargen] = useState(3.5);
  const [generalPiezas, setGeneralPiezas] = useState(1);

  // Estados Formulario Chops (¡Con Minorista / Mayorista restaurado!)
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

  // Estados Formulario Llaveros (Por Plancha / Lote)
  const [llaveroNombre, setLlaveroNombre] = useState("Llaveros Personalizados");
  const [llaveroCliente, setLlaveroCliente] = useState("");
  const [llaveroColores, setLlaveroColores] = useState("4");
  const [llaverosPorPlancha, setLlaverosPorPlancha] = useState(5);
  const [pesoTotalPlancha, setPesoTotalPlancha] = useState(20);
  const [planchaHoras, setPlanchaHoras] = useState(1);
  const [planchaMinutos, setPlanchaMinutos] = useState(40);
  const [cantidadLlaverosPedida, setCantidadLlaverosPedida] = useState(20);
  const [costoArgolla, setCostoArgolla] = useState(40);
  const [costoPackaging, setCostoPackaging] = useState(50);

  // Historiales sincronizados con Supabase
  const [historialCotizaciones, setHistorialCotizaciones] = useState([]);
  const [historialPresupuestos, setHistorialPresupuestos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);

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

  // 2. Cálculos Chops (Con opción Minorista/Mayorista y Descuento)
  const calcChopBase = calcularCostosBase(chopPeso, chopHoras, chopMinutos, precioKg, watts, costoKwh, desgasteHora);
  const costoInsumosExtraChop = Number(chopCostoAluminio) + Number(chopCostoLogos);
  const costoTotalPorChop = calcChopBase.total + costoInsumosExtraChop;
  const chopCostoTotalLote = costoTotalPorChop * Number(chopCantidad);
  const chopVentaSinDescuento = chopCostoTotalLote * Number(chopMargen);
  const chopVentaFinal = chopTipoVenta === "mayorista" 
    ? chopVentaSinDescuento * (1 - Number(chopDescuentoMayorista) / 100)
    : chopVentaSinDescuento;
  const chopGananciaFinal = chopVentaFinal - chopCostoTotalLote;

  // 3. Cálculos Llaveros (Con Torre AMS, Argolla, Packaging y Escala Dinámica por Volumen)
  const factorTorrePlancha = llaveroColores === "1" ? 1.0 : llaveroColores === "2" ? 1.3 : llaveroColores === "3" ? 1.6 : 2.0;
  const pesoTotalPlanchaConTorre = Number(pesoTotalPlancha) * factorTorrePlancha;
  const cantidadPlanchasNecesarias = Math.ceil(Number(cantidadLlaverosPedida) / Number(llaverosPorPlancha || 1));
  const pesoTotalPedidoLlaveros = pesoTotalPlanchaConTorre * cantidadPlanchasNecesarias;
  const tiempoTotalPedidoLlaverosHs = (Number(planchaHoras) + Number(planchaMinutos) / 60) * cantidadPlanchasNecesarias;
  
  const costoImpresionLlaveros = (pesoTotalPedidoLlaveros * (Number(precioKg) / 1000)) + 
    (tiempoTotalPedidoLlaverosHs * (Number(watts) / 1000) * Number(costoKwh)) + 
    (tiempoTotalPedidoLlaverosHs * Number(desgasteHora));

  const totalArgollasYPackaging = Number(cantidadLlaverosPedida) * (Number(costoArgolla) + Number(costoPackaging));
  const costoTotalProduccionLlaveros = costoImpresionLlaveros + totalArgollasYPackaging;
  
  const cantLlaveros = Number(cantidadLlaverosPedida) || 1;
  let margenLlaveros = 4.0;
  if (cantLlaveros >= 6 && cantLlaveros <= 15) margenLlaveros = 3.5;
  else if (cantLlaveros >= 16 && cantLlaveros <= 39) margenLlaveros = 3.0;
  else if (cantLlaveros >= 40 && cantLlaveros <= 99) margenLlaveros = 2.5;
  else if (cantLlaveros >= 100) margenLlaveros = 2.1;

  const llaveroVentaFinal = costoTotalProduccionLlaveros * margenLlaveros;
  const llaveroGananciaFinal = llaveroVentaFinal - costoTotalProduccionLlaveros;
  const costoUnitarioLlavero = cantLlaveros > 0 ? costoTotalProduccionLlaveros / cantLlaveros : 0;
  const precioUnitarioVentaLlavero = cantLlaveros > 0 ? llaveroVentaFinal / cantLlaveros : 0;

  // --- GUARDAR / ACTUALIZAR EN SUPABASE ---
  const guardarRegistro = async (tipoHistorial, itemData) => {
    if (!itemData.nombreModelo.trim()) return;

    const payload = {
      tipo_historial: tipoHistorial,
      nombre_modelo: itemData.nombreModelo,
      cliente: itemData.cliente,
      material: itemData.material,
      peso: itemData.peso,
      tiempo_total: itemData.tiempoTotal,
      precio_filamento: Number(precioKg), // Guardamos el precio del filamento usado
      costo_total: Number(itemData.costoTotal),
      ganancia_neta: Number(itemData.gananciaNeta),
      venta_sugerida: Number(itemData.ventaSugerida),
      tipo: itemData.tipo
    };

    if (editandoId) {
      const { error } = await supabase.from("registros").update(payload).eq("id", editandoId);
      if (error) {
        alert("Error al actualizar: " + error.message);
      } else {
        alert("¡Registro actualizado en la nube!");
        setEditandoId(null);
        cargarDatosSupabase();
      }
    } else {
      const { error } = await supabase.from("registros").insert([payload]);
      if (error) {
        alert("Error al guardar: " + error.message);
      } else {
        alert("¡Guardado en la nube exitosamente!");
        cargarDatosSupabase();
      }
    }
  };

  // --- BORRAR REGISTRO ---
  const borrarRegistro = async (id) => {
    if (confirm("¿Estás seguro de que querés borrar este registro del historial?")) {
      const { error } = await supabase.from("registros").delete().eq("id", id);
      if (error) {
        alert("Error al borrar: " + error.message);
      } else {
        cargarDatosSupabase();
      }
    }
  };

  // --- CARGAR DATOS PARA EDITAR ---
  const prepararEdicion = (item) => {
    setEditandoId(item.id);
    if (item.precio_filamento) setPrecioKg(item.precio_filamento);
    if (item.tipo_historial === "cotizaciones") {
      setPestañaActiva("general");
      setGeneralNombre(item.nombre_modelo);
      setGeneralCliente(item.cliente);
      setGeneralMaterial(item.material);
    } else {
      if (item.tipo && item.tipo.includes("Llavero")) {
        setPestañaActiva("llaveros");
        setLlaveroNombre(item.nombre_modelo);
        setLlaveroCliente(item.cliente);
      } else if (item.tipo && item.tipo.includes("Chop")) {
        setPestañaActiva("chops");
        setChopNombre(item.nombre_modelo);
        setChopCliente(item.cliente);
      } else {
        setPestañaActiva("general");
        setGeneralNombre(item.nombre_modelo);
        setGeneralCliente(item.cliente);
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    alert(`Cargando datos de "${item.nombre_modelo}" para editar.`);
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
            <p className="text-xs text-zinc-400 mt-1">Plataforma integral de costos y presupuestos</p>
          </div>
          {editandoId && (
            <div className="bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs text-amber-400 flex items-center gap-2">
              <span>⚠️ Estás editando un registro.</span>
              <button onClick={() => setEditandoId(null)} className="underline font-bold cursor-pointer">Cancelar</button>
            </div>
          )}
        </header>

        {/* CONFIGURACIÓN GLOBAL */}
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
                className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Consumo (Watts)</label>
              <input
                type="number"
                value={watts}
                onChange={(e) => setWatts(e.target.value)}
                className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Costo kWh ($)</label>
              <input
                type="number"
                value={costoKwh}
                onChange={(e) => setCostoKwh(e.target.value)}
                className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Desgaste Máquina ($/h)</label>
              <input
                type="number"
                value={desgasteHora}
                onChange={(e) => setDesgasteHora(e.target.value)}
                className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
          </div>
        </section>

        {/* NAVEGACIÓN */}
        <nav className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
          <button
            onClick={() => setPestañaActiva("general")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              pestañaActiva === "general" ? "bg-amber-400 text-black shadow-lg" : "bg-[#12161f] text-zinc-400 border border-zinc-800"
            }`}
          >
            🖨️ Cotizador General
          </button>
          <button
            onClick={() => setPestañaActiva("chops")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              pestañaActiva === "chops" ? "bg-amber-400 text-black shadow-lg" : "bg-[#12161f] text-zinc-400 border border-zinc-800"
            }`}
          >
            🍺 Especial Chops
          </button>
          <button
            onClick={() => setPestañaActiva("llaveros")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              pestañaActiva === "llaveros" ? "bg-amber-400 text-black shadow-lg" : "bg-[#12161f] text-zinc-400 border border-zinc-800"
            }`}
          >
            🔑 Llaveros AMS (Lote)
          </button>
          <button
            onClick={() => setPestañaActiva("cotizaciones")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ml-auto ${
              pestañaActiva === "cotizaciones" ? "bg-blue-600 text-white shadow-lg" : "bg-[#12161f] text-zinc-400 border border-zinc-800"
            }`}
          >
            📦 Catálogo ({historialCotizaciones.length})
          </button>
          <button
            onClick={() => setPestañaActiva("presupuestos")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              pestañaActiva === "presupuestos" ? "bg-blue-600 text-white shadow-lg" : "bg-[#12161f] text-zinc-400 border border-zinc-800"
            }`}
          >
            📄 Presupuestos ({historialPresupuestos.length})
          </button>
        </nav>

        {/* CONTENIDO SOLAPA GENERAL */}
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
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Cliente / Ref</label>
                    <input
                      type="text"
                      value={generalCliente}
                      onChange={(e) => setGeneralCliente(e.target.value)}
                      placeholder="Ej: Stock Catálogo"
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
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
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
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
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Horas</label>
                      <input
                        type="number"
                        value={generalHoras}
                        onChange={(e) => setGeneralHoras(e.target.value)}
                        className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Minutos</label>
                      <input
                        type="number"
                        value={generalMinutos}
                        onChange={(e) => setGeneralMinutos(e.target.value)}
                        className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Margen</label>
                      <select
                        value={generalMargen}
                        onChange={(e) => setGeneralMargen(e.target.value)}
                        className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                      >
                        <option value="2">x2.0 - Normal</option>
                        <option value="3.5">x3.5 - Estándar</option>
                        <option value="4">x4.0 - Premium</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Unidades</label>
                      <input
                        type="number"
                        value={generalPiezas}
                        onChange={(e) => setGeneralPiezas(e.target.value)}
                        className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#12161f] p-6 rounded-2xl border-2 border-amber-400 shadow-2xl space-y-6">
              <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-3">Resumen General</h2>
              <div className="space-y-3 text-sm text-zinc-400">
                <div className="flex justify-between">
                  <span>Costo Filamento:</span>
                  <span className="text-white">${(calcGeneral.costoMat * Number(generalPiezas)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Electricidad + Desgaste:</span>
                  <span className="text-white">${((calcGeneral.luz + calcGeneral.amort) * Number(generalPiezas)).toFixed(2)}</span>
                </div>
                <div className="border-t border-zinc-800 pt-3 flex justify-between font-semibold">
                  <span>Costo Total Lote:</span>
                  <span className="text-white">${costoTotalLoteGeneral.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-extrabold text-xs bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/40">
                  <span>💡 Ganancia Neta:</span>
                  <span>+${gananciaGeneralTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-gradient-to-b from-amber-500 to-amber-300 p-4 rounded-xl text-center">
                <span className="text-xs text-black uppercase font-extrabold">Precio Venta Sugerido</span>
                <div className="text-3xl font-black text-black">${ventaGeneralTotal.toFixed(2)}</div>
              </div>

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
                  tipo: "Cotización General"
                })}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-xl cursor-pointer"
              >
                {editandoId ? "💾 Actualizar Cotización" : "📦 Guardar en Catálogo"}
              </button>
            </div>
          </div>
        )}

        {/* CONTENIDO SOLAPA CHOPS - ¡CON MINORISTA / MAYORISTA RESTAURADO! */}
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
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Cliente / Ref</label>
                    <input
                      type="text"
                      value={chopCliente}
                      onChange={(e) => setChopCliente(e.target.value)}
                      placeholder="Ej: Pedido Chops"
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Tipo de Venta</label>
                    <select
                      value={chopTipoVenta}
                      onChange={(e) => setChopTipoVenta(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
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
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Peso Impresión 3D por Chop (g)</label>
                    <input
                      type="number"
                      value={chopPeso}
                      onChange={(e) => setChopPeso(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Costo Vaso de Aluminio Unitario ($)</label>
                    <input
                      type="number"
                      value={chopCostoAluminio}
                      onChange={(e) => setCostoAluminio(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Costo Logos / Insignias Unitario ($)</label>
                    <input
                      type="number"
                      value={chopCostoLogos}
                      onChange={(e) => setCostoLogos(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Multiplicador (Margen Chop)</label>
                    <select
                      value={chopMargen}
                      onChange={(e) => setChopMargen(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                    >
                      <option value="2">x2.0 - Competitivo</option>
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
                        className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Mins / Chop</label>
                      <input
                        type="number"
                        value={chopMinutos}
                        onChange={(e) => setChopMinutos(e.target.value)}
                        className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
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
                        className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white font-bold text-amber-400"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#12161f] p-6 rounded-2xl border-2 border-amber-400 shadow-2xl space-y-6">
              <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-3">Cotización Chops</h2>
              <div className="space-y-3 text-sm text-zinc-400">
                <div className="flex justify-between">
                  <span>Costo Total Lote:</span>
                  <span className="text-white">${chopCostoTotalLote.toFixed(2)}</span>
                </div>
                {chopTipoVenta === "mayorista" && (
                  <div className="flex justify-between text-amber-400 text-xs">
                    <span>Descuento Aplicado:</span>
                    <span>-{chopDescuentoMayorista}%</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-400 font-extrabold text-xs bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/40">
                  <span>💡 Ganancia Neta:</span>
                  <span>+${chopGananciaFinal.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-gradient-to-b from-amber-500 to-amber-300 p-4 rounded-xl text-center">
                <span className="text-xs text-black uppercase font-extrabold">Precio Total Chops</span>
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
                  peso: `${chopPeso * chopCantidad}g`,
                  tiempoTotal: `${Number(chopHoras) * Number(chopCantidad)}h`,
                  costoTotal: chopCostoTotalLote.toFixed(2),
                  gananciaNeta: chopGananciaFinal.toFixed(2),
                  ventaSugerida: chopVentaFinal.toFixed(2),
                  tipo: `Chop ${chopTipoVenta}`
                })}
                className="w-full bg-blue-600 text-white font-extrabold py-3 rounded-xl cursor-pointer"
              >
                {editandoId ? "💾 Actualizar Presupuesto" : "📄 Guardar en Presupuestos"}
              </button>
            </div>
          </div>
        )}

        {/* CONTENIDO SOLAPA LLAVEROS AMS (LOTE) */}
        {pestañaActiva === "llaveros" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#12161f] p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
                <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">🔑 Calculadora Llaveros Multicolor (Escalado por Volumen)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Nombre Llavero</label>
                    <input
                      type="text"
                      value={llaveroNombre}
                      onChange={(e) => setLlaveroNombre(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Cliente / Ref</label>
                    <input
                      type="text"
                      value={llaveroCliente}
                      onChange={(e) => setLlaveroCliente(e.target.value)}
                      placeholder="Ej: Pedido Llaveros"
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Cantidad de Colores</label>
                    <select
                      value={llaveroColores}
                      onChange={(e) => setLlaveroColores(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                    >
                      <option value="1">1 Color (Sin torre)</option>
                      <option value="2">2 Colores (+30% descarte AMS)</option>
                      <option value="3">3 Colores (+60% descarte AMS)</option>
                      <option value="4">4 Colores (+100% descarte AMS torre)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">¿Cuántos entran en 1 Plancha?</label>
                    <input
                      type="number"
                      value={llaverosPorPlancha}
                      onChange={(e) => setLlaverosPorPlancha(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Peso Base 1 Plancha (g, sin torre)</label>
                    <input
                      type="number"
                      value={pesoTotalPlancha}
                      onChange={(e) => setPesoTotalPlancha(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1 font-bold text-amber-400">Cantidad Total Solicitada</label>
                    <input
                      type="number"
                      value={cantidadLlaverosPedida}
                      onChange={(e) => setCantidadLlaverosPedida(e.target.value)}
                      className="w-full bg-[#1c212e] border-2 border-amber-400 rounded-xl p-3 text-sm text-white font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Horas / Plancha</label>
                      <input
                        type="number"
                        value={planchaHoras}
                        onChange={(e) => setPlanchaHoras(e.target.value)}
                        className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Mins / Plancha</label>
                      <input
                        type="number"
                        value={planchaMinutos}
                        onChange={(e) => setPlanchaMinutos(e.target.value)}
                        className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Costo Argolla Metálica C/U ($)</label>
                    <input
                      type="number"
                      value={costoArgolla}
                      onChange={(e) => setCostoArgolla(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Costo Packaging C/U (Bolsa+Cartón) ($)</label>
                    <input
                      type="number"
                      value={costoPackaging}
                      onChange={(e) => setCostoPackaging(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#12161f] p-6 rounded-2xl border-2 border-amber-400 shadow-2xl space-y-6">
              <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-3">Cotización Llaveros (Lote)</h2>
              <div className="space-y-3 text-sm text-zinc-400">
                <div className="flex justify-between">
                  <span>Planchas necesarias:</span>
                  <span className="text-white font-mono">{cantidadPlanchasNecesarias} plancha(s)</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo Real Unitario (Material+Argolla+Pack):</span>
                  <span className="text-white font-mono">${costoUnitarioLlavero.toFixed(2)} c/u</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo Total Producción:</span>
                  <span className="text-white">${costoTotalProduccionLlaveros.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-400 font-bold text-xs bg-amber-950/20 p-2 rounded-xl border border-amber-800/30">
                  <span>📊 Margen Aplicado (Escala):</span>
                  <span>x{margenLlaveros} ({cantLlaveros} unidades)</span>
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
                  (${precioUnitarioVentaLlavero.toFixed(2)} c/u)
                </div>
              </div>

              <button
                onClick={() => guardarRegistro("presupuestos", {
                  nombreModelo: `${llaveroNombre} (${cantLlaveros}u - ${llaveroColores} cols)`,
                  cliente: llaveroCliente || "Pedido Llaveros",
                  material: `PLA (${llaveroColores} cols + Argolla + Pack)`,
                  peso: `${pesoTotalPedidoLlaveros.toFixed(0)}g (${cantidadPlanchasNecesarias} planchas)`,
                  tiempoTotal: `${tiempoTotalPedidoLlaverosHs.toFixed(1)}h total`,
                  costoTotal: costoTotalProduccionLlaveros.toFixed(2),
                  gananciaNeta: llaveroGananciaFinal.toFixed(2),
                  ventaSugerida: llaveroVentaFinal.toFixed(2),
                  tipo: "Llaveros Plancha"
                })}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-extrabold py-3 rounded-xl cursor-pointer"
              >
                {editandoId ? "💾 Actualizar Presupuesto" : "📄 Guardar en Presupuestos"}
              </button>
            </div>
          </div>
        )}

        {/* HISTORIALES SUPABASE CON BOTONES DE BORRAR Y EDITAR */}
        {(pestañaActiva === "cotizaciones" || pestañaActiva === "presupuestos") && (
          <section className="bg-[#12161f] p-6 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                📋 {pestañaActiva === "cotizaciones" ? "Catálogo de Cotizaciones" : "Presupuestos Guardados"}
              </h2>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="🔍 Buscar..."
                className="w-full md:w-72 bg-[#1c212e] border border-blue-600/20 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#1c212e] text-zinc-400 uppercase text-[11px] font-semibold">
                  <tr>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Modelo</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Material & Costo Filamento</th>
                    <th className="p-3">Tiempo</th>
                    <th className="p-3 text-emerald-400">Ganancia Neta</th>
                    <th className="p-3 text-right">Precio Venta</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filtrarHistorial(pestañaActiva === "cotizaciones" ? historialCotizaciones : historialPresupuestos).map((item) => (
                    <tr key={item.id} className="hover:bg-[#1c212e]/50">
                      <td className="p-3 text-zinc-400 text-xs">{new Date(item.created_at).toLocaleString()}</td>
                      <td className="p-3 font-semibold text-white">{item.nombre_modelo}</td>
                      <td className="p-3 text-zinc-300">{item.cliente}</td>
                      <td className="p-3 text-zinc-300 font-mono text-xs">
                        {item.material}
                        {item.precio_filamento && (
                          <div className="text-[10px] text-amber-400 font-bold">
                            Filamento: ${item.precio_filamento}/kg
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-zinc-300 text-xs font-mono">{item.tiempo_total}</td>
                      <td className="p-3 font-extrabold text-emerald-400 font-mono text-xs">+${item.ganancia_neta}</td>
                      <td className="p-3 font-extrabold text-amber-400 text-right font-mono">${item.venta_sugerida}</td>
                      <td className="p-3 text-center space-x-2">
                        <button
                          onClick={() => prepararEdicion(item)}
                          className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => borrarRegistro(item.id)}
                          className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          🗑️ Borrar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}