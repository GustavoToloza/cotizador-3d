// @ts-nocheck
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Cotizador3D() {
  const [pestañaActiva, setPestañaActiva] = useState("general");

  // Parámetros Globales de Máquina, Energía y Margen de Error
  const [precioKg, setPrecioKg] = useState(25500);
  const [watts, setWatts] = useState(120);
  const [costoKwh, setCostoKwh] = useState(50);
  const [desgasteHora, setDesgasteHora] = useState(390);
  const [margenErrorPorcentaje, setMargenErrorPorcentaje] = useState(10);

  // Estado para saber si estamos editando un registro existente
  const [editandoId, setEditandoId] = useState(null);

  // Estados Formulario General (¡Con Insumos Extras incorporado!)
  const [generalNombre, setGeneralNombre] = useState("");
  const [generalCliente, setGeneralCliente] = useState("");
  const [generalMaterial, setGeneralMaterial] = useState("PLA");
  const [generalPeso, setGeneralPeso] = useState(50);
  const [generalHoras, setGeneralHoras] = useState(2);
  const [generalMinutos, setGeneralMinutos] = useState(30);
  const [generalMargen, setGeneralMargen] = useState("3.5");
  const [generalPiezas, setGeneralPiezas] = useState(1);
  const [generalInsumosExtras, setGeneralInsumosExtras] = useState(0);

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
  const [chopMargen, setChopMargen] = useState("3.0");

  // Estados Formulario Llaveros
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
  const [llaveroMargen, setLlaveroMargen] = useState("5.0");

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

  const calcularDesgloseBase = (pesoGramos, horas, mins, precioKilo, w, kwh, desgaste, porcError) => {
    const tiempoTotalHs = Number(horas) + Number(mins) / 60;
    const precioMatKg = Number(precioKilo);
    const costoMat = Number(pesoGramos) * (precioMatKg / 1000);
    const luz = (tiempoTotalHs * (Number(w) / 1000)) * Number(kwh);
    const amort = tiempoTotalHs * Number(desgaste);
    
    const subtotalOperativo = costoMat + luz + amort;
    const margenErrorVal = subtotalOperativo * (Number(porcError) / 100);
    const costoTotalSinInsumos = subtotalOperativo + margenErrorVal;

    return { costoMat, luz, amort, margenErrorVal, costoTotalSinInsumos, tiempoTotalHs };
  };

  // 1. Cálculos Cotizador General (Con insumos extras fijos sin ganancia)
  const cantGeneral = Math.max(1, Number(generalPiezas));
  const baseGen = calcularDesgloseBase(generalPeso, generalHoras, generalMinutos, precioKg, watts, costoKwh, desgasteHora, margenErrorPorcentaje);
  const costoMatGenTotal = baseGen.costoMat * cantGeneral;
  const luzGenTotal = baseGen.luz * cantGeneral;
  const amortGenTotal = baseGen.amort * cantGeneral;
  const errorGenTotal = baseGen.margenErrorVal * cantGeneral;
  const costoTotalSinInsumosGen = baseGen.costoTotalSinInsumos * cantGeneral;
  
  const insumosGenTotal = Number(generalInsumosExtras) * cantGeneral;
  const multiplicadorGeneralVal = Number(generalMargen);
  
  const ventaImpresionGeneral = costoTotalSinInsumosGen * multiplicadorGeneralVal;
  const ventaGeneralTotal = ventaImpresionGeneral + insumosGenTotal;
  const costoTotalLoteGeneral = costoTotalSinInsumosGen + insumosGenTotal;
  const gananciaGeneralTotal = ventaGeneralTotal - costoTotalLoteGeneral;
  const precioUnitarioGeneral = ventaGeneralTotal / cantGeneral;

  // 2. Cálculos Chops
  const cantChops = Math.max(1, Number(chopCantidad));
  const baseChop = calcularDesgloseBase(chopPeso, chopHoras, chopMinutos, precioKg, watts, costoKwh, desgasteHora, margenErrorPorcentaje);
  const costoMatChopTotal = baseChop.costoMat * cantChops;
  const luzChopTotal = baseChop.luz * cantChops;
  const amortChopTotal = baseChop.amort * cantChops;
  const errorChopTotal = baseChop.margenErrorVal * cantChops;
  const costoTotalSinInsumosChop = baseChop.costoTotalSinInsumos * cantChops;

  const insumosUnitariosChop = Number(chopCostoAluminio) + Number(chopCostoLogos);
  const insumosChopTotal = insumosUnitariosChop * cantChops;
  const chopCostoTotalLote = costoTotalSinInsumosChop + insumosChopTotal;
  
  const multiplicadorChopVal = Number(chopMargen);
  const chopVentaSinDescuento = chopCostoTotalLote * multiplicadorChopVal;
  const chopVentaFinal = chopTipoVenta === "mayorista" 
    ? chopVentaSinDescuento * (1 - Number(chopDescuentoMayorista) / 100)
    : chopVentaSinDescuento;
  const chopGananciaFinal = chopVentaFinal - chopCostoTotalLote;

  // 3. Cálculos Llaveros (Argollas con ganancia, Packaging fijo sin ganancia)
  const factorTorrePlancha = llaveroColores === "1" ? 1.0 : llaveroColores === "2" ? 1.3 : llaveroColores === "3" ? 1.6 : 2.0;
  const pesoTotalPlanchaConTorre = Number(pesoTotalPlancha) * factorTorrePlancha;
  const cantidadPlanchasNecesarias = Math.ceil(Number(cantidadLlaverosPedida) / Number(llaverosPorPlancha || 1));
  const pesoTotalPedidoLlaveros = pesoTotalPlanchaConTorre * cantidadPlanchasNecesarias;
  const tiempoTotalPedidoLlaverosHs = (Number(planchaHoras) + Number(planchaMinutos) / 60) * cantidadPlanchasNecesarias;
  
  const baseLlaveros = calcularDesgloseBase(pesoTotalPedidoLlaveros, (Number(planchaHoras) * cantidadPlanchasNecesarias), (Number(planchaMinutos) * cantidadPlanchasNecesarias), precioKg, watts, costoKwh, desgasteHora, margenErrorPorcentaje);
  
  const costoTotalSinInsumosLlaveros = baseLlaveros.costoTotalSinInsumos;
  const cantLlaveros = Number(cantidadLlaverosPedida) || 1;
  const totalArgollas = Number(costoArgolla) * cantLlaveros;
  const totalPackaging = Number(costoPackaging) * cantLlaveros;

  const baseConGananciaLlaveros = costoTotalSinInsumosLlaveros + totalArgollas;
  const multiplicadorLlaverosVal = Number(llaveroMargen);

  const ventaImpresionYArgollas = baseConGananciaLlaveros * multiplicadorLlaverosVal;
  const llaveroVentaFinal = ventaImpresionYArgollas + totalPackaging;
  
  const costoTotalProduccionLlaveros = costoTotalSinInsumosLlaveros + totalArgollas + totalPackaging;
  const llaveroGananciaFinal = llaveroVentaFinal - costoTotalProduccionLlaveros;
  
  const costoUnitarioLlavero = cantLlaveros > 0 ? costoTotalProduccionLlaveros / cantLlaveros : 0;
  const precioUnitarioVentaLlavero = cantLlaveros > 0 ? llaveroVentaFinal / cantLlaveros : 0;

  let descripcionMaterialLlavero = `PLA (${llaveroColores} cols)`;
  if (Number(costoArgolla) > 0) descripcionMaterialLlavero += " + Argolla";
  if (Number(costoPackaging) > 0) descripcionMaterialLlavero += " + Pack";

  // --- GUARDAR / ACTUALIZAR EN SUPABASE ---
  const guardarRegistro = async (tipoHistorial, itemData) => {
    if (!itemData.nombreModelo.trim()) {
      alert("Por favor, ingresa un nombre para el modelo.");
      return;
    }

    const payload = {
      tipo_historial: tipoHistorial,
      nombre_modelo: itemData.nombreModelo,
      cliente: itemData.cliente || "General",
      material: itemData.material || "PLA",
      peso: itemData.peso || "0g",
      tiempo_total: itemData.tiempoTotal || "0h",
      precio_filamento: Number(precioKg),
      costo_total: Number(itemData.costoTotal),
      ganancia_neta: Number(itemData.gananciaNeta),
      venta_sugerida: Number(itemData.ventaSugerida),
      tipo: itemData.tipo || "General",
      raw_data: JSON.stringify(itemData.rawConfig || {})
    };

    try {
      if (editandoId) {
        const { error } = await supabase.from("registros").update(payload).eq("id", editandoId);
        if (error) throw error;
        alert("¡Registro actualizado exitosamente!");
        setEditandoId(null);
      } else {
        const { error } = await supabase.from("registros").insert([payload]);
        if (error) throw error;
        alert("¡Guardado en la nube exitosamente!");
      }
      cargarDatosSupabase();
    } catch (err) {
      alert("Error al guardar en Supabase: " + err.message);
      console.error("Detalle del error:", err);
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

  // --- CARGAR DATOS EXACTOS PARA EDITAR ---
  const prepararEdicion = (item) => {
    setEditandoId(item.id);
    if (item.precio_filamento) setPrecioKg(item.precio_filamento);

    let config = {};
    try {
      if (item.raw_data) config = JSON.parse(item.raw_data);
    } catch (e) {}

    if (item.tipo_historial === "cotizaciones" || (item.tipo && item.tipo.includes("General"))) {
      setPestañaActiva("general");
      setGeneralNombre(item.nombre_modelo);
      setGeneralCliente(item.cliente);
      setGeneralMaterial(item.material || "PLA");
      if (config.generalPeso) setGeneralPeso(config.generalPeso);
      if (config.generalHoras) setGeneralHoras(config.generalHoras);
      if (config.generalMinutos) setGeneralMinutos(config.generalMinutos);
      if (config.generalPiezas) setGeneralPiezas(config.generalPiezas);
      if (config.generalMargen) setGeneralMargen(config.generalMargen);
      if (config.generalInsumosExtras !== undefined) setGeneralInsumosExtras(config.generalInsumosExtras);
    } else if (item.tipo && item.tipo.includes("Chop")) {
      setPestañaActiva("chops");
      setChopNombre(item.nombre_modelo.split("(")[0].trim());
      setChopCliente(item.cliente);
      if (config.chopPeso) setChopPeso(config.chopPeso);
      if (config.chopCantidad) setChopCantidad(config.chopCantidad);
      if (config.chopCostoAluminio) setChopCostoAluminio(config.chopCostoAluminio);
      if (config.chopCostoLogos) setChopCostoLogos(config.chopCostoLogos);
      if (config.chopMargen) setChopMargen(config.chopMargen);
    } else if (item.tipo && item.tipo.includes("Llavero")) {
      setPestañaActiva("llaveros");
      setLlaveroNombre(item.nombre_modelo.split("(")[0].trim());
      setLlaveroCliente(item.cliente);
      if (config.cantidadLlaverosPedida) setCantidadLlaverosPedida(config.cantidadLlaverosPedida);
      if (config.pesoTotalPlancha) setPesoTotalPlancha(config.pesoTotalPlancha);
      if (config.costoArgolla !== undefined) setCostoArgolla(config.costoArgolla);
      if (config.costoPackaging !== undefined) setCostoPackaging(config.costoPackaging);
      if (config.llaveroMargen) setLlaveroMargen(config.llaveroMargen);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
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
            ⚡ Configuración Global de Máquina, Energía y Seguridad
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
            <div>
              <label className="text-[11px] text-amber-400 font-bold block mb-1">Margen de Error (%)</label>
              <input
                type="number"
                value={margenErrorPorcentaje}
                onChange={(e) => setMargenErrorPorcentaje(e.target.value)}
                className="w-full bg-[#1c212e] border border-amber-500/50 rounded-xl p-2.5 text-xs text-white font-bold"
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

        {/* SOLAPA GENERAL */}
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
                      placeholder="Ej: Soporte de Casco"
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Cliente / Ref</label>
                    <input
                      type="text"
                      value={generalCliente}
                      onChange={(e) => setGeneralCliente(e.target.value)}
                      placeholder="Ej: Juan Pérez / Stock"
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#12161f] p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
                <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">🧵 Parámetros e Impresión por Unidad</h2>
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
                    <label className="text-xs text-zinc-400 block mb-1">Peso Unitario (g)</label>
                    <input
                      type="number"
                      value={generalPeso}
                      onChange={(e) => setGeneralPeso(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Horas / Unidad</label>
                      <input
                        type="number"
                        value={generalHoras}
                        onChange={(e) => setGeneralHoras(e.target.value)}
                        className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1">Mins / Unidad</label>
                      <input
                        type="number"
                        value={generalMinutos}
                        onChange={(e) => setGeneralMinutos(e.target.value)}
                        className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Insumos Extras C/U ($) <span className="text-[10px] text-zinc-500">(Imanes, rodamientos, etc.)</span></label>
                    <input
                      type="number"
                      value={generalInsumosExtras}
                      onChange={(e) => setGeneralInsumosExtras(e.target.value)}
                      placeholder="Ej: 500"
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:col-span-2">
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1 font-bold text-amber-400">Multiplicador Ganancia</label>
                      <select
                        value={generalMargen}
                        onChange={(e) => setGeneralMargen(e.target.value)}
                        className="w-full bg-[#1c212e] border border-amber-500/50 rounded-xl p-3 text-sm text-white font-bold"
                      >
                        <option value="2.0">×2.0 — Alto volumen / desc.</option>
                        <option value="2.5">×2.5 — Volumen medio</option>
                        <option value="3.0">×3.0 — Mayorista</option>
                        <option value="3.5">×3.5 — Intermedio</option>
                        <option value="4.0">×4.0 — Minorista</option>
                        <option value="5.0">×5.0 — Llaveros / chicas</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1 font-bold text-amber-400">Cantidad Solicitada</label>
                      <input
                        type="number"
                        value={generalPiezas}
                        onChange={(e) => setGeneralPiezas(e.target.value)}
                        className="w-full bg-[#1c212e] border-2 border-amber-400 rounded-xl p-3 text-sm text-white font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RESUMEN DESGLOSADO GENERAL */}
            <div className="bg-[#12161f] p-6 rounded-2xl border-2 border-amber-400 shadow-2xl space-y-4">
              <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-3">Desglose de Costos</h2>
              <div className="space-y-2.5 text-xs text-zinc-300 font-mono">
                <div className="flex justify-between">
                  <span>Precio material ({generalPeso * cantGeneral}g):</span>
                  <span className="text-white">${costoMatGenTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Precio luz:</span>
                  <span className="text-white">${luzGenTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Desgaste máquina:</span>
                  <span className="text-white">${amortGenTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>Margen de error ({margenErrorPorcentaje}%):</span>
                  <span>+${errorGenTotal.toFixed(2)}</span>
                </div>
                <div className="border-t border-zinc-800 pt-2 flex justify-between font-bold text-zinc-100">
                  <span>Costo total impresión:</span>
                  <span>${costoTotalSinInsumosGen.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Insumos extras (fijos sin ganancia):</span>
                  <span className="text-white">${insumosGenTotal.toFixed(2)}</span>
                </div>
                <div className="border-t border-zinc-800 pt-2 flex justify-between font-bold text-emerald-400">
                  <span>Ganancia ({`×${multiplicadorGeneralVal}`}):</span>
                  <span>+${gananciaGeneralTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-gradient-to-b from-amber-500 to-amber-300 p-4 rounded-xl text-center shadow-lg">
                <span className="text-[11px] text-black uppercase font-extrabold tracking-wider block">Precio Venta Total</span>
                <div className="text-3xl font-black text-black">${ventaGeneralTotal.toFixed(2)}</div>
                {cantGeneral > 1 && (
                  <div className="text-xs text-amber-950 font-bold mt-1">
                    (${precioUnitarioGeneral.toFixed(2)} c/u)
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => guardarRegistro("cotizaciones", {
                    nombreModelo: `${generalNombre || "Sin nombre"} (${cantGeneral}u)`,
                    cliente: generalCliente || "Catálogo",
                    material: `${generalMaterial} (×${multiplicadorGeneralVal})`,
                    peso: `${generalPeso * cantGeneral}g`,
                    tiempoTotal: `${generalHoras * cantGeneral}h ${generalMinutos * cantGeneral}m`,
                    costoTotal: costoTotalLoteGeneral.toFixed(2),
                    gananciaNeta: gananciaGeneralTotal.toFixed(2),
                    ventaSugerida: ventaGeneralTotal.toFixed(2),
                    tipo: `Cotización General (×${multiplicadorGeneralVal})`,
                    rawConfig: { generalPeso, generalHoras, generalMinutos, generalPiezas, generalMargen, generalInsumosExtras }
                  })}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  📦 Guardar en Catálogo
                </button>
                <button
                  onClick={() => guardarRegistro("presupuestos", {
                    nombreModelo: `${generalNombre || "Sin nombre"} (${cantGeneral}u)`,
                    cliente: generalCliente || "Cliente General",
                    material: `${generalMaterial} (×${multiplicadorGeneralVal})`,
                    peso: `${generalPeso * cantGeneral}g`,
                    tiempoTotal: `${generalHoras * cantGeneral}h ${generalMinutos * cantGeneral}m`,
                    costoTotal: costoTotalLoteGeneral.toFixed(2),
                    gananciaNeta: gananciaGeneralTotal.toFixed(2),
                    ventaSugerida: ventaGeneralTotal.toFixed(2),
                    tipo: `Presupuesto General (×${multiplicadorGeneralVal})`,
                    rawConfig: { generalPeso, generalHoras, generalMinutos, generalPiezas, generalMargen, generalInsumosExtras }
                  })}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  📄 Guardar en Presupuestos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SOLAPA CHOPS */}
        {pestañaActiva === "chops" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#12161f] p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
                <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">🍺 Configuración del Chop</h2>
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
                      placeholder="Ej: Stock / Nombre Cliente"
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
                      onChange={(e) => setChopCostoAluminio(e.target.value)}
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
                    <label className="text-xs text-zinc-400 block mb-1 font-bold text-amber-400">Multiplicador Ganancia</label>
                    <select
                      value={chopMargen}
                      onChange={(e) => setChopMargen(e.target.value)}
                      className="w-full bg-[#1c212e] border border-amber-500/50 rounded-xl p-3 text-sm text-white font-bold"
                    >
                      <option value="2.0">×2.0 — Alto volumen / desc.</option>
                      <option value="2.5">×2.5 — Volumen medio</option>
                      <option value="3.0">×3.0 — Mayorista</option>
                      <option value="3.5">×3.5 — Intermedio</option>
                      <option value="4.0">×4.0 — Minorista</option>
                      <option value="5.0">×5.0 — Llaveros / chicas</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* RESUMEN DESGLOSADO CHOPS */}
            <div className="bg-[#12161f] p-6 rounded-2xl border-2 border-amber-400 shadow-2xl space-y-4">
              <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-3">Desglose de Costos Chops</h2>
              <div className="space-y-2.5 text-xs text-zinc-300 font-mono">
                <div className="flex justify-between">
                  <span>Precio material ({chopPeso * cantChops}g):</span>
                  <span className="text-white">${costoMatChopTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Precio luz:</span>
                  <span className="text-white">${luzChopTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Desgaste máquina:</span>
                  <span className="text-white">${amortChopTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>Margen de error ({margenErrorPorcentaje}%):</span>
                  <span>+${errorChopTotal.toFixed(2)}</span>
                </div>
                <div className="border-t border-zinc-800 pt-2 flex justify-between font-bold text-zinc-100">
                  <span>Costo total (sin insumos):</span>
                  <span>${costoTotalSinInsumosChop.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Insumos extras (Aluminio + Logos):</span>
                  <span className="text-white">${insumosChopTotal.toFixed(2)}</span>
                </div>
                <div className="border-t border-zinc-800 pt-2 flex justify-between font-bold text-emerald-400">
                  <span>Ganancia ({`×${multiplicadorChopVal}`}):</span>
                  <span>+${chopGananciaFinal.toFixed(2)}</span>
                </div>
                {chopTipoVenta === "mayorista" && (
                  <div className="text-amber-400 text-[11px] pt-1">
                    ⚠️ Descuento mayorista (-{chopDescuentoMayorista}%) aplicado.
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-b from-amber-500 to-amber-300 p-4 rounded-xl text-center shadow-lg">
                <span className="text-[11px] text-black uppercase font-extrabold tracking-wider block">Precio Venta Total Chops</span>
                <div className="text-3xl font-black text-black">${chopVentaFinal.toFixed(2)}</div>
                <div className="text-xs text-amber-950 font-bold mt-1">
                  (${(chopVentaFinal / cantChops).toFixed(2)} c/u)
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => guardarRegistro("cotizaciones", {
                    nombreModelo: `${chopNombre} (${cantChops}u - ${chopTipoVenta})`,
                    cliente: chopCliente || "Catálogo",
                    material: `PLA + Aluminio + Logos (×${multiplicadorChopVal})`,
                    peso: `${chopPeso * cantChops}g`,
                    tiempoTotal: `${Number(chopHoras) * cantChops}h`,
                    costoTotal: chopCostoTotalLote.toFixed(2),
                    gananciaNeta: chopGananciaFinal.toFixed(2),
                    ventaSugerida: chopVentaFinal.toFixed(2),
                    tipo: `Chop ${chopTipoVenta} (×${multiplicadorChopVal})`,
                    rawConfig: { chopPeso, chopCantidad, chopCostoAluminio, chopCostoLogos, chopMargen }
                  })}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  📦 Guardar en Catálogo
                </button>
                <button
                  onClick={() => guardarRegistro("presupuestos", {
                    nombreModelo: `${chopNombre} (${cantChops}u - ${chopTipoVenta})`,
                    cliente: chopCliente || "Pedido Chops",
                    material: `PLA + Aluminio + Logos (×${multiplicadorChopVal})`,
                    peso: `${chopPeso * cantChops}g`,
                    tiempoTotal: `${Number(chopHoras) * cantChops}h`,
                    costoTotal: chopCostoTotalLote.toFixed(2),
                    gananciaNeta: chopGananciaFinal.toFixed(2),
                    ventaSugerida: chopVentaFinal.toFixed(2),
                    tipo: `Chop ${chopTipoVenta} (×${multiplicadorChopVal})`,
                    rawConfig: { chopPeso, chopCantidad, chopCostoAluminio, chopCostoLogos, chopMargen }
                  })}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  📄 Guardar en Presupuestos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SOLAPA LLAVEROS AMS */}
        {pestañaActiva === "llaveros" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#12161f] p-5 rounded-2xl border border-zinc-800 shadow-xl space-y-4">
                <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">🔑 Calculadora Llaveros Multicolor</h2>
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
                    <label className="text-xs text-zinc-400 block mb-1">Costo Packaging C/U ($)</label>
                    <input
                      type="number"
                      value={costoPackaging}
                      onChange={(e) => setCostoPackaging(e.target.value)}
                      className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1 font-bold text-amber-400">Multiplicador Ganancia</label>
                    <select
                      value={llaveroMargen}
                      onChange={(e) => setLlaveroMargen(e.target.value)}
                      className="w-full bg-[#1c212e] border border-amber-500/50 rounded-xl p-3 text-sm text-white font-bold"
                    >
                      <option value="2.0">×2.0 — Alto volumen / desc.</option>
                      <option value="2.5">×2.5 — Volumen medio</option>
                      <option value="3.0">×3.0 — Mayorista</option>
                      <option value="3.5">×3.5 — Intermedio</option>
                      <option value="4.0">×4.0 — Minorista</option>
                      <option value="5.0">×5.0 — Llaveros / chicas</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* RESUMEN DESGLOSADO LLAVEROS */}
            <div className="bg-[#12161f] p-6 rounded-2xl border-2 border-amber-400 shadow-2xl space-y-4">
              <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-3">Desglose Llaveros (Lote)</h2>
              <div className="space-y-2.5 text-xs text-zinc-300 font-mono">
                <div className="flex justify-between">
                  <span>Planchas necesarias:</span>
                  <span className="text-white">{cantidadPlanchasNecesarias} plancha(s)</span>
                </div>
                <div className="flex justify-between">
                  <span>Precio material neto:</span>
                  <span className="text-white">${(baseLlaveros.costoMat).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Precio luz:</span>
                  <span className="text-white">${(baseLlaveros.luz).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Desgaste máquina:</span>
                  <span className="text-white">${(baseLlaveros.amort).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>Margen de error ({margenErrorPorcentaje}%):</span>
                  <span>+${(baseLlaveros.margenErrorVal).toFixed(2)}</span>
                </div>
                <div className="border-t border-zinc-800 pt-2 flex justify-between font-bold text-zinc-100">
                  <span>Costo impresión puro:</span>
                  <span>${costoTotalSinInsumosLlaveros.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Argollas ({cantLlaveros}u c/ganancia):</span>
                  <span className="text-white">${totalArgollas.toFixed(2)}</span>
                </div>
                <div className="border-t border-zinc-800 pt-2 flex justify-between font-bold text-emerald-400">
                  <span>Ganancia ({`×${multiplicadorLlaverosVal}`}):</span>
                  <span>+${llaveroGananciaFinal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Packaging fijo (sin ganancia):</span>
                  <span className="text-white">${totalPackaging.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-gradient-to-b from-amber-500 to-amber-300 p-4 rounded-xl text-center shadow-lg">
                <span className="text-[11px] text-black uppercase font-extrabold tracking-wider block">Precio Venta Total Llaveros</span>
                <div className="text-3xl font-black text-black">${llaveroVentaFinal.toFixed(2)}</div>
                <div className="text-xs text-amber-950 font-bold mt-1">
                  (${precioUnitarioVentaLlavero.toFixed(2)} c/u)
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => guardarRegistro("cotizaciones", {
                    nombreModelo: `${llaveroNombre} (${cantLlaveros}u - ${llaveroColores} cols)`,
                    cliente: llaveroCliente || "Catálogo",
                    material: `${descripcionMaterialLlavero} (×${multiplicadorLlaverosVal})`,
                    peso: `${pesoTotalPedidoLlaveros.toFixed(0)}g (${cantidadPlanchasNecesarias} planchas)`,
                    tiempoTotal: `${tiempoTotalPedidoLlaverosHs.toFixed(1)}h total`,
                    costoTotal: costoTotalProduccionLlaveros.toFixed(2),
                    gananciaNeta: llaveroGananciaFinal.toFixed(2),
                    ventaSugerida: llaveroVentaFinal.toFixed(2),
                    tipo: `Llaveros Plancha (×${multiplicadorLlaverosVal})`,
                    rawConfig: { cantidadLlaverosPedida, pesoTotalPlancha, costoArgolla, costoPackaging, llaveroMargen }
                  })}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  📦 Guardar en Catálogo
                </button>
                <button
                  onClick={() => guardarRegistro("presupuestos", {
                    nombreModelo: `${llaveroNombre} (${cantLlaveros}u - ${llaveroColores} cols)`,
                    cliente: llaveroCliente || "Pedido Llaveros",
                    material: `${descripcionMaterialLlavero} (×${multiplicadorLlaverosVal})`,
                    peso: `${pesoTotalPedidoLlaveros.toFixed(0)}g (${cantidadPlanchasNecesarias} planchas)`,
                    tiempoTotal: `${tiempoTotalPedidoLlaverosHs.toFixed(1)}h total`,
                    costoTotal: costoTotalProduccionLlaveros.toFixed(2),
                    gananciaNeta: llaveroGananciaFinal.toFixed(2),
                    ventaSugerida: llaveroVentaFinal.toFixed(2),
                    tipo: `Llaveros Plancha (×${multiplicadorLlaverosVal})`,
                    rawConfig: { cantidadLlaverosPedida, pesoTotalPlancha, costoArgolla, costoPackaging, llaveroMargen }
                  })}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  📄 Guardar en Presupuestos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HISTORIALES SUPABASE */}
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
                    <th className="p-3">Material & Multiplicador</th>
                    <th className="p-3">Filamento Gastado</th>
                    <th className="p-3">Tiempo</th>
                    <th className="p-3 text-emerald-400">Ganancia</th>
                    <th className="p-3 text-right">Precio Venta</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filtrarHistorial(pestañaActiva === "cotizaciones" ? historialCotizaciones : historialPresupuestos).map((item) => (
                    <tr key={item.id} className="hover:bg-[#1c212e]/50">
                      <td className="p-3 text-zinc-400 text-xs">{new Date(item.created_at).toLocaleDateString()}</td>
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
                      <td className="p-3 font-bold text-amber-400 font-mono text-xs">
                        {item.peso || "N/D"}
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