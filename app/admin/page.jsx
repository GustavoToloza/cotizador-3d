// @ts-nocheck
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function AdminCatalogo() {
  // Estado de Seguridad / Autenticación
  const [estaAutenticado, setEstaAutenticado] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Clave de acceso al Panel Admin
  const CLAVE_ADMIN = "rufus2026"; // 👈 Cambiá esta contraseña por la que vos quieras

  const verificarPassword = (e) => {
    e.preventDefault();
    if (passwordInput === CLAVE_ADMIN) {
      setEstaAutenticado(true);
    } else {
      alert("🔒 Contraseña incorrecta. Acceso denegado.");
    }
  };

  useEffect(() => {
    if (estaAutenticado) {
      cargarProductos();
    }
  }, [estaAutenticado]);

  // Estados del Formulario de Carga
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("Chops");
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [listaCategorias, setListaCategorias] = useState(["Chops", "Mates", "Llaveros", "Soportes", "General"]);
  const [precio, setPrecio] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const cargarProductos = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProductos(data);
      const catsExistentes = Array.from(new Set(data.map((p) => p.categoria).filter(Boolean)));
      setListaCategorias((prev) => Array.from(new Set([...prev, ...catsExistentes])));
    }
    setCargando(false);
  };

  const agregarCategoriaLocal = () => {
    if (nuevaCategoria.trim() && !listaCategorias.includes(nuevaCategoria.trim())) {
      setListaCategorias([...listaCategorias, nuevaCategoria.trim()]);
      setCategoria(nuevaCategoria.trim());
      setNuevaCategoria("");
    }
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !precio) {
      alert("Por favor completa el nombre y el precio.");
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      categoria: categoria || "General",
      precio: Number(precio),
      imagen_url: imagenUrl.trim() || "📦"
    };

    if (editandoId) {
      const { error } = await supabase.from("productos").update(payload).eq("id", editandoId);
      if (error) alert("Error al actualizar: " + error.message);
      else {
        alert("¡Producto actualizado!");
        setEditandoId(null);
      }
    } else {
      const { error } = await supabase.from("productos").insert([payload]);
      if (error) alert("Error al guardar: " + error.message);
      else alert("¡Producto agregado al catálogo!");
    }

    limpiarFormulario();
    cargarProductos();
  };

  const prepararEdicion = (prod) => {
    setEditandoId(prod.id);
    setNombre(prod.nombre);
    setDescripcion(prod.descripcion || "");
    setCategoria(prod.categoria || "General");
    setPrecio(prod.precio);
    setImagenUrl(prod.imagen_url || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const borrarProducto = async (id) => {
    if (confirm("¿Seguro que querés eliminar este producto del catálogo?")) {
      const { error } = await supabase.from("productos").delete().eq("id", id);
      if (error) alert("Error al borrar: " + error.message);
      else cargarProductos();
    }
  };

  const limpiarFormulario = () => {
    setNombre("");
    setDescripcion("");
    setPrecio("");
    setImagenUrl("");
    setEditandoId(null);
  };

  const obtenerPrimeraFoto = (prod) => {
    if (prod.imagenes && Array.isArray(prod.imagenes) && prod.imagenes.length > 0) return prod.imagenes[0];
    if (prod.imagen_url && prod.imagen_url.includes(",")) {
      return prod.imagen_url.split(",")[0].trim();
    }
    return prod.imagen_url;
  };

  // PANTALLA DE BLOQUEO POR CONTRASEÑA
  if (!estaAutenticado) {
    return (
      <div className="min-h-screen bg-[#080a10] text-zinc-100 flex items-center justify-center p-4 font-sans">
        <form onSubmit={verificarPassword} className="bg-[#12161f] p-6 rounded-2xl border border-zinc-800 space-y-4 w-full max-w-sm shadow-2xl">
          <div className="text-center space-y-1">
            <h2 className="text-base font-bold text-amber-400">🔒 Panel Restringido — Rufus Design 3D</h2>
            <p className="text-xs text-zinc-400">Ingresá la contraseña de administración para gestionar productos.</p>
          </div>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Contraseña..."
            className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-xs text-white text-center focus:outline-none focus:border-amber-400"
            autoFocus
          />
          <button type="submit" className="w-full bg-amber-400 hover:bg-amber-300 text-black font-extrabold py-2.5 rounded-xl text-xs cursor-pointer shadow-lg transition-all">
            Ingresar al Panel
          </button>
        </form>
      </div>
    );
  }

  // PANEL ADMIN DESBLOQUEADO
  return (
    <main className="min-h-screen bg-[#080a10] text-zinc-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Admin */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-5 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <span className="bg-gradient-to-r from-amber-400 to-amber-200 text-transparent bg-clip-text">
                Rufus Design 3D
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                Panel Admin 🛠️
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">Cargá, editá y organizá los productos que se ven en la web pública.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
                href="/"
                className="bg-zinc-800 hover:bg-zinc-700 text-xs text-blue-400 font-bold px-3 py-2 rounded-xl border border-zinc-700 transition-all inline-block"
            >
                📊 Ir al Cotizador
            </Link>
            <a
              href="/catalogo"
              target="_blank"
              className="bg-zinc-800 hover:bg-zinc-700 text-xs text-amber-400 font-bold px-4 py-2 rounded-xl border border-zinc-700 transition-all"
            >
              👁️ Ver Catálogo Público ↗
            </a>
            <button
              onClick={() => setEstaAutenticado(false)}
              className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              🚪 Salir
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulario Carga/Edición */}
          <form onSubmit={guardarProducto} className="bg-[#12161f] p-6 rounded-2xl border-2 border-amber-400/80 shadow-2xl space-y-4 h-fit">
            <h2 className="text-base font-bold text-white border-b border-zinc-800 pb-3 flex justify-between items-center">
              <span>{editandoId ? "✏️ Editar Producto" : "➕ Cargar Nuevo Producto"}</span>
              {editandoId && (
                <button type="button" onClick={limpiarFormulario} className="text-xs text-zinc-400 underline">Cancelar</button>
              )}
            </h2>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Nombre del Producto</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Chop Fernet 1L con Aluminio"
                className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Descripción Breve</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Incluye vaso térmico interno de aluminio y acabado mate."
                rows={2}
                className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Categoría</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-xs text-white"
                >
                  {listaCategorias.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Precio ($)</label>
                <input
                  type="number"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  placeholder="12500"
                  className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-xs text-white font-bold"
                  required
                />
              </div>
            </div>

            {/* Crear nueva categoría */}
            <div className="bg-[#1c212e] p-3 rounded-xl space-y-2 border border-zinc-800">
              <label className="text-[11px] text-amber-400 font-bold block">➕ Crear Nueva Categoría</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                  placeholder="Ej: Mates, Souvenirs..."
                  className="w-full bg-[#12161f] border border-zinc-700 rounded-lg p-2 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={agregarCategoriaLocal}
                  className="bg-amber-400 text-black px-3 py-1.5 rounded-lg text-xs font-bold"
                >
                  Añadir
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">URL de la Foto (o Emoji)</label>
              <input
                type="text"
                value={imagenUrl}
                onChange={(e) => setImagenUrl(e.target.value)}
                placeholder="https://... o un emoji 🍺"
                className="w-full bg-[#1c212e] border border-zinc-700 rounded-xl p-3 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer"
            >
              {editandoId ? "💾 Guardar Cambios" : "🚀 Publicar Producto"}
            </button>
          </form>

          {/* Listado de Productos Cargados */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center justify-between">
              <span>📦 Productos Publicados ({productos.length})</span>
              {cargando && <span className="text-xs text-amber-400">Cargando...</span>}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productos.map((prod) => (
                <div key={prod.id} className="bg-[#12161f] border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between shadow-xl">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs bg-zinc-800 text-amber-400 px-2 py-0.5 rounded-md font-semibold">
                        {prod.categoria}
                      </span>
                      <span className="text-base font-black text-emerald-400 font-mono">
                        ${Number(prod.precio).toLocaleString()}
                      </span>
                    </div>

                    {/* Miniatura del producto en el Admin */}
                    {(() => {
                    const fotoAdmin = obtenerPrimeraFoto(prod);
                    return fotoAdmin && fotoAdmin.startsWith("http") ? (
                        <img
                        src={fotoAdmin}
                        alt={prod.nombre}
                        className="w-12 h-12 object-contain rounded-lg border border-zinc-800 bg-[#0c0f17] p-1"
                        />
                    ) : (
                        <div className="w-12 h-12 bg-[#1c212e] rounded-lg flex items-center justify-center text-lg border border-zinc-800">
                        {fotoAdmin || "📦"}
                        </div>
                    );
                    })()}
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-zinc-800">
                    <button
                      onClick={() => prepararEdicion(prod)}
                      className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1 rounded-lg text-xs font-bold transition-all"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => borrarProducto(prod.id)}
                      className="bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-3 py-1 rounded-lg text-xs font-bold transition-all"
                    >
                      🗑️ Borrar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}